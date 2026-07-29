import { Injectable } from '@nestjs/common';
import { ReviewComment } from '../../../common/types/domain';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewCommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    id: string;
    articleId: string;
    reviewerId: string;
    content: string;
  }): Promise<ReviewComment> {
    const row = await this.prisma.reviewComment.create({
      data: input,
      include: { reviewer: true },
    });
    return this.toDomain(row);
  }

  async findByArticle(articleId: string): Promise<ReviewComment[]> {
    const rows = await this.prisma.reviewComment.findMany({
      where: { articleId },
      include: { reviewer: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: {
    id: string;
    articleId: string;
    reviewerId: string;
    reviewer: { name: string };
    content: string;
    createdAt: Date;
  }): ReviewComment {
    return {
      id: row.id,
      articleId: row.articleId,
      reviewerId: row.reviewerId,
      reviewerName: row.reviewer.name,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
