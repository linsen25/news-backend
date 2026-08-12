import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsStatusCountsDto {
  @ApiProperty() total!: number;
  @ApiProperty() draft!: number;
  @ApiProperty() review!: number;
  @ApiProperty() approved!: number;
  @ApiProperty() rejected!: number;
  @ApiProperty() published!: number;
  @ApiProperty() withdrawn!: number;
}

export class AnalyticsTrendPointDto {
  @ApiProperty({ example: '2026-08-12' }) date!: string;
  @ApiProperty() views!: number;
}

export class AnalyticsArticleDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() category!: string;
  @ApiProperty() viewCount!: number;
  @ApiProperty({ nullable: true }) publishedAt!: string | null;
}

export class AnalyticsOverviewDto {
  @ApiProperty({ type: AnalyticsStatusCountsDto }) statuses!: AnalyticsStatusCountsDto;
  @ApiProperty() totalViews!: number;
  @ApiProperty() viewsLast7Days!: number;
  @ApiProperty() publishedLast30Days!: number;
  @ApiProperty({ type: [AnalyticsTrendPointDto] }) trend!: AnalyticsTrendPointDto[];
  @ApiProperty({ type: [AnalyticsArticleDto] }) topArticles!: AnalyticsArticleDto[];
}
