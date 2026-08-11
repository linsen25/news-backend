import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Article, ArticleStatus, User } from '../../common/types/domain';
import { ArticlesRepository } from '../../infrastructure/database/repositories/articles.repository';
import { CatalogRepository } from '../../infrastructure/database/repositories/catalog.repository';
import { ArticleWorkflowRepository } from '../../infrastructure/database/repositories/article-workflow.repository';
import { AuditService } from '../audit/audit.service';
import { PermissionsService } from '../auth/permissions.service';
import { ReviewCommentsService } from '../review-comments/review-comments.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly permissions: PermissionsService,
    private readonly audit: AuditService,
    private readonly reviewComments: ReviewCommentsService,
    private readonly articles: ArticlesRepository,
    private readonly catalog: CatalogRepository,
    private readonly workflow: ArticleWorkflowRepository,
  ) {}

  async findAll(actor: User, query: ArticleQueryDto) {
    const isAdmin = this.permissions.has(actor, 'users.permissions.manage');
    const isReviewer =
      !isAdmin && this.permissions.has(actor, 'articles.review.view');
    if (
      isReviewer &&
      query.status &&
      !['review', 'approved', 'rejected'].includes(query.status)
    ) {
      return { items: [], total: 0, page: query.page, limit: query.limit };
    }
    const result = await this.articles.findPage({
      page: query.page,
      limit: query.limit,
      status: query.status,
      categoryId: query.categoryId,
      authorId: !isAdmin && !isReviewer ? actor.id : undefined,
      reviewOnly: isReviewer && !query.status,
    });
    return {
      items: result.items,
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findOne(id: string, actor?: User): Promise<Article> {
    const article = await this.articles.findById(id);
    if (!article) throw new NotFoundException(`Article ${id} not found`);
    if (actor && !this.canView(actor, article)) {
      throw new ForbiddenException('Cannot view this article');
    }
    return article;
  }

  async create(input: CreateArticleDto, actor: User): Promise<Article> {
    await this.requireCategory(input.categoryId);
    await this.requireTags(input.tagIds, input.categoryId);
    const article = await this.articles.create({
      id: randomUUID(),
      title: input.title,
      slug: input.slug || this.toSlug(input.title),
      summary: input.summary ?? '',
      metaTitle: input.metaTitle?.trim() || input.title,
      metaDescription: input.metaDescription?.trim() || input.summary || '',
      keywords: input.keywords ?? [],
      content: input.content ?? {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      },
      coverImage: input.coverImage ?? '',
      byline: input.byline?.trim() || actor.name,
      articleDate: input.articleDate ? new Date(input.articleDate) : new Date(),
      authorId: actor.id,
      currentEditorId: actor.id,
      categoryId: input.categoryId,
      tagIds: input.tagIds,
      mediaUrls: this.extractMediaUrls(
        input.content ?? { type: 'doc', content: [{ type: 'paragraph' }] },
        input.coverImage ?? '',
      ),
    });
    await this.audit.record(
      actor,
      'CREATE_ARTICLE',
      `创建文章《${article.title}》`,
      article.id,
      article.title,
    );
    return article;
  }

  async update(
    id: string,
    input: UpdateArticleDto,
    actor: User,
  ): Promise<Article> {
    const article = await this.findOne(id, actor);
    if (
      article.author.id !== actor.id &&
      !this.permissions.has(actor, 'users.permissions.manage')
    ) {
      throw new ForbiddenException('Authors can only edit their own articles');
    }
    if (!['draft', 'rejected', 'published'].includes(article.status)) {
      throw new BadRequestException(
        'Only draft, rejected, or published articles can be edited',
      );
    }
    const categoryId = input.categoryId ?? article.category.id;
    const tagIds = input.tagIds ?? article.tags.map((tag) => tag.id);
    await this.requireCategory(categoryId);
    await this.requireTags(tagIds, categoryId);

    const updated = await this.articles.update(id, {
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      keywords: input.keywords,
      content: input.content,
      coverImage: input.coverImage,
      byline: input.byline?.trim(),
      articleDate: input.articleDate ? new Date(input.articleDate) : undefined,
      currentEditorId: actor.id,
      categoryId: input.categoryId,
      tagIds: input.tagIds,
      status: 'draft',
      publishedAt: article.status === 'published' ? null : undefined,
      mediaUrls: this.extractMediaUrls(
        input.content ?? article.content,
        input.coverImage ?? article.coverImage,
      ),
    });
    await this.audit.record(
      actor,
      'UPDATE_ARTICLE',
      `修改文章《${updated.title}》`,
      updated.id,
      updated.title,
    );
    return updated;
  }

  async submit(id: string, actor: User): Promise<Article> {
    const article = await this.findOne(id, actor);
    if (article.author.id !== actor.id) {
      throw new ForbiddenException('Authors can only submit their own articles');
    }
    this.requireTransition(article.status, ['draft', 'rejected'], 'review');
    return this.workflow.transition({
      article,
      actor,
      status: 'review',
      action: 'SUBMIT_REVIEW',
      description: `提交文章《${article.title}》审核`,
      revisionNote: '提交审核',
    });
  }

  async approve(id: string, actor: User): Promise<Article> {
    const article = await this.findOne(id, actor);
    this.requireTransition(article.status, ['review'], 'approved');
    return this.workflow.transition({
      article,
      actor,
      status: 'approved',
      action: 'APPROVE_ARTICLE',
      description: `审核通过文章《${article.title}》`,
      revisionNote: '审核通过',
    });
  }

  async reject(
    id: string,
    actor: User,
    comment: string,
  ): Promise<Article> {
    const article = await this.findOne(id, actor);
    this.requireTransition(article.status, ['review'], 'rejected');
    return this.workflow.transition({
      article,
      actor,
      status: 'rejected',
      action: 'REJECT_ARTICLE',
      description: `退回文章《${article.title}》：${comment}`,
      revisionNote: `审核退回：${comment}`,
      reviewComment: comment,
    });
  }

  async publish(id: string, actor: User): Promise<Article> {
    const article = await this.findOne(id, actor);
    this.requireTransition(article.status, ['approved'], 'published');
    return this.workflow.transition({
      article,
      actor,
      status: 'published',
      action: 'PUBLISH_ARTICLE',
      description: `发布文章《${article.title}》`,
      revisionNote: '正式发布',
      publishedAt: new Date(),
    });
  }

  async getHistory(id: string, actor: User) {
    const article = await this.findOne(id, actor);
    const [auditLogs, reviewComments] = await Promise.all([
      this.audit.findByArticleDto(id, article.title),
      this.reviewComments.findByArticleDto(id, article.title),
    ]);
    return { auditLogs, reviewComments };
  }

  async findPublished(): Promise<Article[]> {
    return (await this.articles.findAll()).filter(
      (article) => article.status === 'published',
    );
  }

  async findPublishedOne(id: string): Promise<Article> {
    const article = await this.findOne(id);
    if (article.status !== 'published') {
      throw new NotFoundException(`Published article ${id} not found`);
    }
    return article;
  }

  async findPublishedBySlug(slug: string): Promise<Article> {
    const article = await this.articles.findBySlug(slug);
    if (!article || article.status !== 'published') {
      throw new NotFoundException(`Published article ${slug} not found`);
    }
    return article;
  }

  async remove(id: string, actor: User): Promise<void> {
    if (!this.permissions.has(actor, 'users.permissions.manage')) {
      throw new ForbiddenException('Only admins can delete articles');
    }
    const article = await this.findOne(id);
    await this.workflow.delete(article, actor);
  }

  private async requireCategory(id: string): Promise<void> {
    if (!(await this.catalog.findCategory(id))) {
      throw new NotFoundException(`Category ${id} not found`);
    }
  }

  private async requireTags(ids: string[], categoryId: string): Promise<void> {
    if (!ids.length) throw new BadRequestException('At least one tag is required');
    await Promise.all(
      ids.map(async (id) => {
        const tag = await this.catalog.findTag(id);
        if (!tag) {
          throw new NotFoundException(`Tag ${id} not found`);
        }
        if (tag.categoryId !== categoryId) {
          throw new BadRequestException(`Tag ${id} does not belong to the selected category`);
        }
      }),
    );
  }

  private canView(actor: User, article: Article): boolean {
    if (this.permissions.has(actor, 'users.permissions.manage')) return true;
    if (
      this.permissions.has(actor, 'articles.review.view') &&
      ['review', 'approved', 'rejected'].includes(article.status)
    ) {
      return true;
    }
    return (
      this.permissions.has(actor, 'articles.view.own') &&
      article.author.id === actor.id
    );
  }

  private requireTransition(
    current: ArticleStatus,
    from: ArticleStatus[],
    to: ArticleStatus,
  ): void {
    if (!from.includes(current)) {
      throw new BadRequestException(
        `Cannot transition article from ${current} to ${to}`,
      );
    }
  }

  private toSlug(title: string): string {
    const normalized = title
      .trim()
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-|-$/g, '');
    return normalized || randomUUID();
  }

  private extractMediaUrls(
    content: Article['content'],
    coverImage: string,
  ): string[] {
    const urls = new Set<string>();
    if (coverImage) urls.add(coverImage);
    const visit = (node: {
      type?: string;
      attrs?: Record<string, unknown>;
      content?: unknown[];
    }) => {
      if (node.type === 'image' && typeof node.attrs?.src === 'string') {
        urls.add(node.attrs.src);
      }
      node.content?.forEach((child) =>
        visit(child as Parameters<typeof visit>[0]),
      );
    };
    visit(content);
    return [...urls];
  }
}
