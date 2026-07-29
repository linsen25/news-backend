import { ApiProperty } from '@nestjs/swagger';
import { AuditLogDto } from '../../audit/dto/audit-log.dto';
import { ReviewCommentDto } from '../../review-comments/dto/review-comment.dto';

export class ArticleHistoryDto {
  @ApiProperty({ type: [AuditLogDto] })
  auditLogs!: AuditLogDto[];

  @ApiProperty({ type: [ReviewCommentDto] })
  reviewComments!: ReviewCommentDto[];
}
