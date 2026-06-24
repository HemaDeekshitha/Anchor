import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagTask } from './rag-task.entity';
import { UserDailyTask } from './rag-daily-user-tasks.entity';
import { UserPointsLedger } from 'src/points/user-points-ledger.entity';
import { User } from 'src/users/user.entity';
import { TaskSubmission } from 'src/submissions/submission.entity';
import { OnboardingResponse } from 'src/onboarding/onboarding.entity';
import { UserSkill } from 'src/skills/user-skills.entity';
import { UserSeenTask } from './user-seen-task.entity';
import { AnalyticsService } from './analytics/analytics.service';
import { InsightsService } from './insights/insights.service';
import { TaskGenerationService } from './task-generation.service';
import { PerformanceService } from './performance.service';
import { TaskSchedulerService } from './task-scheduler.service';
import { JobApplication } from 'src/application-tracker/entities/job-application.entity';
import { LearningTracksModule } from 'src/learning-tracks/learning-tracks.module';

@Module({
  imports: [
    LearningTracksModule,
    TypeOrmModule.forFeature([
      RagTask,
      UserDailyTask,
      UserPointsLedger,
      User,
      TaskSubmission,
      OnboardingResponse,
      UserSkill,
      UserSeenTask,
      JobApplication,
    ]),
  ],
  controllers: [RagController],
  providers: [
    RagService,
    AnalyticsService,
    InsightsService,
    TaskGenerationService,
    PerformanceService,
    TaskSchedulerService,
  ],
  exports: [RagService],
})
export class RagModule {}
