import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { Task } from './tasks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingResponse, Task])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
