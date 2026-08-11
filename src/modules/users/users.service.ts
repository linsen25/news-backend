import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/database/repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async updateRoles(userId: string, roleIds: string[]) {
    const [user, roles] = await Promise.all([
      this.users.findByIdWithRoles(userId),
      this.users.findRoles(),
    ]);
    if (!user) throw new NotFoundException('User not found');
    const validIds = new Set(roles.map((role) => role.id));
    if (roleIds.some((id) => !validIds.has(id))) {
      throw new BadRequestException('One or more roles do not exist');
    }

    const adminRole = roles.find((role) => role.name === 'Admin');
    const wasAdmin = adminRole && user.roles.some(({ roleId }) => roleId === adminRole.id);
    const remainsAdmin = adminRole && roleIds.includes(adminRole.id);
    if (wasAdmin && !remainsAdmin && await this.users.countUsersWithRole(adminRole.id) <= 1) {
      throw new BadRequestException('Cannot remove the last administrator');
    }
    return this.users.replaceRoles(userId, roleIds);
  }
}
