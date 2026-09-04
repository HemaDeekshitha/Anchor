import { Module } from '@nestjs/common';
import { CommunityModule } from '../community/community.module';
import { HealthController } from './health.controller';

@Module({
  imports: [CommunityModule],
  controllers: [HealthController],
})
export class HealthModule {}
