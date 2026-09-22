import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('التحليلات - Analytics')
@Controller('analytics')
@ApiBearerAuth()
@Roles(AdminRole.super_admin, AdminRole.manager, AdminRole.staff)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'إحصائيات المبيعات' })
  getSalesStats(
    @Query('range') range: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getSalesStats(range, from, to);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'المنتجات الأكثر مبيعاً' })
  getTopProducts(@Query('limit') limit = 10) {
    const parsed = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    return this.analyticsService.getTopProducts(
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 50) : 10,
    );
  }

  @Get('overview')
  @ApiOperation({ summary: 'نظرة عامة على المتجر' })
  getOverview() {
    return this.analyticsService.getOverview();
  }
}
