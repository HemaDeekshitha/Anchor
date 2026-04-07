import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RagService } from './rag.service';
import { User } from 'src/users/user.entity';

/**
 * Runs every day at 00:05 UTC (just after midnight).
 *
 * For every user who has completed onboarding, it calls getDailyTasks
 * so the plan for the new day is pre-generated using:
 *   - The user's latest resume skills
 *   - Onboarding selections (roles, status, focus)
 *   - Their 7-day completion-rate performance (difficulty mix)
 *
 * getDailyTasks is idempotent: if a plan already exists for today it returns
 * the cached plan without re-generating, so running it here is always safe.
 */
@Injectable()
export class TaskSchedulerService {
  private readonly logger = new Logger(TaskSchedulerService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly ragService: RagService,
  ) {}

  @Cron('5 0 * * *') // 00:05 UTC every day
  async generateDailyPlansForAllUsers() {
    this.logger.log('⏰ Daily task generation cron started');

    const users = await this.userRepo.find({
      where: { onboardingCompleted: true },
      select: ['id', 'email'],
    });

    this.logger.log(`Found ${users.length} onboarded users`);

    const failed: typeof users = [];

    // First pass — 5 s between users keeps us well under Gemini 15 RPM free-tier limit.
    // (25 users × 5 s = ~2 min total, safely under the rate limit)
    for (const user of users) {
      try {
        await this.ragService.getDailyTasks(user.id);
        this.logger.log(`✅ Generated daily plan for ${user.email}`);
      } catch (err) {
        this.logger.error(`❌ Failed for ${user.email}: ${err}`);
        failed.push(user);
      }
      await new Promise((r) => setTimeout(r, 5000));
    }

    // Retry pass — wait 2 minutes then retry all failed users once
    if (failed.length > 0) {
      this.logger.warn(`⏳ Retrying ${failed.length} failed users in 2 minutes…`);
      await new Promise((r) => setTimeout(r, 120_000));

      for (const user of failed) {
        try {
          await this.ragService.getDailyTasks(user.id);
          this.logger.log(`✅ Retry succeeded for ${user.email}`);
        } catch (err) {
          this.logger.error(`❌ Retry also failed for ${user.email}: ${err}`);
        }
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    this.logger.log('⏰ Daily task generation cron finished');
  }
}
