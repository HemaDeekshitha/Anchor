import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RagTask } from './rag-task.entity';
import { Repository, In } from 'typeorm';
import { UserDailyTask } from './rag-daily-user-tasks.entity';
import { diff } from 'util';
import { UserPointsLedger } from 'src/points/user-points-ledger.entity';

@Injectable()
export class RagService {
  constructor(
    @InjectRepository(RagTask)
    private ragTaskRepo: Repository<RagTask>,
    @InjectRepository(UserDailyTask)
    private readonly userDailyRepo: Repository<UserDailyTask>,
    @InjectRepository(UserPointsLedger)
    private readonly pointsRepo: Repository<UserPointsLedger>,
  ) {}

  async getDailyTasks(userId: string, limit = 4) {
    const today = new Date().toISOString().slice(0, 10);

    const existingPlan = await this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('DATE(udt.task_date) = :today', { today })
      .getMany();

    console.log(`📅 Checking for tasks on ${today}`);
    console.log(`📋 Found ${existingPlan.length} existing tasks`);

    if (existingPlan.length > 0) {
      console.log('✅ Returning existing plan');
      return this.fetchTasksFromDailyPlan(existingPlan);
    }

    console.log('🆕 Generating new tasks for today');

    // ✅ Exclude recently completed tasks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentDate = sevenDaysAgo.toISOString().slice(0, 10);

    const recentlyCompleted = await this.userDailyRepo
      .createQueryBuilder('udt')
      .select('udt.task_id', 'task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .andWhere('DATE(udt.task_date) >= :recentDate', { recentDate })
      .getRawMany();

    const excludeTaskIds = recentlyCompleted
      .map((r) => r.task_id)
      .filter((id) => id !== undefined);

    console.log(
      `🚫 Excluding ${excludeTaskIds.length} recently completed tasks`,
    );

    const baseQuery = this.ragTaskRepo
      .createQueryBuilder('task')
      .where('task.is_active = true');

    if (excludeTaskIds.length > 0) {
      baseQuery.andWhere('task.id NOT IN (:...excludeIds)', {
        excludeIds: excludeTaskIds,
      });
    }
    // 1️⃣ Hard task (High priority)
    const hardTask = await baseQuery
      .clone()
      .andWhere('task.difficulty = :difficulty', { difficulty: 'hard' })
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    console.log('Hard tasks:', hardTask.length);

    // 2️⃣ Medium tasks
    const mediumTasks = await baseQuery
      .clone()
      .andWhere('task.difficulty = :difficulty', { difficulty: 'medium' })
      .orderBy('RANDOM()')
      .limit(2)
      .getMany();
    console.log('Medium tasks:', mediumTasks.length);

    // 3️⃣ random task
    const easyTask = await baseQuery
      .clone()
      .andWhere('task.difficulty = :difficulty', { difficulty: 'easy' })
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    console.log('Easy tasks:', easyTask.length);
    const tasks = [...hardTask, ...mediumTasks, ...easyTask];

    console.log(`✨ Generated ${tasks.length} fresh tasks`);

    if (tasks.length === 0) {
      console.warn('⚠️ No tasks available! All tasks recently completed?');
      // Fallback: just get any random tasks
      const fallbackTasks = await this.ragTaskRepo
        .createQueryBuilder('task')
        .where('task.is_active = true')
        .orderBy('RANDOM()')
        .limit(limit)
        .getMany();
      tasks.push(...fallbackTasks);
    }

    const dailyTasks = tasks.map((task) =>
      this.userDailyRepo.create({
        user_id: userId,
        task_id: task.id,
        task_date: today,
        status: 'pending',
      }),
    );

    await this.userDailyRepo.save(dailyTasks);

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      difficulty: t.difficulty,
      priority: t.priority,
      status: 'pending',
      date: today,
      task_date: today,
      is_ai_generated: true,
    }));
  }

  private async fetchTasksFromDailyPlan(dailyTasks: UserDailyTask[]) {
    const taskIds = dailyTasks.map((d) => d.task_id);

    const tasks = await this.ragTaskRepo.find({
      where: { id: In(taskIds) },
    });

    return tasks.map((task) => {
      const daily = dailyTasks.find((d) => d.task_id === task.id);
      return {
        id: task.id,
        title: task.title,
        category: task.category,
        difficulty: task.difficulty,
        priority: task.priority,
        status: daily?.status ?? 'pending',
        date: daily?.task_date,
        task_date: daily?.task_date,
        is_ai_generated: true,
      };
    });
  }

  async getPendingTasks(userId: string) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Current week in UTC with Sunday as the first day
    // Week start Monday
    const day = now.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;

    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() + diff);
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekStartDate = weekStart.toISOString().slice(0, 10);

    const pending = await this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'pending' })
      .andWhere('DATE(udt.task_date) >= :weekStart', {
        weekStart: weekStartDate,
      })
      .andWhere('DATE(udt.task_date) < :today', { today })
      .select([
        'udt.id as "id"',
        'task.id as "taskId"',
        'task.title as "title"',
        'task.category as "category"',
        'udt.status as "status"',
        'udt.task_date as "date"',
        'task.priority as "priority"',
      ])
      .orderBy('udt.task_date', 'ASC')
      .getRawMany();

    return pending;
  }

  async clearTasksForDate(userId: string, date: string) {
    const result = await this.userDailyRepo
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId })
      .andWhere('DATE(task_date) = :date', { date })
      .execute();

    return result.affected;
  }

  async getWeeklyMilestones(userId: string) {
    const now = new Date();

    // Start of week (Monday)
    const day = now.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;

    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() + diff);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekStartDate = weekStart.toISOString().slice(0, 10);

    const tasks = await this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('task.priority = :priority', { priority: 'high' })
      .select([
        'udt.id as "id"',
        'task.title as "title"',
        'task.difficulty as "difficulty"',
        'udt.status as "status"',
        'udt.task_date as "date"',
      ])
      .orderBy('udt.task_date', 'ASC')
      .limit(5)
      .getRawMany();

    const completed = tasks.filter((t) => t.status === 'completed').length;

    return {
      summary: {
        completed,
        total: tasks.length,
      },
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.status === 'completed',
        date: t.date,
        difficulty: t.difficulty,
      })),
    };
  }

  async getAnalytics(userId: string) {
    const now = new Date();

    // Start of current week (Monday)
    const day = now.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;

    const currentWeekStart = new Date(now);
    currentWeekStart.setUTCDate(now.getUTCDate() + diff);
    currentWeekStart.setUTCHours(0, 0, 0, 0);

    // Start of last week
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setUTCDate(currentWeekStart.getUTCDate() - 7);

    // End of last week
    const lastWeekEnd = new Date(currentWeekStart);
    lastWeekEnd.setUTCSeconds(-1);

    const currentWeekStartDate = currentWeekStart.toISOString().slice(0, 10);
    const lastWeekStartDate = lastWeekStart.toISOString().slice(0, 10);
    const lastWeekEndDate = lastWeekEnd.toISOString().slice(0, 10);

    // -----------------------------
    // THIS WEEK TASKS
    // -----------------------------

    const totalTasks = await this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('DATE(udt.task_date) >= :weekStart', {
        weekStart: currentWeekStartDate,
      })
      .getCount();

    const completedTasks = await this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .andWhere('DATE(udt.task_date) >= :weekStart', {
        weekStart: currentWeekStartDate,
      })
      .getCount();

    const dsaSolved = await this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .andWhere('task.category = :category', { category: 'DSA' })
      .andWhere('DATE(udt.task_date) >= :weekStart', {
        weekStart: currentWeekStartDate,
      })
      .getCount();

    // -----------------------------
    // LAST WEEK TASKS
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

      // Skip today if tasks exist but not all completed
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
    // STREAK REWARD LOGIC
    // -----------------------------

    const STREAK_REWARD_TARGET = 5;
    const STREAK_REWARD_POINTS = 50;

    if (streak == STREAK_REWARD_TARGET) {
      const existingReward = await this.pointsRepo
        .createQueryBuilder('upl')
        .where('upl.user_id = :userId', { userId })
        .andWhere('upl.type = :type', { type: 'streak_reward' })
        .getOne();

      if (!existingReward) {
        await this.pointsRepo.save(
          this.pointsRepo.create({
            task_id: null,
            user_id: userId,
            amount: STREAK_REWARD_POINTS,
            type: 'streak_reward',
          }),
        );
      }
    }
    // -----------------------------
    // REWARDS / ANCHOR POINTS
    // -----------------------------

    // total points balance (task_earned positive, converted negative)
    const totalRow = await this.pointsRepo
      .createQueryBuilder('upl')
      .select('COALESCE(SUM(upl.amount), 0)', 'total')
      .where('upl.user_id = :userId', { userId })
      .getRawOne();

    const totalPoints = Number(totalRow?.total) || 0;

    // how many conversions happened (count entries)
    const conversionsRow = await this.pointsRepo
      .createQueryBuilder('upl')
      .select('COUNT(*)', 'count')
      .where('upl.user_id = :userId', { userId })
      .andWhere('upl.type = :type', { type: 'converted_to_360' })
      .getRawOne();

    const conversions360 = Number(conversionsRow?.count) || 0;

    // optional: total AP earned from tasks (ignores conversions)
    const earnedRow = await this.pointsRepo
      .createQueryBuilder('upl')
      .select('COALESCE(SUM(upl.amount), 0)', 'earned')
      .where('upl.user_id = :userId', { userId })
      .andWhere('upl.type = :type', { type: 'task_earned' })
      .getRawOne();

    const lifetimeApEarned = Number(earnedRow?.earned) || 0;

    // current AP balance towards next conversion (0..99)
    const apBalance = ((totalPoints % 100) + 100) % 100; // safe even if negative
    const apNeeded = apBalance === 0 ? 100 : 100 - apBalance;

    // -----------------------------
    // AP EARNED THIS WEEK
    // -----------------------------

    const apEarnedThisWeek = await this.pointsRepo
      .createQueryBuilder('upl')
      .select('COALESCE(SUM(upl.amount),0)', 'points')
      .where('upl.user_id = :userId', { userId })
      .andWhere('upl.type = :type', { type: 'task_earned' })
      .andWhere('DATE(upl.created_at) >= :weekStart', {
        weekStart: currentWeekStartDate,
      })
      .getRawOne();

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
    const pointsThisWeek = Number(apEarnedThisWeek?.points) || 0;
    const pointsLastWeek = Number(apEarnedLastWeek?.points) || 0;

    return {
      dsaSolved,
      dsaSolvedLastWeek: lastWeekDsaSolved,

      tasksCompleted: completedTasks,
      tasksCompletedLastWeek: lastWeekTasksCompleted,
      tasksTotal: totalTasks,

      applicationsSent: 8, // static for now
      applicationsLastWeek: 5, // static placeholder

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
    // We want last 7 days including today, in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 6); // last 7 days window

    const startDate = start.toISOString().slice(0, 10);
    const endDate = today.toISOString().slice(0, 10);

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
      d.setUTCDate(start.getUTCDate() + i);

      const iso = d.toISOString().slice(0, 10);

      const dayIndex = d.getUTCDay(); // Sun=0
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
