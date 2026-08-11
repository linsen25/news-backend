import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class WithdrawArticleDto {
  @ApiProperty({ example: '部分事实需要进一步核实。', minLength: 2 })
  @IsString()
  @MinLength(2)
  reason!: string;
}
