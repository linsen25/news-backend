import { Injectable } from '@nestjs/common';
import { ArticleRevision, TipTapDocument } from '../../../common/types/domain';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RevisionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByArticle(articleId: string): Promise<ArticleRevision[]> {
    const rows = await this.prisma.articleRevision.findMany({
      where: { articleId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      articleId: row.articleId,
      editorId: row.editorId,
      note: row.note,
      contentSnapshot: row.contentSnapshot as unknown as TipTapDocument,
      articleSnapshot: row.articleSnapshot as Record<string, unknown> | null,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
