import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @Roles('agent', 'admin')
  getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('agent/:id')
  @Roles('agent', 'admin')
  getAgentStats(@Param('id') agentId: string) {
    return this.statsService.getAgentStats(parseInt(agentId));
  }

  @Get('period')
  @Roles('agent', 'admin')
  getStatsByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getStatsByPeriod(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('performance')
  @Roles('agent', 'admin')
  getPerformanceMetrics() {
    return this.statsService.getPerformanceMetrics();
  }
}