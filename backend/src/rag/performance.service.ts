import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDailyTask } from './rag-daily-user-tasks.entity';

export interface DifficultyMix {
  easy: number;
  medium: number;
  hard: number;
  total: number;
  performanceLevel:
    | 'struggling'
    | 'below_average'
    | 'ontrack'
    | 'excelling'
    | 'excellent';
}

/**
 * Analyzes a user's historical task completion performance and returns
 * a recommended difficulty mix AND total task count for their next daily plan.
 *
 * Daily volume is a stable weighted-random choice of 3, 4, or 5. Performance
 * influences the odds and difficulty mix, but never fixes the question count.
 */
@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(UserDailyTask)
    private readonly userDailyRepo: Repository<UserDailyTask>,
  ) {}

  async getDifficultyMix(
    userId: string,
    requestedTotal?: number,
  ): Promise<DifficultyMix> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    // Look at tasks from the past 7 days (excluding today)
    const recentTasks = await this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status != :superseded', { superseded: 'superseded' })
      .andWhere('DATE(udt.task_date) >= :startDate', { startDate })
      .andWhere('DATE(udt.task_date) < :today', { today })
      .getMany();

    if (recentTasks.length === 0) {
      const level = 'ontrack';
      return this.mixForLevel(
        level,
        requestedTotal ?? this.choosePlanSize(userId, today, level),
      );
    }

    const total = recentTasks.length;
    const completed = recentTasks.filter(
      (t) => t.status === 'completed',
    ).length;
    const rate = completed / total;

    if (rate < 0.25) {
      const level = 'struggling';
      return this.mixForLevel(
        level,
        requestedTotal ?? this.choosePlanSize(userId, today, level),
      );
    } else if (rate < 0.5) {
      const level = 'below_average';
      return this.mixForLevel(
        level,
        requestedTotal ?? this.choosePlanSize(userId, today, level),
      );
    } else if (rate < 0.75) {
      const level = 'ontrack';
      return this.mixForLevel(
        level,
        requestedTotal ?? this.choosePlanSize(userId, today, level),
      );
    } else if (rate < 0.9) {
      const level = 'excelling';
      return this.mixForLevel(
        level,
        requestedTotal ?? this.choosePlanSize(userId, today, level),
      );
    } else {
      const level = 'excellent';
      return this.mixForLevel(
        level,
        requestedTotal ?? this.choosePlanSize(userId, today, level),
      );
    }
  }

  private choosePlanSize(
    userId: string,
    date: string,
    level: DifficultyMix['performanceLevel'],
  ): number {
    const weights: Record<
      DifficultyMix['performanceLevel'],
      [number, number, number]
    > = {
      struggling: [0.5, 0.35, 0.15],
      below_average: [0.4, 0.4, 0.2],
      ontrack: [0.3, 0.4, 0.3],
      excelling: [0.2, 0.4, 0.4],
      excellent: [0.15, 0.35, 0.5],
    };
    const random = this.seededRandom(`${userId}:${date}:daily-plan-size`);
    const [threeWeight, fourWeight] = weights[level];
    if (random < threeWeight) return 3;
    if (random < threeWeight + fourWeight) return 4;
    return 5;
  }

  private seededRandom(seed: string): number {
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index++) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967296;
  }

  private mixForLevel(
    performanceLevel: DifficultyMix['performanceLevel'],
    total: number,
  ): DifficultyMix {
    total = Math.max(3, Math.min(5, total));
    if (performanceLevel === 'struggling') {
      return { easy: total, medium: 0, hard: 0, total, performanceLevel };
    }
    if (performanceLevel === 'below_average') {
      const easy = Math.ceil(total / 2);
      return { easy, medium: total - easy, hard: 0, total, performanceLevel };
    }
    if (performanceLevel === 'ontrack') {
      const hard = 1;
      const medium = 1;
      return {
        easy: total - medium - hard,
        medium,
        hard,
        total,
        performanceLevel,
      };
    }
    if (performanceLevel === 'excelling') {
      return { easy: 1, medium: total - 2, hard: 1, total, performanceLevel };
    }
    const hard = Math.ceil(total / 2);
    return { easy: 1, medium: total - hard - 1, hard, total, performanceLevel };
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
      .andWhere('udt.status != :superseded', { superseded: 'superseded' })
      .andWhere('DATE(udt.task_date) = :yDate', { yDate })
      .getMany();

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return { completed, total, rate: total > 0 ? completed / total : 0 };
  }
}
