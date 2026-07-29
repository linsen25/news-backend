import { Injectable } from '@nestjs/common';
import { PermissionKey, User } from '../../../common/types/domain';
import { PrismaService } from '../prisma.service';

const includeRole = {
  role: {
    include: {
      permissions: { include: { permission: true } },
    },
  },
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDomainById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: includeRole,
    });
    return user ? this.toDomain(user) : null;
  }

  async findDomainByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: includeRole,
    });
    return user ? this.toDomain(user) : null;
  }

  findAllWithRole() {
    return this.prisma.user.findMany({
      include: includeRole,
      orderBy: { createdAt: 'asc' },
    });
  }

  findRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });
  }

  private toDomain(user: Awaited<ReturnType<UsersRepository['findAllWithRole']>>[number]): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      roleId: user.roleId as User['roleId'],
      permissions: user.role.permissions.map(
        ({ permission }) => permission.key as PermissionKey,
      ),
      avatarUrl: user.avatarUrl ?? undefined,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
