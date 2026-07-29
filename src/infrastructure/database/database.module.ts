import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersRepository } from './repositories/users.repository';
import { CatalogRepository } from './repositories/catalog.repository';
import { ArticlesRepository } from './repositories/articles.repository';
import { AuditLogsRepository } from './repositories/audit-logs.repository';
import { ReviewCommentsRepository } from './repositories/review-comments.repository';
import { RevisionsRepository } from './repositories/revisions.repository';
import { ArticleWorkflowRepository } from './repositories/article-workflow.repository';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { MediaAssetsRepository } from './repositories/media-assets.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UsersRepository,
    CatalogRepository,
    ArticlesRepository,
    AuditLogsRepository,
    ReviewCommentsRepository,
    RevisionsRepository,
    ArticleWorkflowRepository,
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    MediaAssetsRepository,
  ],
  exports: [
    PrismaService,
    UsersRepository,
    CatalogRepository,
    ArticlesRepository,
    AuditLogsRepository,
    ReviewCommentsRepository,
    RevisionsRepository,
    ArticleWorkflowRepository,
    MediaAssetsRepository,
  ],
})
export class DatabaseModule {}
