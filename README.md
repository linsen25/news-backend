# news-backend

## Multi-role authorization

Users have display names and can be assigned more than one role through the
`user_roles` join table. Effective permissions are the union of every assigned
role. For example, one person can be both `Author` and `Reviewer`; `Admin`
grants the complete management set. `PUT /api/users/:id/roles` replaces a
user's role assignments and prevents removal of the final administrator.

All roles can view the review center, media library, and account directory.
Write operations remain protected by granular permissions such as
`articles.review.decide`, `media.upload`, `media.delete`, and
`users.permissions.manage`.

Deploy the database migration before starting the new application version:

```bash
npx prisma migrate deploy
npm run db:seed
```

NestJS 新闻 API。当前使用 PostgreSQL + Prisma Repository 持久化数据；`src/mock` 仅保留为开发 Seed fixtures。User → Role → Permission、资源归属及 `draft → review → approved/rejected → published` 状态流保持不变。

```bash
npm install
npm run start:dev
```

服务默认运行在 `http://localhost:3001/api`。受保护请求使用 JWT Bearer Token，权限由数据库中的 Role → Permission 关系加载。模块边界包括 auth、users、articles、categories、tags、upload 和 revisions；持久化实现位于 `infrastructure/database`，upload 模块仍保留为 Cloudinary 适配入口。

`audit` 模块记录创建、修改、提交、通过、退回、发布和登录行为；`review-comments` 模块保存独立审核意见。退回请求必须提交 `{ "comment": "原因" }`。`GET /articles/:id/history` 返回文章日志与审核意见，`GET /audit-logs` 为管理员全局日志接口。
# Swagger and contract generation

Start the service and open:

- Swagger UI: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/openapi.json`

To create the checked-in specification without starting an HTTP server:

```bash
npm run openapi:generate
```

This writes `openapi/openapi.json`. Controllers describe operations and status
codes, while DTO classes under each module's `dto` directory define the
schemas. The contract currently documents Auth, Articles, Review, Users, and
Audit APIs. Runtime storage uses Prisma and authentication uses JWT Bearer tokens.
# JWT authentication

`POST /api/auth/login` verifies the bcrypt password hash and returns
`{ accessToken, user }`. Protected APIs require
`Authorization: Bearer <accessToken>`.

Configuration:

```bash
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=2h
```

The three seeded development users use password `123456`. `JwtAuthGuard`
authenticates the request globally, `JwtStrategy` resolves the current database user, and
`PermissionGuard` enforces controller metadata from `@Permissions(...)`.
Database and Prisma are not connected.
# Prisma database environment

Prisma 7 is initialized in `prisma/schema.prisma`, with connection configuration
in `prisma.config.ts`. PostgreSQL runs through the repository-root
`docker-compose.yml`.

```bash
# From the repository root
docker compose up -d postgres

# From news-backend
npm run prisma:validate
npm run db:status
```

Local connection:

```text
postgresql://news_platform:news_platform_dev@localhost:5432/news_platform?schema=public
```

The initial migration creates users, roles, permissions, role_permissions,
articles, categories, tags, article_tags, article_revisions, audit_logs, and
review_comments. NestJS services now use repositories from
`src/infrastructure/database`; Mock files are seed fixtures only.
# Prisma repository runtime

The backend now uses Prisma repositories for runtime data access:

```text
src/infrastructure/database/
├── database.module.ts
├── prisma.service.ts
└── repositories/
```

Controllers, DTOs, routes, JWT behavior, and the OpenAPI contract remain
unchanged. Domain services retain ownership and workflow checks, while
repositories handle relational queries and persistence.

Bootstrap a fresh development database:

```bash
docker compose up -d postgres
cd news-backend
npm run db:deploy
npm run db:seed
npm run start:dev
```

Mock files under `src/mock` are now seed fixtures only. Runtime modules do not
import them. The seed command is idempotent and preserves the fixed IDs used by
the existing frontend and API tests.
# Phase 7.3 data reliability

Critical article workflow writes live in
`ArticleWorkflowRepository` and execute with `prisma.$transaction()`. Submit,
approve, reject, publish, and delete cannot leave article state, revision,
review-comment, or audit-log writes partially committed.

`PrismaExceptionFilter` is registered globally through `DatabaseModule` and
maps Prisma `P2002`, `P2003`, and `P2025` errors to stable 409/404 API
responses.

Authenticated article listing is paginated:

```http
GET /api/articles?page=1&limit=20
```

```json
{ "items": [], "total": 0, "page": 1, "limit": 20 }
```

Run real PostgreSQL repository tests with:

```bash
npm run test:integration
```
# Cloudinary media module

The Upload module exposes authenticated image upload, media listing, and
deletion:

```http
POST   /api/upload/images
GET    /api/upload/media
DELETE /api/upload/media/:id
```

Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`, and optionally `CLOUDINARY_FOLDER`. Uploads are limited
to 10 MB JPEG/PNG/WebP/GIF files. Cloudinary stores binaries; PostgreSQL stores
metadata in `media_assets`.

`MediaAssetsRepository` maps uploader relations to `MediaAssetDto`.
Cloudinary credentials are validated lazily, so other backend features remain
available when media credentials have not yet been configured.

# Article SEO and media references

`Article` persists `meta_title`, `meta_description`, and PostgreSQL
`keywords[]`; `slug` remains unique. Published content can be resolved with:

```http
GET /api/articles/public/slug/:slug
```

`article_media` has the composite primary key `(article_id, media_asset_id)`.
Article create/update synchronizes references extracted from the cover and
TipTap JSON inside the article transaction. Media DTOs expose
`referenceCount`; `DELETE /api/upload/media/:id` returns 409 while this count is
non-zero.

# Production container

The multi-stage `Dockerfile` installs full dependencies only in the builder,
runs Prisma generation and the Nest build, prunes development dependencies,
then copies only runtime dependencies, compiled output, Prisma schema, and
migrations into the non-root production image.

```bash
docker build -t news-backend .
docker run --env-file .env -p 3001:3001 news-backend
```

Production startup is `npm start` (`node dist/src/main.js`). Apply committed
migrations separately before startup:

```bash
npm run db:deploy
```

`GET /health` checks both the Nest API and PostgreSQL with `SELECT 1`. Configure
production browser origins as a comma-separated `CORS_ORIGINS` value. When the
variable is absent, localhost ports 3000 and 3002 remain allowed for local
development.
