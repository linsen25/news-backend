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
    if (
      !user ||
      !(await this.passwords.verify(input.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const role = (await this.users.findRoles()).find(
      (item) => item.id === user.roleId,
    );
    const permissions =
      role?.permissions.map(({ permission }) => ({
        key: permission.key,
        module: permission.module,
        description: permission.description,
      })) ?? [];

    await this.audit.record(user, 'LOGIN', `${user.name} 登录后台`);
    return {
      accessToken: await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
        roleId: user.roleId,
      }),
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        role: role && {
          id: role.id,
          name: role.name,
          permissions,
        },
        permissions,
      },
    };
  }
}
