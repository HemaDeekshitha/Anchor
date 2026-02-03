import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Get('tasks')
  async getTasks(
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
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
}
