import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagTask } from './rag-task.entity';
import { UserDailyTask } from './rag-daily-user-tasks.entity';
import { UserPointsLedger } from 'src/points/user-points-ledger.entity';
import { User } from 'src/users/user.entity';
import { AnalyticsService } from './analytics/analytics.service';
import { InsightsService } from './insights/insights.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RagTask, UserDailyTask, UserPointsLedger, User]),
  ],
  controllers: [RagController],
  providers: [RagService, AnalyticsService, InsightsService],
})
export class RagModule {}
