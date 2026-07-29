import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EntityReferenceDto {
  @ApiProperty({ example: 'user-author' })
  id!: string;

  @ApiProperty({ example: '林作者' })
  name!: string;
}

export class CategoryReferenceDto extends EntityReferenceDto {
  @ApiProperty({ example: 'ai' })
  slug!: string;
}

export class TagDto extends CategoryReferenceDto {}

export class TipTapMarkDto {
  @ApiProperty({ example: 'bold' })
  type!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  attrs?: Record<string, unknown>;
}

export class TipTapNodeDto {
  @ApiProperty({ example: 'paragraph' })
  type!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  attrs?: Record<string, unknown>;

  @ApiPropertyOptional({ type: () => [TipTapNodeDto] })
  content?: TipTapNodeDto[];

  @ApiPropertyOptional({ type: () => [TipTapMarkDto] })
  marks?: TipTapMarkDto[];

  @ApiPropertyOptional({ example: '正文内容' })
  text?: string;
}

export class TipTapDocumentDto {
  @ApiProperty({ enum: ['doc'], example: 'doc' })
  type!: 'doc';

  @ApiProperty({ type: () => [TipTapNodeDto] })
  content!: TipTapNodeDto[];
}

export class ArticleReferenceDto {
  @ApiProperty({ example: 'article-001' })
  id!: string;

  @ApiProperty({ example: '生成式 AI 正在改变新闻编辑流程' })
  title!: string;
}
