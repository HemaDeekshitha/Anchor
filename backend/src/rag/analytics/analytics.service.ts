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
import { JobApplication } from 'src/application-tracker/entities/job-application.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserDailyTask)
    private readonly userDailyRepo: Repository<UserDailyTask>,

    @InjectRepository(UserPointsLedger)
    private readonly pointsRepo: Repository<UserPointsLedger>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(JobApplication)
    private readonly jobAppRepo: Repository<JobApplication>,
  ) {}

  private async getUserTimezone(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['timezone'],
    });

    return user?.timezone || 'UTC';
  }

  private async getDateRange(userId: string, period: string) {
    const timezone = await this.getUserTimezone(userId);

    const today = getTodayInTimezone(timezone);

    let startDate: string | null = null;
    let endDate: string | null = today;

    if (period === '7d') {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      startDate = d.toISOString().slice(0, 10);
    }

    if (period === 'this_week') {
      startDate = getWeekStartInTimezone(timezone);
    }

    if (period === 'last_month') {
      const d = new Date(today);
      d.setMonth(d.getMonth() - 1);
      d.setDate(1);

      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      startDate = d.toISOString().slice(0, 10);
      endDate = end.toISOString().slice(0, 10);
    }

    if (period === 'all') {
      startDate = null;
      endDate = null;
    }

    return { startDate, endDate, timezone };
  }
  async getActivity(userId: string, period: string) {
    const { startDate, endDate } = await this.getDateRange(userId, period);

    let rows;
    let appMap = new Map<string, number>();

    if (period === '7d' || period === 'this_week') {
      const appRows = await this.jobAppRepo
        .createQueryBuilder('ja')
        .select("TRIM(TO_CHAR(ja.appliedDate, 'Dy'))", 'label')
        .addSelect('COUNT(*)', 'applications')
        .where('ja.userId = :userId', { userId })
        .andWhere('DATE(ja.appliedDate) BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .groupBy("TRIM(TO_CHAR(ja.appliedDate, 'Dy'))")
        .getRawMany();

      appMap = new Map(
        appRows.map((r) => [r.label, Number(r.applications) || 0]),
      );
    }

    console.log('appMap:', appMap);

    if (period === 'last_month') {
      const appRows = await this.jobAppRepo
        .createQueryBuilder('ja')
        .select(
          `CASE
        WHEN EXTRACT(DAY FROM ja.appliedDate) BETWEEN 1 AND 7 THEN 'W1'
        WHEN EXTRACT(DAY FROM ja.appliedDate) BETWEEN 8 AND 14 THEN 'W2'
        WHEN EXTRACT(DAY FROM ja.appliedDate) BETWEEN 15 AND 21 THEN 'W3'
        ELSE 'W4'
      END`,
          'label',
        )
        .addSelect('COUNT(*)', 'applications')
        .where('ja.userId = :userId', { userId })
        .andWhere('DATE(ja.appliedDate) BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .groupBy(
          `CASE
        WHEN EXTRACT(DAY FROM ja.appliedDate) BETWEEN 1 AND 7 THEN 'W1'
        WHEN EXTRACT(DAY FROM ja.appliedDate) BETWEEN 8 AND 14 THEN 'W2'
        WHEN EXTRACT(DAY FROM ja.appliedDate) BETWEEN 15 AND 21 THEN 'W3'
        ELSE 'W4'
      END`,
        )
        .getRawMany();

      appMap = new Map(
        appRows.map((r) => [r.label, Number(r.applications) || 0]),
      );
    }

    if (period === 'all') {
      const appRows = await this.jobAppRepo
        .createQueryBuilder('ja')
        .select("TO_CHAR(ja.appliedDate, 'Mon')", 'label')
        .addSelect('COUNT(*)', 'applications')
        .where('ja.userId = :userId', { userId })
        .groupBy("TO_CHAR(ja.appliedDate, 'Mon')")
        .getRawMany();

      appMap = new Map(
        appRows.map((r) => [r.label, Number(r.applications) || 0]),
      );
    }

    // ---------------- LAST MONTH (W1–W4) ----------------
    if (period === 'last_month') {
      rows = await this.userDailyRepo
        .createQueryBuilder('udt')
        .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
        .select(
          `
          CASE
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 1 AND 7 THEN 'W1'
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 8 AND 14 THEN 'W2'
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 15 AND 21 THEN 'W3'
            ELSE 'W4'
          END
        `,
          'label',
        )
        .addSelect(
          `
          CASE
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 1 AND 7 THEN 1
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 8 AND 14 THEN 2
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 15 AND 21 THEN 3
            ELSE 4
          END
        `,
          'weekIndex',
        )
        .addSelect('COUNT(*)', 'tasks')
        .addSelect("COUNT(*) FILTER (WHERE task.category = 'DSA')", 'leetcode')
        .addSelect("COUNT(*) FILTER (WHERE task.difficulty = 'easy')", 'easy')
        .addSelect(
          "COUNT(*) FILTER (WHERE task.difficulty = 'medium')",
          'medium',
        )
        .where('udt.user_id = :userId', { userId })
        .andWhere('udt.status = :status', { status: 'completed' })
        .andWhere('DATE(udt.task_date) BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .groupBy('label')
        .addGroupBy(
          `
          CASE
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 1 AND 7 THEN 1
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 8 AND 14 THEN 2
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 15 AND 21 THEN 3
            ELSE 4
          END
        `,
        )
        .orderBy(
          `
          CASE
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 1 AND 7 THEN 1
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 8 AND 14 THEN 2
            WHEN EXTRACT(DAY FROM udt.task_date) BETWEEN 15 AND 21 THEN 3
            ELSE 4
          END
        `,
          'ASC',
        )
        .getRawMany();
    }

    // ---------------- ALL TIME (MONTHS) ----------------
    else if (period === 'all') {
      rows = await this.userDailyRepo
        .createQueryBuilder('udt')
        .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
        .select("TO_CHAR(udt.task_date, 'Mon')", 'label')
        .addSelect('EXTRACT(MONTH FROM udt.task_date)', 'monthIndex')
        .addSelect('COUNT(*)', 'tasks')
        .addSelect("COUNT(*) FILTER (WHERE task.category = 'DSA')", 'leetcode')

        .addSelect("COUNT(*) FILTER (WHERE task.difficulty = 'easy')", 'easy')
        .addSelect(
          "COUNT(*) FILTER (WHERE task.difficulty = 'medium')",
          'medium',
        )
        .where('udt.user_id = :userId', { userId })
        .andWhere('udt.status = :status', { status: 'completed' })
        .groupBy("TO_CHAR(udt.task_date, 'Mon')")
        .addGroupBy('EXTRACT(MONTH FROM udt.task_date)')
        .orderBy('EXTRACT(MONTH FROM udt.task_date)', 'ASC')
        .getRawMany();
    }

    // ---------------- WEEK / 7D ----------------
    else {
      const query = this.userDailyRepo
        .createQueryBuilder('udt')
        .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
        .select("TRIM(TO_CHAR(udt.task_date, 'Dy'))", 'label') // 🔥 FIXED
        .addSelect('EXTRACT(DOW FROM udt.task_date)', 'dayIndex')
        .addSelect('COUNT(*)', 'tasks')
        .addSelect("COUNT(*) FILTER (WHERE task.category = 'DSA')", 'leetcode')

        .addSelect("COUNT(*) FILTER (WHERE task.difficulty = 'easy')", 'easy')
        .addSelect(
          "COUNT(*) FILTER (WHERE task.difficulty = 'medium')",
          'medium',
        )
        .where('udt.user_id = :userId', { userId })
        .andWhere('udt.status = :status', { status: 'completed' });

      if (startDate && endDate) {
        query.andWhere('DATE(udt.task_date) BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        });
      }

      rows = await query
        .groupBy("TRIM(TO_CHAR(udt.task_date, 'Dy'))")
        .addGroupBy('EXTRACT(DOW FROM udt.task_date)')
        .orderBy('EXTRACT(DOW FROM udt.task_date)', 'ASC')
        .getRawMany();
    }

    // ---------------- NORMALIZE ----------------
    const data = rows.map((r) => ({
      label: r.label,
      tasks: Number(r.tasks) || 0,
      leetcode: Number(r.leetcode) || 0,
      applications: appMap.get(r.label) || 0,
      easy: Number(r.easy) || 0,
      medium: Number(r.medium) || 0,
    }));

    let finalData = data;

    // WEEK
    if (period === '7d' || period === 'this_week') {
      const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const map = new Map<
        string,
        {
          label: string;
          tasks: number;
          leetcode: number;
          applications: number;
          easy: number;
          medium: number;
        }
      >(data.map((d) => [d.label, d]));

      finalData = orderedDays.map((day) => {
        const existing = map.get(day);
        return {
          label: day,
          tasks: existing?.tasks || 0,
          leetcode: existing?.leetcode || 0,
          applications: appMap.get(day) || 0,
          easy: existing?.easy || 0,
          medium: existing?.medium || 0,
        };
      });
    }

    // LAST MONTH
    if (period === 'last_month') {
      const weeks = ['W1', 'W2', 'W3', 'W4'];
      const map = new Map<
        string,
        {
          label: string;
          tasks: number;
          leetcode: number;
          applications: number;
          easy: number;
          medium: number;
        }
      >(data.map((d) => [d.label, d]));

      finalData = weeks.map((w) => {
        const existing = map.get(w);
        return {
          label: w,
          tasks: existing?.tasks || 0,
          leetcode: existing?.leetcode || 0,
          applications: appMap.get(w) || 0,
          easy: existing?.easy || 0,
          medium: existing?.medium || 0,
        };
      });
    }
    // ALL TIME
    if (period === 'all') {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const map = new Map<
        string,
        {
          label: string;
          tasks: number;
          leetcode: number;
          applications: number;
          easy: number;
          medium: number;
        }
      >(data.map((d) => [d.label, d]));

      finalData = months.map((m) => {
        const existing = map.get(m);
        return {
          label: m,
          tasks: existing?.tasks || 0,
          leetcode: existing?.leetcode || 0,
          applications: appMap.get(m) || 0,
          easy: existing?.easy || 0,
          medium: existing?.medium || 0,
        };
      });
    }

    return {
      period,
      startDate,
      endDate,
      data: finalData,
    };
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
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status != :superseded', { superseded: 'superseded' });

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
}
