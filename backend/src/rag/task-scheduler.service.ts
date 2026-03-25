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

    // Stagger requests slightly to avoid hammering the LLM API
    for (const user of users) {
      try {
        await this.ragService.getDailyTasks(user.id);
        this.logger.log(`✅ Generated daily plan for ${user.email}`);
      } catch (err) {
        this.logger.error(`❌ Failed for ${user.email}: ${err}`);
      }
      // Small delay between users to stay under LLM rate limits
      await new Promise((r) => setTimeout(r, 1500));
    }

    this.logger.log('⏰ Daily task generation cron finished');
  }
}
