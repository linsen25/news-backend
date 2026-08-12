import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ArticleStatus, TipTapDocument } from '../../../common/types/domain';
import { TipTapDocumentDto } from '../../../common/dto/reference.dto';

export class CreateArticleDto {
  @ApiProperty({ example: '加拿大 AI 政策更新' })
  @IsString()
  @MaxLength(80, { message: '文章标题不能超过80个字符' })
  title!: string;

  @ApiPropertyOptional({ example: 'canada-ai-policy' })
  @IsString()
  @MaxLength(180, { message: '文章摘要不能超过180个字符' })
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: '政策更新摘要' })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({ example: '加拿大 AI 政策更新｜News Platform' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ example: '了解加拿大最新人工智能政策及其影响。' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String], example: ['加拿大', 'AI', '政策'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ type: TipTapDocumentDto })
  @IsObject()
  @IsOptional()
  content?: TipTapDocument;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ default: 50, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  coverFocalX?: number;

  @ApiPropertyOptional({ default: 50, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  coverFocalY?: number;

  @ApiPropertyOptional({ default: false, description: '管理员设置的首页头条候选' })
  @IsBoolean()
  @IsOptional()
  isHeadline?: boolean;

  @ApiPropertyOptional({ default: 0, minimum: 0, maximum: 999, description: '首页人工排序权重，数值越大越靠前' })
  @IsInt()
  @Min(0)
  @Max(999)
  @IsOptional()
  homepagePriority?: number;

  @ApiPropertyOptional({ example: '李明（本报特约记者）', description: '面向读者展示的文章署名；与后台录入账号分开' })
  @IsString()
  @IsOptional()
  byline?: string;

  @ApiProperty({ example: '2026-08-12T00:00:00.000Z', format: 'date-time', description: '稿件日期；与系统创建时间和发布时间分开' })
  @IsDateString()
  articleDate!: string;

  @ApiProperty({ example: 'user-author' })
  @IsString()
  authorId!: string;

  @ApiPropertyOptional({ example: 'user-author' })
  @IsString()
  @IsOptional()
  currentEditorId?: string;

  @ApiProperty({ example: 'cat-tech' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ type: [String], example: ['tag-openai'] })
  @IsArray()
  @ArrayMinSize(1, { message: '至少选择一个文章标签' })
  @IsString({ each: true })
  tagIds!: string[];

  @ApiPropertyOptional({
    enum: ['draft', 'review', 'approved', 'rejected', 'published', 'withdrawn'],
  })
  @IsIn(['draft', 'review', 'approved', 'rejected', 'published', 'withdrawn'])
  @IsOptional()
  status?: ArticleStatus;
}
