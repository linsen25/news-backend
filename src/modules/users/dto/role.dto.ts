import { ApiProperty } from '@nestjs/swagger';
import { PermissionDto } from './permission.dto';

export class RoleDto {
  @ApiProperty({ example: 'role-author' })
  id!: string;

  @ApiProperty({ enum: ['Author', 'Reviewer', 'Admin'] })
  name!: 'Author' | 'Reviewer' | 'Admin';

  @ApiProperty({ type: [PermissionDto] })
  permissions!: PermissionDto[];
}
