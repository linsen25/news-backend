import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCategories() {
    return this.prisma.category.findMany({ orderBy: { createdAt: 'asc' } });
  }

  findCategory(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  createCategory(input: { name: string; nameEn: string; slug: string; parentId?: string | null }) {
    return this.prisma.category.create({ data: input });
  }

  updateCategory(id: string, input: { name?: string; nameEn?: string; slug?: string; parentId?: string | null }) {
    return this.prisma.category.update({ where: { id }, data: input });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  findTags() {
    return this.prisma.tag.findMany({ orderBy: { createdAt: 'asc' } });
  }

  findTag(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  createTag(input: { name: string; nameEn?: string; slug: string; categoryId: string }) {
    return this.prisma.tag.create({ data: input });
  }

  updateTag(id: string, input: { name?: string; nameEn?: string; slug?: string; categoryId?: string }) {
    return this.prisma.tag.update({ where: { id }, data: input });
  }

  async deleteTag(id: string): Promise<void> {
    await this.prisma.tag.delete({ where: { id } });
  }
}
