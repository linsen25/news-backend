import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

jest.setTimeout(60_000);

describe('Articles API (e2e)', () => {
  let app: INestApplication;
  const tokens: Record<'author' | 'reviewer' | 'admin', string> = {
    author: '',
    reviewer: '',
    admin: '',
  };
  let workflowArticleId = '';
  let workflowSlug = '';
  let workflowEditedTitle = '';
  let workflowTitle = '';
  let prisma: PrismaService;

  beforeAll(async () => {
    const testDatabaseUrl = process.env.TEST_DATABASE_URL;
    if (!testDatabaseUrl) {
      throw new Error('TEST_DATABASE_URL is required for E2E tests. Production DATABASE_URL is never used.');
    }
    process.env.DATABASE_URL = testDatabaseUrl;
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    app.setGlobalPrefix('api', {
      exclude: [{ path: 'health', method: RequestMethod.GET }],
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    for (const account of Object.keys(tokens) as Array<keyof typeof tokens>) {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: `${account}@example.com`, password: '123456' })
        .expect(201);
      tokens[account] = response.body.accessToken;
    }
  });

  afterAll(async () => {
    if (workflowArticleId) {
      await request(app.getHttpServer())
        .delete(`/api/articles/${workflowArticleId}`)
        .auth(tokens.admin, { type: 'bearer' });
      await prisma.auditLog.deleteMany({
        where: {
          OR: [
            { description: { contains: workflowArticleId } },
            { description: { contains: workflowTitle } },
          ],
        },
      });
    }
    if (app) await app.close();
  });

  it('GET /api/articles', () =>
    request(app.getHttpServer())
      .get('/api/articles')
      .auth(tokens.admin, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.items.length).toBeGreaterThan(0);
        expect(body.total).toBeGreaterThan(0);
        expect(body.page).toBe(1);
        expect(body.limit).toBe(20);
      }));

  it('reports API and database health', () =>
    request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', database: 'connected' }));

  it('paginates the article list with bounded page metadata', () =>
    request(app.getHttpServer())
      .get('/api/articles')
      .query({ page: 2, limit: 1 })
      .auth(tokens.admin, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.items).toHaveLength(1);
        expect(body.total).toBeGreaterThan(1);
        expect(body.page).toBe(2);
        expect(body.limit).toBe(1);
      }));

  it('creates a JSON draft, previews it, then publishes it', async () => {
    const uniqueSlug = `phase-7-e2e-${Date.now()}`;
    workflowTitle = `Phase 1 闭环测试 ${Date.now()}`;
    const created = await request(app.getHttpServer())
      .post('/api/articles')
      .auth(tokens.author, { type: 'bearer' })
      .send({
        title: workflowTitle,
        slug: uniqueSlug,
        summary: '验证 TipTap JSON 数据流',
        metaTitle: 'Phase 9 SEO 标题',
        metaDescription: '验证 slug 和 SEO API 数据流',
        keywords: ['phase9', 'seo'],
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '正文内容' }],
            },
          ],
        },
        coverImage: 'https://example.com/e2e-cover.jpg',
        articleDate: new Date().toISOString(),
        authorId: 'user-author',
        currentEditorId: 'user-author',
        categoryId: 'cat-tech',
        tagIds: ['tag-openai'],
        status: 'draft',
      })
      .expect(201);

    expect(created.body.content.type).toBe('doc');
    expect(created.body.author.name).toBe('林作者');

    const previewToken = await request(app.getHttpServer())
      .post(`/api/articles/${created.body.id}/preview-token`)
      .auth(tokens.author, { type: 'bearer' })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/articles/${created.body.id}/preview`)
      .query({ token: previewToken.body.token })
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('draft'));

    await request(app.getHttpServer())
      .get(`/api/articles/public/${created.body.id}`)
      .expect(404);

    await request(app.getHttpServer())
      .post(`/api/articles/${created.body.id}/submit`)
      .auth(tokens.author, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('review'));

    await request(app.getHttpServer())
      .post(`/api/articles/${created.body.id}/approve`)
      .auth(tokens.reviewer, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('approved'));

    const published = await request(app.getHttpServer())
      .post(`/api/articles/${created.body.id}/publish`)
      .auth(tokens.admin, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('published');
        expect(body.publishedAt).toBeTruthy();
      });

    await request(app.getHttpServer())
      .get(`/api/articles/public/${created.body.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/articles/public/slug/${uniqueSlug}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.metaTitle).toBe('Phase 9 SEO 标题');
        expect(body.keywords).toEqual(['phase9', 'seo']);
      });

    const editedTitle = `${created.body.title} updated`;
    workflowArticleId = created.body.id;
    workflowSlug = uniqueSlug;
    workflowEditedTitle = editedTitle;
    await request(app.getHttpServer())
      .put(`/api/articles/${created.body.id}`)
      .auth(tokens.author, { type: 'bearer' })
      .send({ title: editedTitle, expectedUpdatedAt: published.body.updatedAt })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('draft');
        expect(body.hasPublishedVersion).toBe(true);
      });

    await request(app.getHttpServer())
      .get(`/api/articles/public/slug/${uniqueSlug}`)
      .expect(200)
      .expect(({ body }) => expect(body.title).toBe(created.body.title));
  });

  it('blocks actions when the JWT user lacks permission', async () => {
    await request(app.getHttpServer())
      .post('/api/articles')
      .auth(tokens.reviewer, { type: 'bearer' })
      .send({
        articleDate: new Date().toISOString(),
        title: '审核员不能创建',
        authorId: 'user-reviewer',
        categoryId: 'cat-tech',
      })
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/users')
      .auth(tokens.author, { type: 'bearer' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/users')
      .auth(tokens.admin, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => expect(body.length).toBeGreaterThanOrEqual(3));
  });

  it('requires a rejection reason and exposes review history', async () => {
    await request(app.getHttpServer())
      .post(`/api/articles/${workflowArticleId}/submit`)
      .auth(tokens.author, { type: 'bearer' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/articles/${workflowArticleId}/reject`)
      .auth(tokens.reviewer, { type: 'bearer' })
      .send({})
      .expect(400);

    await request(app.getHttpServer())
      .post(`/api/articles/${workflowArticleId}/reject`)
      .auth(tokens.reviewer, { type: 'bearer' })
      .send({ comment: '图片版权不明确，请补充来源。' })
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('rejected'));

    await request(app.getHttpServer())
      .get(`/api/articles/${workflowArticleId}/history`)
      .auth(tokens.author, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.reviewComments[0].content).toContain('图片版权');
        expect(body.auditLogs[0].action).toBe('REJECT_ARTICLE');
      });

    await request(app.getHttpServer())
      .post(`/api/articles/${workflowArticleId}/submit`)
      .auth(tokens.author, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/articles/${workflowArticleId}/approve`)
      .auth(tokens.reviewer, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/articles/${workflowArticleId}/publish`)
      .auth(tokens.admin, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/articles/public/slug/${workflowSlug}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.title).toBe(workflowEditedTitle);
        expect(body.hasPublishedVersion).toBe(false);
      });
  });

  it('records login in the global audit log', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'author@example.com', password: '123456' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/audit-logs')
      .auth(tokens.admin, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) =>
        expect(body.some((log: { action: string }) => log.action === 'LOGIN')).toBe(true),
      );
  });

  it('rejects missing, invalid and incorrect credentials', async () => {
    await request(app.getHttpServer()).get('/api/articles').expect(401);
    await request(app.getHttpServer())
      .get('/api/articles')
      .auth('invalid-token', { type: 'bearer' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'author@example.com', password: 'wrong-password' })
      .expect(401);
  });

  it('maps Prisma unique violations to a standard API error', async () => {
    await request(app.getHttpServer())
      .post('/api/articles')
      .auth(tokens.author, { type: 'bearer' })
      .send({
        articleDate: new Date().toISOString(),
        title: 'Duplicate slug',
        slug: 'generative-ai-newsroom',
        authorId: 'user-author',
        categoryId: 'cat-tech',
        tagIds: ['tag-openai'],
      })
      .expect(409)
      .expect(({ body }) => {
        expect(body.code).toBe('P2002');
        expect(body.message).toBe('文章地址标识已经存在');
      });
  });

  it('protects media upload with JWT, permission and file validation', async () => {
    await request(app.getHttpServer()).post('/api/upload/images').expect(401);
    await request(app.getHttpServer())
      .post('/api/upload/images')
      .auth(tokens.reviewer, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .post('/api/upload/images')
      .auth(tokens.author, { type: 'bearer' })
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/upload/media')
      .auth(tokens.author, { type: 'bearer' })
      .expect(200);
  });

  it('exposes homepage layout publicly and protects editorial changes', async () => {
    await request(app.getHttpServer())
      .get('/api/homepage/public')
      .expect(200)
      .expect(({ body }) => expect(Array.isArray(body.slots)).toBe(true));

    const current = await request(app.getHttpServer())
      .get('/api/homepage')
      .auth(tokens.author, { type: 'bearer' })
      .expect(200);

    await request(app.getHttpServer())
      .put('/api/homepage')
      .auth(tokens.author, { type: 'bearer' })
      .send({ slots: [] })
      .expect(403);

    await request(app.getHttpServer())
      .put('/api/homepage')
      .auth(tokens.admin, { type: 'bearer' })
      .send({ slots: current.body.slots.map((slot: Record<string, any>) => ({
        section: slot.section, scope: slot.scope, position: slot.position,
        articleId: slot.article.id, startsAt: slot.startsAt, endsAt: slot.endsAt,
      })) })
      .expect(200);
  });
});
