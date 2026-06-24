import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ContactModule } from './contact/contact.module';
import { HealthModule } from './health/health.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { RagModule } from './rag/rag.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SubmissionModule } from './submissions/submission.module';
import { AiModule } from './ai/ai.module';
import { PointsModule } from './points/points.module';
import { MomentumModule } from './momentum/momentum.module';
import { ApplicationTrackerModule } from './application-tracker/application-tracker.module';

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
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true, // CAREFUL: This auto-creates tables. Disable in production!
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
    }),
    RagModule,
    AuthModule,
    SubmissionModule,
    AiModule,
    PointsModule,
    MomentumModule,
    ApplicationTrackerModule,
  ],
})
export class AppModule {}
