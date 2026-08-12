import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RecordArticleViewDto {
  @ApiProperty({ description: 'Anonymous browser visitor identifier', example: 'visitor-7f10d8d6' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  visitorId!: string;
}

export class ArticleViewCountDto {
  @ApiProperty({ example: 128 })
  viewCount!: number;

  @ApiProperty({ example: true, description: 'Whether this request increased the count' })
  counted!: boolean;
}
