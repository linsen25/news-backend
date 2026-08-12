import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AnalyticsOverviewDto } from './dto/analytics.dto';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(): Promise<AnalyticsOverviewDto> {
    const now = new Date();
    const trendStart = new Date(now); trendStart.setUTCDate(trendStart.getUTCDate() - 13); trendStart.setUTCHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setUTCDate(weekStart.getUTCDate() - 6); weekStart.setUTCHours(0, 0, 0, 0);
    const monthStart = new Date(now); monthStart.setUTCDate(monthStart.getUTCDate() - 29); monthStart.setUTCHours(0, 0, 0, 0);
    const [statusGroups, totals, recentViews, publishedLast30Days, rawTrend, topArticles] = await Promise.all([
      this.prisma.article.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.article.aggregate({ _count: { _all: true }, _sum: { viewCount: true } }),
      this.prisma.articleView.count({ where: { viewedAt: { gte: weekStart } } }),
      this.prisma.article.count({ where: { publishedAt: { gte: monthStart }, status: { not: 'WITHDRAWN' } } }),
      this.prisma.$queryRaw<Array<{ day: Date; views: bigint }>>`
        SELECT DATE_TRUNC('day', "viewed_at") AS day, COUNT(*)::bigint AS views
        FROM "article_views" WHERE "viewed_at" >= ${trendStart}
        GROUP BY 1 ORDER BY 1 ASC`,
      this.prisma.article.findMany({
        where: { status: { not: 'WITHDRAWN' }, OR: [{ status: 'PUBLISHED' }, { publishedSnapshot: { not: Prisma.JsonNull } }] },
        orderBy: [{ viewCount: 'desc' }, { publishedAt: 'desc' }], take: 10,
        select: { id: true, title: true, slug: true, viewCount: true, publishedAt: true, category: { select: { name: true } } },
      }),
    ]);
    const counts = Object.fromEntries(statusGroups.map((row) => [row.status.toLowerCase(), row._count._all]));
    const trendMap = new Map(rawTrend.map((row) => [row.day.toISOString().slice(0, 10), Number(row.views)]));
    const trend = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(trendStart); date.setUTCDate(date.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10); return { date: key, views: trendMap.get(key) ?? 0 };
    });
    return {
      statuses: { total: totals._count._all, draft: counts.draft ?? 0, review: counts.review ?? 0, approved: counts.approved ?? 0, rejected: counts.rejected ?? 0, published: counts.published ?? 0, withdrawn: counts.withdrawn ?? 0 },
      totalViews: totals._sum.viewCount ?? 0, viewsLast7Days: recentViews, publishedLast30Days, trend,
      topArticles: topArticles.map((article) => ({ id: article.id, title: article.title, slug: article.slug, category: article.category.name, viewCount: article.viewCount, publishedAt: article.publishedAt?.toISOString() ?? null })),
    };
  }
}
