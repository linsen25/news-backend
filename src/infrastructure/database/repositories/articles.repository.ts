import { ConflictException, Injectable } from '@nestjs/common';
import { Article, ArticleStatus, TipTapDocument } from '../../../common/types/domain';
import { PrismaService } from '../prisma.service';
import { Prisma } from '../../../../generated/prisma/client';
import { randomUUID } from 'node:crypto';

const articleInclude = {
  author: true,
  currentEditor: true,
  category: true,
  tags: { include: { tag: true } },
} as const;

type ArticleRecord = Awaited<
  ReturnType<ArticlesRepository['findRecordById']>
>;

@Injectable()
export class ArticlesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Article[]> {
    const rows = await this.prisma.article.findMany({
      include: articleInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findPublished(): Promise<Article[]> {
    const rows = await this.prisma.article.findMany({
      where: {
        status: { not: 'WITHDRAWN' },
        OR: [
          { status: 'PUBLISHED' },
          { publishedSnapshot: { not: Prisma.JsonNull } },
        ],
      },
      include: articleInclude,
      orderBy: { publishedAt: 'desc' },
    });
    return rows.map((row) => this.toPublicDomain(row));
  }

  async findPublishedById(id: string): Promise<Article | null> {
    const row = await this.prisma.article.findFirst({
      where: {
        id,
        status: { not: 'WITHDRAWN' },
        OR: [
          { status: 'PUBLISHED' },
          { publishedSnapshot: { not: Prisma.JsonNull } },
        ],
      },
      include: articleInclude,
    });
    return row ? this.toPublicDomain(row) : null;
  }

  async findPublishedBySlug(slug: string): Promise<Article | null> {
    const row = await this.prisma.article.findFirst({
      where: {
        status: { not: 'WITHDRAWN' },
        OR: [
          { status: 'PUBLISHED', slug },
          { publishedSlug: slug },
        ],
      },
      include: articleInclude,
    });
    return row ? this.toPublicDomain(row) : null;
  }

  async recordPublicViewBySlug(slug: string, visitorId: string): Promise<{ viewCount: number; counted: boolean }> {
    const article = await this.prisma.article.findFirst({
      where: {
        status: { not: 'WITHDRAWN' },
        OR: [
          { status: 'PUBLISHED', slug },
          { publishedSlug: slug },
        ],
      },
      select: { id: true, viewCount: true },
    });
    if (!article) return { viewCount: 0, counted: false };

    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    return this.prisma.$transaction(async (tx) => {
      const recent = await tx.articleView.findFirst({
        where: { articleId: article.id, visitorId, viewedAt: { gte: cutoff } },
        select: { id: true },
      });
      if (recent) {
        const current = await tx.article.findUniqueOrThrow({ where: { id: article.id }, select: { viewCount: true } });
        return { viewCount: current.viewCount, counted: false };
      }
      await tx.articleView.create({ data: { articleId: article.id, visitorId } });
      const updated = await tx.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
        select: { viewCount: true },
      });
      return { viewCount: updated.viewCount, counted: true };
    });
  }

  async findPage(input: {
    page: number;
    limit: number;
    status?: string;
    categoryId?: string;
    authorId?: string;
    reviewOnly?: boolean;
    search?: string;
  }): Promise<{ items: Article[]; total: number }> {
    const where: Prisma.ArticleWhereInput = {
      status: input.status
        ? (input.status.toUpperCase() as never)
        : input.reviewOnly
          ? { in: ['REVIEW', 'APPROVED'] }
          : undefined,
      categoryId: input.categoryId,
      authorId: input.authorId,
      OR: input.search
        ? [
            { title: { contains: input.search, mode: 'insensitive' } },
            { summary: { contains: input.search, mode: 'insensitive' } },
            { byline: { contains: input.search, mode: 'insensitive' } },
            { author: { name: { contains: input.search, mode: 'insensitive' } } },
            { currentEditor: { name: { contains: input.search, mode: 'insensitive' } } },
            { category: { name: { contains: input.search, mode: 'insensitive' } } },
            { tags: { some: { tag: { name: { contains: input.search, mode: 'insensitive' } } } } },
          ]
        : undefined,
    };
    const { rows, total } = await this.prisma.$transaction(async (tx) => {
      const rows = await tx.article.findMany({
        where,
        include: articleInclude,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });
      const total = await tx.article.count({ where });
      return { rows, total };
    });
    return { items: rows.map((row) => this.toDomain(row)), total };
  }

