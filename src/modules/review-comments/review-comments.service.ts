import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ReviewComment, User } from '../../common/types/domain';
import { ReviewCommentsRepository } from '../../infrastructure/database/repositories/review-comments.repository';
import { ReviewCommentDto } from './dto/review-comment.dto';

@Injectable()
export class ReviewCommentsService {
  constructor(private readonly comments: ReviewCommentsRepository) {}

  create(
    articleId: string,
    reviewer: Pick<User, 'id' | 'name'>,
    content: string,
  ): Promise<ReviewComment> {
    return this.comments.create({
      id: randomUUID(),
      articleId,
      reviewerId: reviewer.id,
      content,
    });
  }

  findByArticle(articleId: string): Promise<ReviewComment[]> {
    return this.comments.findByArticle(articleId);
  }

  async findByArticleDto(
    articleId: string,
    title: string,
  ): Promise<ReviewCommentDto[]> {
    return (await this.comments.findByArticle(articleId)).map((comment) => ({
      id: comment.id,
      article: { id: articleId, title },
      reviewer: {
        id: comment.reviewerId,
        name: comment.reviewerName,
      },
      content: comment.content,
      createdAt: comment.createdAt,
    })) as ReviewCommentDto[];
  }
}
