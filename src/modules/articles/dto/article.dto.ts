import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CategoryReferenceDto,
  EntityReferenceDto,
  TagDto,
  TipTapDocumentDto,
} from '../../../common/dto/reference.dto';
import { ArticleStatus } from '../../../common/types/domain';

export const ARTICLE_STATUSES: ArticleStatus[] = [
  'draft',
  'review',
  'approved',
  'rejected',
  'published',
  'withdrawn',
];

export class ArticleDto {
  @ApiProperty({ example: 'article-001' })
  id!: string;

  @ApiProperty({ example: '生成式 AI 正在改变新闻编辑流程' })
  title!: string;

  @ApiProperty({ example: 'generative-ai-newsroom' })
  slug!: string;

  @ApiProperty({ example: '从资料整理到内容校对，AI 正在改变编辑流程。' })
  summary!: string;

  @ApiProperty({ example: '生成式 AI 正在改变新闻编辑流程｜News Platform' })
  metaTitle!: string;

  @ApiProperty({ example: '了解生成式 AI 对新闻编辑流程的影响。' })
  metaDescription!: string;

  @ApiProperty({ type: [String], example: ['AI', '新闻编辑'] })
  keywords!: string[];

  @ApiProperty({ type: TipTapDocumentDto })
  content!: TipTapDocumentDto;

  @ApiProperty({ example: 'https://example.com/cover.jpg' })
  coverImage!: string;

  @ApiProperty({ example: '李明（本报特约记者）' })
  byline!: string;

  @ApiProperty({ format: 'date-time' })
  articleDate!: string;

  @ApiProperty({ enum: ARTICLE_STATUSES, example: 'draft' })
  status!: ArticleStatus;

  @ApiProperty({ type: EntityReferenceDto })
  author!: EntityReferenceDto;

  @ApiProperty({ type: EntityReferenceDto })
  currentEditor!: EntityReferenceDto;

  @ApiProperty({ type: CategoryReferenceDto })
  category!: CategoryReferenceDto;

  @ApiProperty({ type: [TagDto] })
  tags!: TagDto[];

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  publishedAt!: string | null;

  @ApiProperty({ description: '编辑中的文章是否仍有一个旧版本在线展示' })
  hasPublishedVersion!: boolean;
}