  async findById(id: string): Promise<Article | null> {
    const row = await this.findRecordById(id);
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const row = await this.prisma.article.findUnique({
      where: { slug },
      include: articleInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  findRecordById(id: string) {
    return this.prisma.article.findUnique({
      where: { id },
      include: articleInclude,
    });
  }

  async create(input: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    content: TipTapDocument;
    coverImage: string;
    coverFocalX: number;
    coverFocalY: number;
    isHeadline: boolean;
    homepagePriority: number;
    byline: string;
    articleDate: Date;
    authorId: string;
    currentEditorId: string;
    categoryId: string;
    tagIds: string[];
    mediaUrls: string[];
    audit: { userId: string; description: string };
  }): Promise<Article> {
    const row = await this.prisma.$transaction(async (tx) => {
      const media = await tx.mediaAsset.findMany({
        where: { url: { in: input.mediaUrls } },
        select: { id: true },
      });
      const article = await tx.article.create({
        data: {
          id: input.id,
          title: input.title,
          slug: input.slug,
          summary: input.summary,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
          keywords: input.keywords,
          content: input.content as object,
          coverImage: input.coverImage,
          coverFocalX: input.coverFocalX,
          coverFocalY: input.coverFocalY,
          isHeadline: input.isHeadline,
          homepagePriority: input.homepagePriority,
          byline: input.byline,
          articleDate: input.articleDate,
          authorId: input.authorId,
          currentEditorId: input.currentEditorId,
          categoryId: input.categoryId,
          tags: {
            create: input.tagIds.map((tagId) => ({ tagId })),
          },
          mediaAssets: {
            create: media.map(({ id }) => ({ mediaAssetId: id })),
          },
        },
        include: articleInclude,
      });
      await tx.auditLog.create({
        data: {
          id: randomUUID(),
          userId: input.audit.userId,
          action: 'CREATE_ARTICLE',
          articleId: article.id,
          description: input.audit.description,
        },
      });
      return article;
    });
    return this.toDomain(row);
  }

  async update(
    id: string,
    input: {
      title?: string;
      slug?: string;
      summary?: string;
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
      content?: TipTapDocument;
      coverImage?: string;
      coverFocalX?: number;
      coverFocalY?: number;
      isHeadline?: boolean;
      homepagePriority?: number;
      byline?: string;
      articleDate?: Date;
      currentEditorId: string;
      categoryId?: string;
      tagIds?: string[];
      status?: ArticleStatus;
      publishedAt?: Date | null;
      publishedSnapshot?: Article | null;
      publishedSlug?: string | null;
      withdrawalReason?: string | null;
      withdrawnAt?: Date | null;
      mediaUrls?: string[];
      expectedUpdatedAt?: Date;
      audit: { userId: string; description: string };
    },
  ): Promise<Article> {
    const row = await this.prisma.$transaction(async (tx) => {
      if (input.expectedUpdatedAt) {
        const current = await tx.article.findUnique({
          where: { id },
          select: { updatedAt: true },
        });
        if (!current || current.updatedAt.getTime() !== input.expectedUpdatedAt.getTime()) {
          throw new ConflictException('文章已被其他编辑修改，请刷新后再保存');
        }
      }
      if (input.tagIds) {
        await tx.articleTag.deleteMany({ where: { articleId: id } });
      }
      if (input.mediaUrls) {
        await tx.articleMedia.deleteMany({ where: { articleId: id } });
      }
      const media = input.mediaUrls
        ? await tx.mediaAsset.findMany({
            where: { url: { in: input.mediaUrls } },
            select: { id: true },
          })
        : [];
      const article = await tx.article.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          summary: input.summary,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
          keywords: input.keywords,
          content: input.content as object | undefined,
          coverImage: input.coverImage,
          coverFocalX: input.coverFocalX,
          coverFocalY: input.coverFocalY,
          isHeadline: input.isHeadline,
          homepagePriority: input.homepagePriority,
          byline: input.byline,
          articleDate: input.articleDate,
          currentEditorId: input.currentEditorId,
          categoryId: input.categoryId,
          status: input.status?.toUpperCase() as never,
          publishedAt: input.publishedAt,
          publishedSnapshot: input.publishedSnapshot === null
            ? Prisma.JsonNull
            : input.publishedSnapshot as unknown as Prisma.InputJsonValue | undefined,
          publishedSlug: input.publishedSlug,
          withdrawalReason: input.withdrawalReason,
          withdrawnAt: input.withdrawnAt,
          tags: input.tagIds
            ? { create: input.tagIds.map((tagId) => ({ tagId })) }
            : undefined,
          mediaAssets: input.mediaUrls
            ? { create: media.map(({ id }) => ({ mediaAssetId: id })) }
            : undefined,
        },
        include: articleInclude,
      });
      await tx.auditLog.create({
        data: {
          id: randomUUID(),
          userId: input.audit.userId,
          action: 'UPDATE_ARTICLE',
          articleId: article.id,
          description: input.audit.description,
        },
      });
      await tx.articleRevision.create({
        data: {
          id: randomUUID(),
          articleId: article.id,
          editorId: input.currentEditorId,
          note: '保存草稿',
          contentSnapshot: article.content as Prisma.InputJsonValue,
          articleSnapshot: {
            title: article.title,
            slug: article.slug,
            summary: article.summary,
            metaTitle: article.metaTitle,
            metaDescription: article.metaDescription,
            keywords: article.keywords,
            content: article.content,
            coverImage: article.coverImage,
            coverFocalX: article.coverFocalX,
            coverFocalY: article.coverFocalY,
            isHeadline: article.isHeadline,
            homepagePriority: article.homepagePriority,
            byline: article.byline,
            articleDate: article.articleDate.toISOString(),
            categoryId: article.categoryId,
            tagIds: article.tags.map(({ tagId }) => tagId),
          },
        },
      });
      return article;
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.article.delete({ where: { id } });
  }

  async findWithdrawalBySlug(slug: string) {
    return this.prisma.article.findFirst({
      where: { status: 'WITHDRAWN', OR: [{ slug }, { publishedSlug: slug }] },
      select: { title: true, slug: true, publishedSlug: true, withdrawalReason: true, withdrawnAt: true },
    });
  }

  private toDomain(row: NonNullable<ArticleRecord>): Article {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      keywords: row.keywords,
      content: row.content as unknown as TipTapDocument,
      coverImage: row.coverImage,
      coverFocalX: row.coverFocalX,
      coverFocalY: row.coverFocalY,
      isHeadline: row.isHeadline,
      homepagePriority: row.homepagePriority,
      byline: row.byline,
      articleDate: row.articleDate.toISOString(),
      author: { id: row.author.id, name: row.author.name },
      currentEditor: {
        id: row.currentEditor.id,
        name: row.currentEditor.name,
      },
      category: {
        id: row.category.id,
        name: row.category.name,
        nameEn: row.category.nameEn,
        slug: row.category.slug,
      },
      tags: row.tags.map(({ tag }) => ({
        id: tag.id,
        name: tag.name,
        nameEn: tag.nameEn,
        slug: tag.slug,
      })),
      status: row.status.toLowerCase() as ArticleStatus,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
      hasPublishedVersion: row.status !== 'WITHDRAWN' && Boolean(row.publishedSnapshot),
      viewCount: row.viewCount,
      lastViewedAt: row.lastViewedAt?.toISOString() ?? null,
    };
  }

  private toPublicDomain(row: NonNullable<ArticleRecord>): Article {
    if (row.status !== 'PUBLISHED' && row.publishedSnapshot) {
      return {
        ...(row.publishedSnapshot as unknown as Article),
        coverFocalX: row.coverFocalX,
        coverFocalY: row.coverFocalY,
        isHeadline: row.isHeadline,
        homepagePriority: row.homepagePriority,
        viewCount: row.viewCount,
        lastViewedAt: row.lastViewedAt?.toISOString() ?? null,
      };
    }
    return this.toDomain(row);
  }
}
