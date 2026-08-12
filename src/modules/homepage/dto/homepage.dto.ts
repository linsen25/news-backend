import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ArticleDto } from '../../articles/dto/article.dto';

export const HOMEPAGE_SECTIONS = ['headline_main', 'headline_secondary', 'category_featured'] as const;
export type HomepageSection = typeof HOMEPAGE_SECTIONS[number];

export class HomepageSlotInputDto {
  @ApiProperty({ enum: HOMEPAGE_SECTIONS })
  @IsIn(HOMEPAGE_SECTIONS)
  section!: HomepageSection;

  @ApiProperty({ example: 'global', description: 'global，或分类 ID' })
  @IsString()
  scope!: string;

  @ApiProperty({ minimum: 0, maximum: 9 })
  @IsInt()
  @Min(0)
  @Max(9)
  position!: number;

  @ApiProperty()
  @IsString()
  articleId!: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  @IsDateString()
  @IsOptional()
  startsAt?: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  @IsDateString()
  @IsOptional()
  endsAt?: string | null;
}

export class UpdateHomepageLayoutDto {
  @ApiProperty({ type: [HomepageSlotInputDto] })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => HomepageSlotInputDto)
  slots!: HomepageSlotInputDto[];
}

export class HomepageSlotDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: HOMEPAGE_SECTIONS })
  section!: HomepageSection;

  @ApiProperty()
  scope!: string;

  @ApiProperty()
  position!: number;

  @ApiProperty({ type: ArticleDto })
  article!: ArticleDto;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  startsAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  endsAt!: string | null;
}

export class HomepageLayoutDto {
  @ApiProperty({ type: [HomepageSlotDto] })
  slots!: HomepageSlotDto[];
}
