import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../auth/permissions.decorator';
import { AnalyticsOverviewDto } from './dto/analytics.dto';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth('jwt')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}
  @Get('overview')
  @Permissions('articles.review.view')
  @ApiOkResponse({ type: AnalyticsOverviewDto })
  overview() { return this.analytics.overview(); }
}
