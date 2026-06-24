import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDailyTask } from './rag-daily-user-tasks.entity';

export interface DifficultyMix {
  easy: number;
  medium: number;
  hard: number;
  total: number;
  performanceLevel: 'struggling' | 'below_average' | 'ontrack' | 'excelling' | 'excellent';
}

/**
 * Analyzes a user's historical task completion performance and returns
 * a recommended difficulty mix AND total task count for their next daily plan.
 *
 * Total task count stays fixed at 4 so the dashboard remains predictable.
 * Only the difficulty mix changes based on performance:
 *
 *   No data (day 1)  → 4 tasks: 2 easy + 1 medium + 1 hard
 *   Struggling < 25% → 4 tasks: 4 easy
 *   Below avg 25–49% → 4 tasks: 2 easy + 2 medium
 *   On-track  50–74% → 4 tasks: 2 easy + 1 medium + 1 hard
 *   Excelling 75–89% → 4 tasks: 1 easy + 2 medium + 1 hard
 *   Excellent  ≥ 90% → 4 tasks: 1 easy + 1 medium + 2 hard
 */
@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(UserDailyTask)
    private readonly userDailyRepo: Repository<UserDailyTask>,
  ) {}

  async getDifficultyMix(userId: string): Promise<DifficultyMix> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    // Look at tasks from the past 7 days (excluding today)
    const recentTasks = await this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('DATE(udt.task_date) >= :startDate', { startDate })
      .andWhere('DATE(udt.task_date) < :today', { today })
      .getMany();

    if (recentTasks.length === 0) {
      // Day 1 — balanced beginner mix, 4 tasks
      return { easy: 2, medium: 1, hard: 1, total: 4, performanceLevel: 'ontrack' };
    }

    const total = recentTasks.length;
    const completed = recentTasks.filter((t) => t.status === 'completed').length;
    const rate = completed / total;

    if (rate < 0.25) {
      // Struggling: keep it easy, 4 tasks
      return { easy: 4, medium: 0, hard: 0, total: 4, performanceLevel: 'struggling' };
    } else if (rate < 0.5) {
      // Below average: introduce medium, 4 tasks
      return { easy: 2, medium: 2, hard: 0, total: 4, performanceLevel: 'below_average' };
    } else if (rate < 0.75) {
      // On-track: keep 4 tasks with one hard challenge
      return { easy: 2, medium: 1, hard: 1, total: 4, performanceLevel: 'ontrack' };
    } else if (rate < 0.9) {
      // Excelling: keep 4 tasks, shift more weight into medium
      return { easy: 1, medium: 2, hard: 1, total: 4, performanceLevel: 'excelling' };
    } else {
      // Excellent: still 4 tasks, but harder mix
      return { easy: 1, medium: 1, hard: 2, total: 4, performanceLevel: 'excellent' };
    }
  }

  async getYesterdayStats(
    userId: string,
  ): Promise<{ completed: number; total: number; rate: number }> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().slice(0, 10);

    const tasks = await this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('DATE(udt.task_date) = :yDate', { yDate })
      .getMany();

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return { completed, total, rate: total > 0 ? completed / total : 0 };
  }
}
