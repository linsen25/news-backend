import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  Article,
  ArticleStatus,
  AuditAction,
  User,
} from '../../../common/types/domain';
import { PrismaService } from '../prisma.service';
import { ArticlesRepository } from './articles.repository';

@Injectable()
export class ArticleWorkflowRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly articles: ArticlesRepository,
  ) {}

  async transition(input: {
    article: Article;
    actor: Pick<User, 'id' | 'name'>;
    status: ArticleStatus;
    action: AuditAction;
    description: string;
    revisionNote: string;
    reviewComment?: string;
    publishedAt?: Date;
  }): Promise<Article> {
    await this.prisma.$transaction(async (tx) => {
      await tx.article.update({
        where: { id: input.article.id },
        data: {
          status: input.status.toUpperCase() as never,
          currentEditorId: input.actor.id,
          publishedAt: input.publishedAt,
        },
      });
      await tx.articleRevision.create({
        data: {
          id: randomUUID(),
          articleId: input.article.id,
          editorId: input.actor.id,
          note: input.revisionNote,
          contentSnapshot: input.article.content as object,
        },
      });
      if (input.reviewComment) {
        await tx.reviewComment.create({
          data: {
            id: randomUUID(),
            articleId: input.article.id,
            reviewerId: input.actor.id,
            content: input.reviewComment,
          },
        });
      }
      await tx.auditLog.create({
        data: {
          id: randomUUID(),
          userId: input.actor.id,
          action: input.action as never,
          articleId: input.article.id,
          description: input.description,
        },
      });
    });

    const updated = await this.articles.findById(input.article.id);
    if (!updated) {
      throw new NotFoundException(`Article ${input.article.id} not found`);
    }
    return updated;
  }

  async delete(
    article: Article,
    actor: Pick<User, 'id' | 'name'>,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.article.delete({ where: { id: article.id } });
      await tx.auditLog.create({
        data: {
          id: randomUUID(),
          userId: actor.id,
          action: 'DELETE_ARTICLE',
          articleId: null,
          description: `删除文章《${article.title}》（${article.id}）`,
        },
      });
    });
  }
}
