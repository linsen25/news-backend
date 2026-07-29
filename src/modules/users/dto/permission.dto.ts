import { ApiProperty } from '@nestjs/swagger';
import { PermissionKey } from '../../../common/types/domain';

export class PermissionDto {
  @ApiProperty({ example: 'articles.submit' })
  key!: PermissionKey;

  @ApiProperty({
    enum: ['articles.edit', 'articles.review', 'accounts.manage'],
    example: 'articles.edit',
  })
  module!: 'articles.edit' | 'articles.review' | 'accounts.manage';

  @ApiProperty({ example: '提交审核' })
  description!: string;
}
