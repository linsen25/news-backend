import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArticleReferenceDto,
  EntityReferenceDto,
} from '../../../common/dto/reference.dto';
import { AuditAction } from '../../../common/types/domain';

export class AuditLogDto {
  @ApiProperty({ example: 'audit-001' })
  id!: string;

  @ApiProperty({ type: EntityReferenceDto })
  user!: EntityReferenceDto;

  @ApiProperty({
    enum: [
      'CREATE_ARTICLE',
      'UPDATE_ARTICLE',
      'SUBMIT_REVIEW',
      'APPROVE_ARTICLE',
      'REJECT_ARTICLE',
      'PUBLISH_ARTICLE',
      'DELETE_ARTICLE',
      'LOGIN',
    ],
  })
  action!: AuditAction;

  @ApiPropertyOptional({ type: ArticleReferenceDto, nullable: true })
  article!: ArticleReferenceDto | null;

  @ApiProperty({ example: '提交文章审核' })
  description!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
