import { PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @ApiPropertyOptional({
    format: 'date-time',
    description: '客户端最后读取到的 updatedAt，用于防止覆盖他人的新修改',
  })
  @IsDateString()
  @IsOptional()
  expectedUpdatedAt?: string;
}
