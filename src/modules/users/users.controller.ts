import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UsersRepository } from '../../infrastructure/database/repositories/users.repository';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionDto } from './dto/permission.dto';
import { RoleDto } from './dto/role.dto';
import { UserDto } from './dto/user.dto';

const toPermissionDto = (permission: {
  key: string;
  module: string;
  description: string;
}) => ({
  key: permission.key,
  module: permission.module,
  description: permission.description,
});

@ApiTags('Users')
@ApiBearerAuth('jwt')
@Permissions('users.view')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersRepository) {}

  @Get()
  @ApiOkResponse({ type: [UserDto] })
  async findAll() {
    return (await this.users.findAllWithRole()).map((user) => {
      const permissions = user.role.permissions.map(({ permission }) =>
        toPermissionDto(permission),
      );
      return {
        id: user.id,
        username: user.name,
        email: user.email,
        role: { id: user.role.id, name: user.role.name, permissions },
        permissions,
      };
    });
  }

  @Get('roles')
  @ApiOkResponse({ type: [RoleDto] })
  async findRoles() {
    return (await this.users.findRoles()).map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(({ permission }) =>
        toPermissionDto(permission),
      ),
    }));
  }

  @Get('permissions')
  @ApiOkResponse({ type: [PermissionDto] })
  async findPermissions() {
    return (await this.users.findPermissions()).map(toPermissionDto);
  }
}
