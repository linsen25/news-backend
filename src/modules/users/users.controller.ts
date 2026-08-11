import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UsersRepository } from '../../infrastructure/database/repositories/users.repository';
import { Permissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../../common/types/domain';
import { PermissionDto } from './dto/permission.dto';
import { RoleDto } from './dto/role.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

const toPermissionDto = (permission: { key: string; module: string; description: string }) => ({
  key: permission.key,
  module: permission.module,
  description: permission.description,
});
const toUserDto = (user: Awaited<ReturnType<UsersRepository['findAllWithRoles']>>[number]) => {
  const roles = user.roles.map(({ role }) => ({
    id: role.id,
    name: role.name,
    permissions: role.permissions.map(({ permission }) => toPermissionDto(permission)),
  }));
  const permissions = Array.from(new Map(
    roles.flatMap((role) => role.permissions).map((permission) => [permission.key, permission]),
  ).values());
  return { id: user.id, username: user.name, email: user.email, roles, permissions };
};

@ApiTags('Users')
@ApiBearerAuth('jwt')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersRepository, private readonly service: UsersService) {}

  @Get()
  @Permissions('users.view')
  @ApiOkResponse({ type: [UserDto] })
  async findAll() { return (await this.users.findAllWithRoles()).map(toUserDto); }

  @Get('roles')
  @Permissions('users.view')
  @ApiOkResponse({ type: [RoleDto] })
  async findRoles() {
    return (await this.users.findRoles()).map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(({ permission }) => toPermissionDto(permission)),
    }));
  }

  @Get('permissions')
  @Permissions('users.view')
  @ApiOkResponse({ type: [PermissionDto] })
  async findPermissions() { return (await this.users.findPermissions()).map(toPermissionDto); }

  @Put(':id/roles')
  @Permissions('users.permissions.manage')
  @ApiOkResponse({ type: UserDto })
  async updateRoles(@Param('id') id: string, @Body() input: UpdateUserRolesDto, @CurrentUser() actor: User) {
    return toUserDto(await this.service.updateRoles(id, input.roleIds, actor, input.email, input.password));
  }
}
