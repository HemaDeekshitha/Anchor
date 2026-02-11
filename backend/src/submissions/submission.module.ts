import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { TaskSubmission } from './submission.entity';
import { RagTask } from '../rag/rag-task.entity';
import { UserDailyTask } from '../rag/rag-daily-user-tasks.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskSubmission, RagTask, UserDailyTask]),
    AiModule, // Import AI module to use GeminiService
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService], // Export in case other modules need it
})
export class SubmissionModule {}