import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { DatabaseModule } from '../src/infrastructure/database/database.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { UsersRepository } from '../src/infrastructure/database/repositories/users.repository';
import { ArticlesRepository } from '../src/infrastructure/database/repositories/articles.repository';
import { ArticleWorkflowRepository } from '../src/infrastructure/database/repositories/article-workflow.repository';
import { AuditLogsRepository } from '../src/infrastructure/database/repositories/audit-logs.repository';
import { ReviewCommentsRepository } from '../src/infrastructure/database/repositories/review-comments.repository';
import { AuditAction } from '../src/common/types/domain';
import { MediaAssetsRepository } from '../src/infrastructure/database/repositories/media-assets.repository';

describe('Prisma repositories (integration)', () => {
  let prisma: PrismaService;
  let users: UsersRepository;
  let articles: ArticlesRepository;
  let workflow: ArticleWorkflowRepository;
  let auditLogs: AuditLogsRepository;
  let comments: ReviewCommentsRepository;
  let media: MediaAssetsRepository;
  const articleId = `integration-${randomUUID()}`;
  const mediaId = `integration-media-${randomUUID()}`;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
    await module.init();
    prisma = module.get(PrismaService);
    users = module.get(UsersRepository);
    articles = module.get(ArticlesRepository);
    workflow = module.get(ArticleWorkflowRepository);
    auditLogs = module.get(AuditLogsRepository);
    comments = module.get(ReviewCommentsRepository);
    media = module.get(MediaAssetsRepository);
  });

  afterAll(async () => {
    await prisma.article.deleteMany({ where: { id: articleId } });
    await prisma.auditLog.deleteMany({
      where: { description: { contains: articleId } },
    });
    await prisma.mediaAsset.deleteMany({ where: { id: mediaId } });
    await prisma.$disconnect();
  });

  it('loads a user with role permissions', async () => {
    const author = await users.findDomainByEmail('author@example.com');
    expect(author?.roleIds).toContain('role-author');
    expect(author?.permissions).toContain('articles.create');
    expect(author?.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('persists Cloudinary media metadata', async () => {
    const created = await media.create({
      id: mediaId,
      url: `https://res.cloudinary.com/test/image/upload/${mediaId}.jpg`,
      publicId: `news-platform/${mediaId}`,
      filename: 'integration.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      uploadedById: 'user-author',
    });
    expect(created.uploadedBy.id).toBe('user-author');
    expect((await media.findById(mediaId))?.publicId).toContain(mediaId);
  });

  it('creates and updates an article with relational data', async () => {
    const created = await articles.create({
      id: articleId,
      title: 'Repository integration article',
      slug: articleId,
      summary: 'Created by the PostgreSQL integration test',
      metaTitle: 'Repository SEO title',
      metaDescription: 'Repository SEO description',
      keywords: ['integration', 'prisma'],
      content: {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      },
      coverImage: `https://res.cloudinary.com/test/image/upload/${mediaId}.jpg`,
      mediaUrls: [`https://res.cloudinary.com/test/image/upload/${mediaId}.jpg`],
      authorId: 'user-author',
      currentEditorId: 'user-author',
      categoryId: 'cat-tech',
      tagIds: ['tag-openai'],
    });
    expect(created.author.id).toBe('user-author');
    expect(created.tags.map((tag) => tag.id)).toEqual(['tag-openai']);
    expect((await media.findById(mediaId))?._count.articles).toBe(1);

    const updated = await articles.update(articleId, {
      summary: 'Updated through Prisma',
      currentEditorId: 'user-author',
      tagIds: ['tag-immigration'],
    });
    expect(updated.summary).toBe('Updated through Prisma');
    expect(updated.tags.map((tag) => tag.id)).toEqual(['tag-immigration']);
  });

  it('commits review status, revision, comment and audit atomically', async () => {
    const author = await users.findDomainById('user-author');
    const reviewer = await users.findDomainById('user-reviewer');
    expect(author).not.toBeNull();
    expect(reviewer).not.toBeNull();

    const draft = (await articles.findById(articleId))!;
    const review = await workflow.transition({
      article: draft,
      actor: author!,
      status: 'review',
      action: 'SUBMIT_REVIEW',
      description: `integration submit ${articleId}`,
      revisionNote: 'integration submit',
    });
    expect(review.status).toBe('review');

    const rejected = await workflow.transition({
      article: review,
      actor: reviewer!,
      status: 'rejected',
      action: 'REJECT_ARTICLE',
      description: `integration reject ${articleId}`,
      revisionNote: 'integration rejection',
      reviewComment: 'Please add a source.',
    });
    expect(rejected.status).toBe('rejected');
    expect(await comments.findByArticle(articleId)).toHaveLength(1);
    expect(await prisma.articleRevision.count({ where: { articleId } })).toBe(2);
    expect(await auditLogs.findByArticle(articleId)).toHaveLength(2);
  });

  it('rolls back the complete workflow when a transaction step fails', async () => {
    const reviewer = (await users.findDomainById('user-reviewer'))!;
    const before = (await articles.findById(articleId))!;
    const revisionCount = await prisma.articleRevision.count({
      where: { articleId },
    });

    await expect(
      workflow.transition({
        article: before,
        actor: reviewer,
        status: 'approved',
        action: 'INVALID_ACTION' as AuditAction,
        description: `integration rollback ${articleId}`,
        revisionNote: 'must roll back',
      }),
    ).rejects.toBeDefined();

    expect((await articles.findById(articleId))?.status).toBe('rejected');
    expect(
      await prisma.articleRevision.count({ where: { articleId } }),
    ).toBe(revisionCount);
  });

  it('deletes the article and retains a detached delete audit record', async () => {
    const admin = await users.findDomainById('user-admin');
    const article = (await articles.findById(articleId))!;
    await workflow.delete(article, admin!);
    expect(await articles.findById(articleId)).toBeNull();
    const deletion = await prisma.auditLog.findFirst({
      where: {
        action: 'DELETE_ARTICLE',
        description: { contains: articleId },
      },
    });
    expect(deletion?.articleId).toBeNull();
    await media.delete(mediaId);
    expect(await media.findById(mediaId)).toBeNull();
  });
});
