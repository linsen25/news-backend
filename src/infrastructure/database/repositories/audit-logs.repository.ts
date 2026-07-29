import { Injectable } from '@nestjs/common';
import { AuditAction, AuditLog } from '../../../common/types/domain';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    id: string;
    userId: string;
    action: AuditAction;
    articleId: string | null;
    description: string;
  }): Promise<AuditLog> {
    const row = await this.prisma.auditLog.create({
      data: { ...input, action: input.action as never },
      include: { user: true },
    });
    return this.toDomain(row);
  }

  async findAll(): Promise<AuditLog[]> {
    const rows = await this.prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findByArticle(articleId: string): Promise<AuditLog[]> {
    const rows = await this.prisma.auditLog.findMany({
      where: { articleId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: {
    id: string;
    userId: string;
    user: { name: string };
    action: string;
    articleId: string | null;
    description: string;
    createdAt: Date;
  }): AuditLog {
    return {
      id: row.id,
      userId: row.userId,
      userName: row.user.name,
      action: row.action as AuditAction,
      articleId: row.articleId,
      description: row.description,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
