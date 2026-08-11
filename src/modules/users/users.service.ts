import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../../common/types/domain';
import { UsersRepository } from '../../infrastructure/database/repositories/users.repository';
import { PasswordService } from '../auth/password.service';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository, private readonly passwords: PasswordService) {}

  async create(username: string, email: string, password: string, roleIds: string[]) {
    const roles = await this.users.findRoles();
    const validIds = new Set(roles.map((role) => role.id));
    if (roleIds.some((id) => !validIds.has(id))) throw new BadRequestException('One or more roles do not exist');
    return this.users.createWithRoles({
      name: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await this.passwords.hash(password),
      roleIds,
    });
  }

  async updateRoles(userId: string, roleIds: string[], actor: User, email: string, password: string) {
    const authenticatedActor = await this.users.findDomainById(actor.id);
    if (!authenticatedActor || authenticatedActor.email !== email || !(await this.passwords.verify(password, authenticatedActor.passwordHash))) {
      throw new UnauthorizedException('当前管理员账号或密码不正确');
    }
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
