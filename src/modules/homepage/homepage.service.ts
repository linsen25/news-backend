import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ArticlesRepository } from '../../infrastructure/database/repositories/articles.repository';
import { User } from '../../common/types/domain';
import { HomepageLayoutDto, HomepageSlotInputDto } from './dto/homepage.dto';

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService, private readonly articles: ArticlesRepository) {}

  async findLayout(activeOnly = false): Promise<HomepageLayoutDto> {
    const now = new Date();
    const rows = await this.prisma.homepageSlot.findMany({
      where: activeOnly ? {
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      } : undefined,
      orderBy: [{ section: 'asc' }, { scope: 'asc' }, { position: 'asc' }],
    });
    const published = new Map((await this.articles.findPublished()).map((article) => [article.id, article]));
    return {
      slots: rows.flatMap((row) => {
        const article = published.get(row.articleId);
        return article ? [{
          id: row.id,
          section: row.section as HomepageSlotInputDto['section'],
          scope: row.scope,
          position: row.position,
          article,
          startsAt: row.startsAt?.toISOString() ?? null,
          endsAt: row.endsAt?.toISOString() ?? null,
        }] : [];
      }),
    };
  }

  async replaceLayout(input: HomepageSlotInputDto[], actor: User): Promise<HomepageLayoutDto> {
    this.validateLayout(input);
    const articleIds = [...new Set(input.map(({ articleId }) => articleId))];
    const articles = (await this.prisma.article.findMany({
      where: { id: { in: articleIds } },
      select: { id: true, categoryId: true, status: true, publishedSnapshot: true },
    })).filter((article) => article.status === 'PUBLISHED' || article.publishedSnapshot !== null);
    if (articles.length !== articleIds.length) throw new BadRequestException('首页只能编排当前公开可见的文章');
    const categoryByArticle = new Map(articles.map((article) => [article.id, article.categoryId]));
    for (const slot of input) {
      if (slot.section === 'category_featured' && categoryByArticle.get(slot.articleId) !== slot.scope) {
        throw new BadRequestException('分类推荐位只能使用该分类下的文章');
      }
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.homepageSlot.deleteMany();
      if (input.length) await tx.homepageSlot.createMany({
        data: input.map((slot) => ({
          id: randomUUID(), section: slot.section, scope: slot.scope, position: slot.position,
          articleId: slot.articleId, startsAt: slot.startsAt ? new Date(slot.startsAt) : null,
          endsAt: slot.endsAt ? new Date(slot.endsAt) : null, createdById: actor.id,
        })),
      });
      await tx.auditLog.create({ data: {
        id: randomUUID(), userId: actor.id, action: 'UPDATE_HOMEPAGE',
        description: `更新首页编排，共 ${input.length} 个推荐位`,
      } });
    });
    return this.findLayout();
  }

  private validateLayout(slots: HomepageSlotInputDto[]) {
    const positions = new Set<string>();
    const articles = new Set<string>();
    for (const slot of slots) {
      if (slot.section !== 'category_featured' && slot.scope !== 'global') throw new BadRequestException('头条区域必须使用 global scope');
      if (slot.section === 'category_featured' && slot.scope === 'global') throw new BadRequestException('分类推荐位必须指定分类');
      if (slot.section === 'headline_main' && slot.position !== 0) throw new BadRequestException('主头条只能使用位置 0');
      if (slot.section === 'headline_secondary' && slot.position > 3) throw new BadRequestException('次头条最多四篇');
      if (slot.section === 'category_featured' && slot.position > 4) throw new BadRequestException('每个分类最多五个推荐位');
      if (slot.startsAt && slot.endsAt && new Date(slot.startsAt) >= new Date(slot.endsAt)) throw new BadRequestException('展示结束时间必须晚于开始时间');
      const positionKey = `${slot.section}:${slot.scope}:${slot.position}`;
      const articleKey = `${slot.section}:${slot.scope}:${slot.articleId}`;
      if (positions.has(positionKey) || articles.has(articleKey)) throw new BadRequestException('首页编排中存在重复位置或重复文章');
      positions.add(positionKey); articles.add(articleKey);
    }
  }
}
