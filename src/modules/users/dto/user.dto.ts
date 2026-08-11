import { ApiProperty } from '@nestjs/swagger';
import { PermissionDto } from './permission.dto';
import { RoleDto } from './role.dto';

export class UserDto {
  @ApiProperty({ example: 'user-author' })
  id!: string;

  @ApiProperty({ example: '林作者', description: 'Display username' })
  username!: string;

  @ApiProperty({ example: 'author@example.com' })
  email!: string;

  @ApiProperty({ type: [RoleDto] })
  roles!: RoleDto[];

  @ApiProperty({ type: [PermissionDto] })
  permissions!: PermissionDto[];
}
