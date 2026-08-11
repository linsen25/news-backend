import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../infrastructure/database/repositories/users.repository';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly audit: AuditService,
    private readonly jwt: JwtService,
    private readonly passwords: PasswordService,
    private readonly users: UsersRepository,
  ) {}

  async login(input: LoginDto) {
    const user = await this.users.findDomainByEmail(input.email);
    if (!user || !(await this.passwords.verify(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
    const allRoles = await this.users.findRoles();
    const roles = allRoles.filter((role) => user.roleIds.includes(role.id as never)).map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(({ permission }) => ({
        key: permission.key, module: permission.module, description: permission.description,
      })),
    }));
    const permissions = Array.from(new Map(
      roles.flatMap((role) => role.permissions).map((permission) => [permission.key, permission]),
    ).values());

    await this.audit.record(user, 'LOGIN', `${user.name} 登录后台`);
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, email: user.email }),
      user: { id: user.id, username: user.name, email: user.email, roles, permissions },
    };
  }
}
