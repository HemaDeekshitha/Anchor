// C:\Users\nsais\Anchor\backend\src\application-tracker\application-tracker.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationTrackerController } from './application-tracker.controller';
import { ApplicationTrackerService } from './application-tracker.service';
import { GmailService } from './gmail.service';
import { GmailConnection } from './entities/gmail-connection.entity';
import { JobApplication } from './entities/job-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, GmailConnection])
  ],
  controllers: [ApplicationTrackerController],
  providers: [ApplicationTrackerService, GmailService],
})
export class ApplicationTrackerModule {}