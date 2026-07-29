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

  findTags() {
    return this.prisma.tag.findMany({ orderBy: { createdAt: 'asc' } });
  }

  findTag(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }
}
