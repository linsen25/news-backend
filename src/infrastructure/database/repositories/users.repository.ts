import { Injectable } from '@nestjs/common';
import { PermissionKey, User } from '../../../common/types/domain';
import { PrismaService } from '../prisma.service';

const includeRoles = {
  roles: {
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
    },
  },
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDomainById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id }, include: includeRoles });
    return user ? this.toDomain(user) : null;
  }

  async findDomainByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email }, include: includeRoles });
    return user ? this.toDomain(user) : null;
  }

  findAllWithRoles() {
    return this.prisma.user.findMany({ include: includeRoles, orderBy: { createdAt: 'asc' } });
  }

  findRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  findPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { key: 'asc' }] });
  }

  createWithRoles(input: { name: string; email: string; passwordHash: string; roleIds: string[] }) {
    return this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        roles: { create: input.roleIds.map((roleId) => ({ roleId })) },
      },
      include: includeRoles,
    });
  }

  async replaceRoles(userId: string, roleIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      await tx.userRole.createMany({ data: roleIds.map((roleId) => ({ userId, roleId })) });
      return tx.user.findUniqueOrThrow({ where: { id: userId }, include: includeRoles });
    });
  }

  countUsersWithRole(roleId: string) {
    return this.prisma.userRole.count({ where: { roleId } });
  }

  findByIdWithRoles(id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: includeRoles });
  }

  private toDomain(user: Awaited<ReturnType<UsersRepository['findAllWithRoles']>>[number]): User {
    const permissions = new Set<PermissionKey>();
    for (const { role } of user.roles) {
      for (const { permission } of role.permissions) permissions.add(permission.key as PermissionKey);
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      roleIds: user.roles.map(({ roleId }) => roleId as User['roleIds'][number]),
      permissions: [...permissions],
      avatarUrl: user.avatarUrl ?? undefined,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
