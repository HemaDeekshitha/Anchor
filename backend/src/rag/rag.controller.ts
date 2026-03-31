import {
  Controller,
  Get,
  Query,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RagService } from './rag.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import type { Request } from 'express';
import { AnalyticsService } from './analytics/analytics.service';
import { InsightsService } from './insights/insights.service';

@Controller('rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly analyticsService: AnalyticsService,
    private readonly insightsService: InsightsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('tasks')
  async getTasks(@Req() req: Request, @Query('limit') limit?: string) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const smartPlan = await this.ragService.getDailyTasks(
      userId,
      limit ? Number(limit) : 4,
    );

    const pendingTasks = await this.ragService.getPendingTasks(userId);

    return {
      smartPlan,
      pendingTasks,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('milestones')
  async getMilestones(@Req() req: Request) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }

    const userId = req.user.userId;

    return this.ragService.getWeeklyMilestones(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  getAnalytics(@Req() req: Request, @Query('period') period: string) {
    const userId = (req as any).user.userId;
    return this.analyticsService.getAnalytics(userId, period);
  }
  @UseGuards(JwtAuthGuard)
  @Get('activity')
  getActivity(@Req() req, @Query('period') period: string) {
    const userId = req.user.userId;

    if (!period) {
      throw new BadRequestException('period is required');
    }

    return this.analyticsService.getActivity(userId, period);
  }
  @UseGuards(JwtAuthGuard)
  @Get('weekly-activity')
  async getWeeklyActivity(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.analyticsService.getWeeklyActivity(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('weekly-recap')
  async getWeeklyRecap(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.insightsService.getWeeklyRecap(userId);
  }

  /**
   * GET /rag/history?limit=30
   * Returns a day-by-day history of the user's daily plans, answers, and scores.
   */
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req: Request, @Query('limit') limit?: string) {
    const userId = (req as any).user.userId;
    return this.ragService.getHistory(userId, limit ? Number(limit) : 30);
  }
}
