import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDailyTask } from '../rag-daily-user-tasks.entity';
import { UserPointsLedger } from 'src/points/user-points-ledger.entity';
import { User } from 'src/users/user.entity';
import {
  getTodayInTimezone,
  getWeekStartInTimezone,
} from 'src/common/utils/date.util';
import { RagTask } from '../rag-task.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserDailyTask)
    private readonly userDailyRepo: Repository<UserDailyTask>,

    @InjectRepository(UserPointsLedger)
    private readonly pointsRepo: Repository<UserPointsLedger>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async getUserTimezone(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['timezone'],
    });

    return user?.timezone || 'UTC';
  }

  async getAnalytics(userId: string, period: string = 'this_week') {
    const timezone = await this.getUserTimezone(userId);

    // -----------------------------
    // PERIOD DATE RANGE
    // -----------------------------

    let startDate: string | null = null;
    let endDate: string | null = null;

    const today = getTodayInTimezone(timezone);

    if (period === 'this_week') {
      startDate = getWeekStartInTimezone(timezone);
      endDate = today;
    }

    if (period === 'last_week') {
      const currentWeekStart = new Date(getWeekStartInTimezone(timezone));

      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      const lastWeekEnd = new Date(currentWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

      startDate = lastWeekStart.toISOString().slice(0, 10);
      endDate = lastWeekEnd.toISOString().slice(0, 10);
    }

    if (period === 'month') {
      const d = new Date(today);
      d.setDate(1);

      startDate = d.toISOString().slice(0, 10);
      endDate = today;
    }

    if (period === 'all_time') {
      startDate = null;
      endDate = null;
    }

    // -----------------------------
    // LAST WEEK RANGE (for comparison)
    // -----------------------------

    const currentWeekStartDate = getWeekStartInTimezone(timezone);

    const currentWeekStart = new Date(currentWeekStartDate);

    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekStartDate = lastWeekStart.toISOString().slice(0, 10);

    const lastWeekEnd = new Date(currentWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    const lastWeekEndDate = lastWeekEnd.toISOString().slice(0, 10);

    // -----------------------------
    // TOTAL TASKS
    // -----------------------------

    const totalTasksQuery = this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId });

    if (startDate && endDate) {
      totalTasksQuery.andWhere('DATE(udt.task_date) BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    const totalTasks = await totalTasksQuery.getCount();

    // -----------------------------
    // COMPLETED TASKS
    // -----------------------------

    const completedTasksQuery = this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' });

    if (startDate && endDate) {
      completedTasksQuery.andWhere(
        'DATE(udt.task_date) BETWEEN :start AND :end',
        {
          start: startDate,
          end: endDate,
        },
      );
    }

    const completedTasks = await completedTasksQuery.getCount();

    // -----------------------------
    // DSA SOLVED
    // -----------------------------

    const dsaSolvedQuery = this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .andWhere('task.category = :category', { category: 'DSA' });

    if (startDate && endDate) {
      dsaSolvedQuery.andWhere('DATE(udt.task_date) BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    const dsaSolved = await dsaSolvedQuery.getCount();

    // -----------------------------
    // LAST WEEK COMPARISON
    // -----------------------------

    const lastWeekTasksCompleted = await this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .andWhere('DATE(udt.task_date) BETWEEN :start AND :end', {
        start: lastWeekStartDate,
        end: lastWeekEndDate,
      })
      .getCount();

    const lastWeekDsaSolved = await this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .andWhere('task.category = :category', { category: 'DSA' })
      .andWhere('DATE(udt.task_date) BETWEEN :start AND :end', {
        start: lastWeekStartDate,
        end: lastWeekEndDate,
      })
      .getCount();

    // -----------------------------
    // MOMENTUM STREAK
    // -----------------------------

    const streakRows = await this.userDailyRepo
      .createQueryBuilder('udt')
      .select('DATE(udt.task_date)', 'date')
      .addSelect(
        "COUNT(*) FILTER (WHERE udt.status = 'completed')",
        'completed',
      )
      .addSelect('COUNT(*)', 'total')
      .where('udt.user_id = :userId', { userId })
      .andWhere("DATE(udt.task_date) >= CURRENT_DATE - INTERVAL '30 days'")
      .groupBy('DATE(udt.task_date)')
      .orderBy('DATE(udt.task_date)', 'DESC')
      .getRawMany();

    let streak = 0;

    for (let i = 0; i < streakRows.length; i++) {
      const row = streakRows[i];

      const completed = Number(row.completed);
      const total = Number(row.total);

      if (i === 0 && completed < total) {
        continue;
      }

      if (completed === total) {
        streak++;
      } else {
        break;
      }
    }

    // -----------------------------
    // REWARDS / AP BALANCE
    // -----------------------------

    const totalRow = await this.pointsRepo
      .createQueryBuilder('upl')
      .select('COALESCE(SUM(upl.amount), 0)', 'total')
      .where('upl.user_id = :userId', { userId })
      .getRawOne();

    const totalPoints = Number(totalRow?.total) || 0;

    const conversionsRow = await this.pointsRepo
      .createQueryBuilder('upl')
      .select('COUNT(*)', 'count')
      .where('upl.user_id = :userId', { userId })
      .andWhere('upl.type = :type', { type: 'converted_to_360' })
      .getRawOne();

    const conversions360 = Number(conversionsRow?.count) || 0;

    const earnedRow = await this.pointsRepo
      .createQueryBuilder('upl')
      .select('COALESCE(SUM(upl.amount), 0)', 'earned')
      .where('upl.user_id = :userId', { userId })
      .andWhere('upl.type = :type', { type: 'task_earned' })
      .getRawOne();

    const lifetimeApEarned = Number(earnedRow?.earned) || 0;

    const apBalance = ((totalPoints % 100) + 100) % 100;
    const apNeeded = apBalance === 0 ? 100 : 100 - apBalance;

    // -----------------------------
    // AP EARNED (PERIOD BASED)
    // -----------------------------

    const apEarnedQuery = this.pointsRepo
      .createQueryBuilder('upl')
      .select('COALESCE(SUM(upl.amount),0)', 'points')
      .where('upl.user_id = :userId', { userId })
      .andWhere('upl.type = :type', { type: 'task_earned' });

    if (startDate && endDate) {
      apEarnedQuery.andWhere('DATE(upl.created_at) BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    const apEarnedResult = await apEarnedQuery.getRawOne();

    const pointsThisWeek = Number(apEarnedResult?.points) || 0;

    const apEarnedLastWeek = await this.pointsRepo
      .createQueryBuilder('upl')
      .select('COALESCE(SUM(upl.amount),0)', 'points')
      .where('upl.user_id = :userId', { userId })
      .andWhere('upl.type = :type', { type: 'task_earned' })
      .andWhere('DATE(upl.created_at) BETWEEN :start AND :end', {
        start: lastWeekStartDate,
        end: lastWeekEndDate,
      })
      .getRawOne();

    const pointsLastWeek = Number(apEarnedLastWeek?.points) || 0;

    return {
      dsaSolved,
      dsaSolvedLastWeek: lastWeekDsaSolved,

      tasksCompleted: completedTasks,
      tasksCompletedLastWeek: lastWeekTasksCompleted,
      tasksTotal: totalTasks,

      applicationsSent: 8,
      applicationsLastWeek: 5,

      streak,
      pointsEarned: pointsThisWeek,
      pointsEarnedLastWeek: pointsLastWeek,

      rewards: {
        apBalance,
        apNeeded,
        conversions360,
        lifetimeApEarned,
      },
    };
  }

  async getWeeklyActivity(userId: string) {
    // Last 7 days based on user's timezone
    const timezone = await this.getUserTimezone(userId);

    const endDate = getTodayInTimezone(timezone);

    const start = new Date(endDate);
    start.setDate(start.getDate() - 6);
    const startDate = start.toISOString().slice(0, 10);

    // Query: count completed tasks grouped by date
    const rows = await this.userDailyRepo
      .createQueryBuilder('udt')
      .select('DATE(udt.task_date)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .andWhere('DATE(udt.task_date) BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('DATE(udt.task_date)')
      .orderBy('DATE(udt.task_date)', 'ASC')
      .getRawMany();

    // Map returned rows into a quick lookup: { '2026-03-01': 3, ... }
    const countByDate = new Map<string, number>();
    for (const r of rows) {
      // depending on DB driver, `r.date` might be Date or string
      const dateStr =
        typeof r.date === 'string'
          ? r.date.slice(0, 10)
          : new Date(r.date).toISOString().slice(0, 10);

      countByDate.set(dateStr, Number(r.count) || 0);
    }

    // Build Mon -> Sun labels for the last 7 days (in order)
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const result = labels.map((label) => ({
      label,
      value: 0,
    }));

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const iso = d.toISOString().slice(0, 10);

      const dayIndex = d.getDay(); // Sun=0
      const label = labels[(dayIndex + 6) % 7];

      const item = result.find((r) => r.label === label);

      if (item) {
        item.value = countByDate.get(iso) ?? 0;
      }
    }

    // Peak
    let peak = result[0] ?? { label: 'Mon', value: 0, date: startDate };
    for (const item of result) {
      if (item.value > peak.value) peak = item;
    }

    return {
      weeklyActivity: result.map(({ label, value }) => ({ label, value })),
      peakDay: peak.label,
      peakValue: peak.value,
      range: { start: startDate, end: endDate },
    };
  }
}
