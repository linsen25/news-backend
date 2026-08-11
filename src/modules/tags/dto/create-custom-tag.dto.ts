import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCustomTagDto {
  @ApiProperty({ example: '量子计算' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @ApiProperty({ example: 'cat-tech' })
  @IsString()
  categoryId!: string;
}
