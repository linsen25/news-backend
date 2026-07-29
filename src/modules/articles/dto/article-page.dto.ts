import { ApiProperty } from '@nestjs/swagger';
import { ArticleDto } from './article.dto';

export class ArticlePageDto {
  @ApiProperty({ type: [ArticleDto] })
  items!: ArticleDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;
}
