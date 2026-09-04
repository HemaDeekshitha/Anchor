import 'dotenv/config';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import {
  Community,
  CommunityInvite,
  CommunityMember,
  CommunityOutboxEvent,
  CommunityPost,
  Friendship,
  Poll,
  PollOption,
  PollVote,
  PostComment,
  PostCommentVote,
  PostMedia,
  PostVote,
} from './entities/community.entities';
import { CommunityCacheService } from './infrastructure/community-cache.service';
import { CommunityMediaService } from './infrastructure/community-media.service';
import { CommunityQueueService } from './infrastructure/community-queue.service';
import { DistributedRateLimitGuard } from './infrastructure/distributed-rate-limit.guard';
import { CommunityProcessor } from './workers/community.processor';
import { CommunityRecoveryService } from './workers/community-recovery.service';

const redisUrl = process.env.REDIS_URL?.trim();

const communityWorkerProviders =
  redisUrl && process.env.COMMUNITY_WORKER_ENABLED !== 'false'
    ? [CommunityProcessor, CommunityRecoveryService]
    : [];

const bullImports = redisUrl
  ? [
      BullModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          connection: redisConnection(
            config.get<string>('REDIS_URL') ?? redisUrl,
          ),
          defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1_000 },
            removeOnComplete: 1_000,
            removeOnFail: 5_000,
          },
        }),
      }),
      BullModule.registerQueue({ name: 'community' }),
    ]
  : [];

function redisConnection(urlValue: string): {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls?: Record<string, never>;
} {
  const url = new URL(urlValue);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}
// T: O(u) and S: O(u), where u is the URL length

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      OnboardingResponse,
      Community,
      CommunityMember,
      Friendship,
      CommunityInvite,
      CommunityPost,
      PostMedia,
      Poll,
      PollOption,
      PollVote,
      PostVote,
      PostComment,
      PostCommentVote,
      CommunityOutboxEvent,
    ]),
    ...bullImports,
  ],
  controllers: [CommunityController],
  providers: [
    CommunityService,
    CommunityCacheService,
    CommunityMediaService,
    CommunityQueueService,
    DistributedRateLimitGuard,
    ...communityWorkerProviders,
  ],
  exports: [CommunityService, CommunityCacheService],
})
export class CommunityModule {}
