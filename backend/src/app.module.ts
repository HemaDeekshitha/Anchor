import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ContactModule } from './contact/contact.module';
import { HealthModule } from './health/health.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { RagModule } from './rag/rag.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SubmissionModule } from './submissions/submission.module';
import { AiModule } from './ai/ai.module';
import { PointsModule } from './points/points.module';
import { MomentumModule } from './momentum/momentum.module';
import { ApplicationTrackerModule } from './application-tracker/application-tracker.module';
import { LearningTracksModule } from './learning-tracks/learning-tracks.module';
import { CommunityModule } from './community/community.module';
import { databaseOptions } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ContactModule,
    HealthModule,
    OnboardingModule,
    TypeOrmModule.forRoot({
      ...databaseOptions(),
      autoLoadEntities: true,
    }),
    RagModule,
    AuthModule,
    SubmissionModule,
    AiModule,
    PointsModule,
    MomentumModule,
    ApplicationTrackerModule,
    LearningTracksModule,
    CommunityModule,
  ],
})
export class AppModule {}
