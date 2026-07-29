import { Injectable } from '@nestjs/common';
import { Article, ArticleStatus, TipTapDocument } from '../../../common/types/domain';
import { PrismaService } from '../prisma.service';
import { Prisma } from '../../../../generated/prisma/client';

const articleInclude = {
  author: true,
  currentEditor: true,
  category: true,
  tags: { include: { tag: true } },
} as const;

type ArticleRecord = Awaited<
  ReturnType<ArticlesRepository['findRecordById']>
>;

@Injectable()
export class ArticlesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Article[]> {
    const rows = await this.prisma.article.findMany({
      include: articleInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findPage(input: {
    page: number;
    limit: number;
    status?: string;
    categoryId?: string;
    authorId?: string;
    reviewOnly?: boolean;
  }): Promise<{ items: Article[]; total: number }> {
    const where: Prisma.ArticleWhereInput = {
      status: input.status
        ? (input.status.toUpperCase() as never)
        : input.reviewOnly
          ? { in: ['REVIEW', 'APPROVED', 'REJECTED'] }
          : undefined,
      categoryId: input.categoryId,
      authorId: input.authorId,
    };
    const { rows, total } = await this.prisma.$transaction(async (tx) => {
      const rows = await tx.article.findMany({
        where,
        include: articleInclude,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });
      const total = await tx.article.count({ where });
      return { rows, total };
    });
    return { items: rows.map((row) => this.toDomain(row)), total };
  }

  async findById(id: string): Promise<Article | null> {
    const row = await this.findRecordById(id);
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const row = await this.prisma.article.findUnique({
      where: { slug },
      include: articleInclude,
    });
    return row ? this.toDomain(row) : null;
  }

  findRecordById(id: string) {
    return this.prisma.article.findUnique({
      where: { id },
      include: articleInclude,
    });
  }

  async create(input: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    content: TipTapDocument;
    coverImage: string;
    authorId: string;
    currentEditorId: string;
    categoryId: string;
    tagIds: string[];
    mediaUrls: string[];
  }): Promise<Article> {
    const row = await this.prisma.$transaction(async (tx) => {
      const media = await tx.mediaAsset.findMany({
        where: { url: { in: input.mediaUrls } },
        select: { id: true },
      });
      return tx.article.create({
        data: {
          id: input.id,
          title: input.title,
          slug: input.slug,
          summary: input.summary,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
          keywords: input.keywords,
          content: input.content as object,
          coverImage: input.coverImage,
          authorId: input.authorId,
          currentEditorId: input.currentEditorId,
          categoryId: input.categoryId,
          tags: {
            create: input.tagIds.map((tagId) => ({ tagId })),
          },
          mediaAssets: {
            create: media.map(({ id }) => ({ mediaAssetId: id })),
          },
        },
        include: articleInclude,
      });
    });
    return this.toDomain(row);
  }

  async update(
    id: string,
    input: {
      title?: string;
      slug?: string;
      summary?: string;
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
      content?: TipTapDocument;
      coverImage?: string;
      currentEditorId: string;
      categoryId?: string;
      tagIds?: string[];
      status?: ArticleStatus;
      publishedAt?: Date | null;
      mediaUrls?: string[];
    },
  ): Promise<Article> {
    const row = await this.prisma.$transaction(async (tx) => {
      if (input.tagIds) {
        await tx.articleTag.deleteMany({ where: { articleId: id } });
      }
      if (input.mediaUrls) {
        await tx.articleMedia.deleteMany({ where: { articleId: id } });
      }
      const media = input.mediaUrls
        ? await tx.mediaAsset.findMany({
            where: { url: { in: input.mediaUrls } },
            select: { id: true },
          })
        : [];
      return tx.article.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          summary: input.summary,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
          keywords: input.keywords,
          content: input.content as object | undefined,
          coverImage: input.coverImage,
          currentEditorId: input.currentEditorId,
          categoryId: input.categoryId,
          status: input.status?.toUpperCase() as never,
          publishedAt: input.publishedAt,
          tags: input.tagIds
            ? { create: input.tagIds.map((tagId) => ({ tagId })) }
            : undefined,
          mediaAssets: input.mediaUrls
            ? { create: media.map(({ id }) => ({ mediaAssetId: id })) }
            : undefined,
        },
        include: articleInclude,
      });
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.article.delete({ where: { id } });
  }

  private toDomain(row: NonNullable<ArticleRecord>): Article {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      keywords: row.keywords,
      content: row.content as unknown as TipTapDocument,
      coverImage: row.coverImage,
      author: { id: row.author.id, name: row.author.name },
      currentEditor: {
        id: row.currentEditor.id,
        name: row.currentEditor.name,
      },
      category: {
        id: row.category.id,
        name: row.category.name,
        slug: row.category.slug,
      },
      tags: row.tags.map(({ tag }) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })),
      status: row.status.toLowerCase() as ArticleStatus,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
    };
  }
}
