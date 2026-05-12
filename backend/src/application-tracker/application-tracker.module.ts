import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationTrackerController } from './application-tracker.controller';
import { ApplicationTrackerService } from './application-tracker.service';
import { GmailService } from './gmail.service';
import { GmailConnection } from './entities/gmail-connection.entity';
import { JobApplication } from './entities/job-application.entity';
import { AiModule } from '../ai/ai.module';                   // add

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, GmailConnection]),
    AiModule,                                                  // add
  ],
  controllers: [ApplicationTrackerController],
  providers: [ApplicationTrackerService, GmailService],
})
export class ApplicationTrackerModule {}