import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { LearningTrack } from './learning-track.entity';
import { LearningTracksController } from './learning-tracks.controller';
import { LearningTracksService } from './learning-tracks.service';
import { UserDailyTask } from '../rag/rag-daily-user-tasks.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningTrack,
      OnboardingResponse,
      UserDailyTask,
    ]),
  ],
  controllers: [LearningTracksController],
  providers: [LearningTracksService],
  exports: [LearningTracksService],
})
export class LearningTracksModule {}
