import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectArticleDto {
  @ApiProperty({ example: '图片版权不明确，请补充来源。', minLength: 2 })
  @IsString()
  @MinLength(2)
  comment!: string;
}
