import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { mockArticles } from '../src/mock/articles';
import { mockAuditLogs } from '../src/mock/audit-logs';
import { mockCategories } from '../src/mock/categories';
import { mockPermissions } from '../src/mock/permissions';
import { mockRevisions } from '../src/mock/revisions';
import { mockRoles } from '../src/mock/roles';
import { mockTags } from '../src/mock/tags';
import { mockUsers } from '../src/mock/users';

async function seed() {
  const prisma = new PrismaService();
  await prisma.$connect();

  for (const permission of mockPermissions) {
    await prisma.permission.upsert({
      where: { id: permission.id },
      update: {
        key: permission.key,
        module: permission.module,
        description: permission.name,
      },
      create: {
        id: permission.id,
        key: permission.key,
        module: permission.module,
        description: permission.name,
      },
    });
  }

  for (const role of mockRoles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: { id: role.id, name: role.name },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: role.permissionKeys.map((key) => ({
        roleId: role.id,
        permissionId: mockPermissions.find((item) => item.key === key)!.id,
      })),
    });
  }

  for (const user of mockUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: new Date(user.createdAt),
      },
    });
    await prisma.userRole.deleteMany({ where: { userId: user.id } });
    await prisma.userRole.createMany({
      data: user.roleIds.map((roleId) => ({ userId: user.id, roleId })),
    });
  }

  for (const category of mockCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
      },
    });
  }

  for (const tag of mockTags) {
    await prisma.tag.upsert({
      where: { id: tag.id },
      update: { name: tag.name, slug: tag.slug, categoryId: tag.categoryId },
      create: tag,
    });
  }

  for (const article of mockArticles) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        keywords: article.keywords,
        content: article.content as object,
        coverImage: article.coverImage,
        status: article.status.toUpperCase() as never,
        authorId: article.author.id,
        currentEditorId: article.currentEditor.id,
        categoryId: article.category.id,
        publishedAt: article.publishedAt
          ? new Date(article.publishedAt)
          : null,
      },
      create: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        keywords: article.keywords,
        content: article.content as object,
        coverImage: article.coverImage,
        status: article.status.toUpperCase() as never,
        authorId: article.author.id,
        currentEditorId: article.currentEditor.id,
        categoryId: article.category.id,
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt),
        publishedAt: article.publishedAt
          ? new Date(article.publishedAt)
          : null,
      },
    });
    await prisma.articleTag.deleteMany({
      where: { articleId: article.id },
    });
    if (article.tags.length) {
      await prisma.articleTag.createMany({
        data: article.tags.map((tag) => ({
          articleId: article.id,
          tagId: tag.id,
        })),
      });
    }
  }

  for (const revision of mockRevisions) {
    await prisma.articleRevision.upsert({
      where: { id: revision.id },
      update: {
        note: revision.note,
        contentSnapshot: revision.contentSnapshot as object,
      },
      create: {
        id: revision.id,
        articleId: revision.articleId,
        editorId: revision.editorId,
        note: revision.note,
        contentSnapshot: revision.contentSnapshot as object,
        createdAt: new Date(revision.createdAt),
      },
    });
  }

  for (const log of mockAuditLogs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {
        action: log.action as never,
        description: log.description,
      },
      create: {
        id: log.id,
        userId: log.userId,
        action: log.action as never,
        articleId: log.articleId,
        description: log.description,
        createdAt: new Date(log.createdAt),
      },
    });
  }

  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
