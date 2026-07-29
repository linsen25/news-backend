import { ApiProperty } from '@nestjs/swagger';
import {
  ArticleReferenceDto,
  EntityReferenceDto,
} from '../../../common/dto/reference.dto';

export class ReviewCommentDto {
  @ApiProperty({ example: 'comment-001' })
  id!: string;

  @ApiProperty({ type: ArticleReferenceDto })
  article!: ArticleReferenceDto;

  @ApiProperty({ type: EntityReferenceDto })
  reviewer!: EntityReferenceDto;

  @ApiProperty({ example: '图片版权不明确，请补充来源。' })
  content!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
