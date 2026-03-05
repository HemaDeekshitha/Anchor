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

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

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
}
