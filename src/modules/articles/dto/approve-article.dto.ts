import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ApproveArticleDto {
  @ApiPropertyOptional({ example: '已核对来源，同意发布。', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  comment?: string;
}
