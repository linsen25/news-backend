import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuditAction, AuditLog, User } from '../../common/types/domain';
import { AuditLogsRepository } from '../../infrastructure/database/repositories/audit-logs.repository';
import { AuditLogDto } from './dto/audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private readonly logs: AuditLogsRepository) {}

  record(
    user: Pick<User, 'id' | 'name'>,
    action: AuditAction,
    description: string,
    articleId: string | null = null,
    _articleTitle?: string,
  ): Promise<AuditLog> {
    return this.logs.create({
      id: randomUUID(),
      userId: user.id,
      action,
      articleId,
      description,
    });
  }

  findByArticle(articleId: string): Promise<AuditLog[]> {
    return this.logs.findByArticle(articleId);
  }

  findAll(): Promise<AuditLog[]> {
    return this.logs.findAll();
  }

  toDto(log: AuditLog, articleTitle?: string): AuditLogDto {
    return {
      id: log.id,
      user: { id: log.userId, name: log.userName },
      action: log.action,
      article: log.articleId
        ? {
            id: log.articleId,
            title: articleTitle ?? this.titleFromDescription(log.description),
          }
        : null,
      description: log.description,
      createdAt: log.createdAt,
    } as AuditLogDto;
  }

  async findAllDto(): Promise<AuditLogDto[]> {
    return (await this.logs.findAll()).map((log) => this.toDto(log));
  }

  async findByArticleDto(
    articleId: string,
    title: string,
  ): Promise<AuditLogDto[]> {
    return (await this.logs.findByArticle(articleId)).map((log) =>
      this.toDto(log, title),
    );
  }

  private titleFromDescription(description: string): string {
    return description.match(/《(.+?)》/)?.[1] ?? '文章';
  }
}
