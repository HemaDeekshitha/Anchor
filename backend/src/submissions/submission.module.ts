import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { TaskSubmission } from './submission.entity';
import { RagTask } from '../rag/rag-task.entity';
import { UserDailyTask } from '../rag/rag-daily-user-tasks.entity';
import { AiModule } from '../ai/ai.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskSubmission, RagTask, UserDailyTask]),
    AiModule,      // GeminiService for AI evaluation
    PointsModule,  // PointsService to award Anchor Points on approval
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}