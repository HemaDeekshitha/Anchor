import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RagTask } from './rag-task.entity';
import { Repository, In, IsNull, Not } from 'typeorm';
import { UserDailyTask } from './rag-daily-user-tasks.entity';
import { User } from 'src/users/user.entity';
import { TaskSubmission } from 'src/submissions/submission.entity';
import {
  getTodayInTimezone,
  getWeekStartInTimezone,
} from 'src/common/utils/date.util';
import { TaskGenerationService } from './task-generation.service';
import { PerformanceService } from './performance.service';

@Injectable()
export class RagService {
  // Tracks users whose task generation already failed today.
  // Key: userId, Value: date string (YYYY-MM-DD).
  // Prevents repeated Gemini calls when quota is exhausted — the dashboard
  // would otherwise retry on every page load since nothing is saved to DB on failure.
  private readonly generationFailedOnDate = new Map<string, string>();

  constructor(
    @InjectRepository(RagTask)
    private ragTaskRepo: Repository<RagTask>,

    @InjectRepository(UserDailyTask)
    private readonly userDailyRepo: Repository<UserDailyTask>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(TaskSubmission)
    private readonly submissionRepo: Repository<TaskSubmission>,

    private readonly taskGenerationService: TaskGenerationService,
    private readonly performanceService: PerformanceService,
  ) {}

  private async getUserTimezone(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['timezone'],
    });
    return user?.timezone || 'UTC';
  }

  async getDailyTasks(userId: string, limit = 4) {
    const timezone = await this.getUserTimezone(userId);
    const today = getTodayInTimezone(timezone);

    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'name'],
    });
    const userName = user?.name || 'there';

    // ── 1. Return today's plan if it already exists ──────────────────────────
    const existingPlan = await this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('DATE(udt.task_date) = :today', { today })
      .orderBy('udt.created_at', 'ASC')
      .getMany();

    if (existingPlan.length > 0) {
      const seenTaskIds = new Set<number>();
      const canonicalPlan: UserDailyTask[] = [];

      for (const row of existingPlan) {
        if (seenTaskIds.has(row.task_id) || canonicalPlan.length >= limit)
          continue;
        seenTaskIds.add(row.task_id);
        canonicalPlan.push(row);
      }

      const tasks = await this.fetchTasksFromDailyPlan(canonicalPlan);
      return { userName, tasks: tasks.slice(0, limit) };
    }

    // ── 2. Collect excluded task IDs ─────────────────────────────────────────
    // Exclude tasks the user has already COMPLETED (never repeat them).
    const everSolvedRows = await this.userDailyRepo
      .createQueryBuilder('udt')
      .select('udt.task_id', 'task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .getRawMany();

    const solvedIds: number[] = everSolvedRows
      .map((r) => r.task_id as number)
      .filter((id) => id != null);

    // Also exclude tasks assigned in the past 7 days (pending or completed)
    // so the same task isn't shown two days in a row.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCutoff = sevenDaysAgo.toISOString().slice(0, 10);

    const recentlyAssignedRows = await this.userDailyRepo
      .createQueryBuilder('udt')
      .select('udt.task_id', 'task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('DATE(udt.task_date) >= :recentCutoff', { recentCutoff })
      .getRawMany();

    const recentlyAssignedIds: number[] = recentlyAssignedRows
      .map((r) => r.task_id as number)
      .filter((id) => id != null);

    // ── 3. Determine difficulty mix based on past performance ─────────────────
    const mix = await this.performanceService.getDifficultyMix(userId);
    console.log(`📊 Performance mix for ${userName}:`, mix);

    // ── 4. Generate exactly 4 fresh tasks via LLM ────────────────────────────
    // Seen-task history is now fetched inside TaskGenerationService from the
    // user_seen_tasks table — no need to pass recentTitles from here.
    if (this.generationFailedOnDate.get(userId) === today) {
      console.warn(
        `⚠️ Skipping generation for ${userName} — already failed today.`,
      );
      return { userName, tasks: [] };
    }

    const generated = await this.taskGenerationService.generateTasksForToday(
      userId,
      mix,
    );

    // ── 6. Race-condition guard: re-check before saving ───────────────────────
    // A concurrent call (e.g. onboarding fire-and-forget + dashboard load)
    // may have already saved today's plan while LLM was running.
    const raceCheckPlan = await this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('DATE(udt.task_date) = :today', { today })
      .orderBy('udt.created_at', 'ASC')
      .getMany();

    if (raceCheckPlan.length > 0) {
      const seenTaskIds = new Set<number>();
      const canonicalPlan: UserDailyTask[] = [];
      for (const row of raceCheckPlan) {
        if (seenTaskIds.has(row.task_id) || canonicalPlan.length >= limit)
          continue;
        seenTaskIds.add(row.task_id);
        canonicalPlan.push(row);
      }
      const tasks = await this.fetchTasksFromDailyPlan(canonicalPlan);
      return { userName, tasks: tasks.slice(0, limit) };
    }

    // If LLM failed (quota), mark it so we don't retry again today
    if (generated.length === 0) {
      this.generationFailedOnDate.set(userId, today);
      console.warn(
        `⚠️ No tasks generated for ${userName} — quota exhausted. Will not retry today.`,
      );
      return { userName, tasks: [] };
    }

    this.generationFailedOnDate.delete(userId); // clear any stale failure flag
    console.log(
      `✨ Generated ${generated.length} tasks for ${userName} (mix: ${JSON.stringify(mix)})`,
    );

    // ── 7. Persist the daily plan ─────────────────────────────────────────────
    const dailyRows = generated.map((task) =>
      this.userDailyRepo.create({
        user_id: userId,
        task_id: task.id,
        task_date: today,
        status: 'pending',
      }),
    );
    await this.userDailyRepo.save(dailyRows);

    return {
      userName,
      performanceLevel: mix.performanceLevel,
      tasks: generated.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? null,
        category: t.category,
        difficulty: t.difficulty,
        priority: t.priority,
        status: 'pending',
        date: today,
        task_date: today,
        is_ai_generated: true,
        leetcodeUrl: t.leetcodeUrl ?? null,
      })),
    };
  }

  private async fetchTasksFromDailyPlan(dailyTasks: UserDailyTask[]) {
    const taskIds = dailyTasks.map((d) => d.task_id);
    const tasks = await this.ragTaskRepo.find({ where: { id: In(taskIds) } });

    return tasks.map((task) => {
      const daily = dailyTasks.find((d) => d.task_id === task.id);
      return {
        id: task.id,
        title: task.title,
        description: task.description ?? null,
        category: task.category,
        difficulty: task.difficulty,
        priority: task.priority,
        status: daily?.status ?? 'pending',
        date: daily?.task_date,
        task_date: daily?.task_date,
        is_ai_generated: task.user_id !== null,
        leetcodeUrl: task.leetcodeUrl ?? null,
      };
    });
  }

  async getPendingTasks(userId: string) {
    const timezone = await this.getUserTimezone(userId);
    const today = getTodayInTimezone(timezone);
    const weekStartDate = getWeekStartInTimezone(timezone);

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
        'task.difficulty as "difficulty"',
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

  /**
   * Returns a full day-by-day history of the user's daily plans and their
   * submission outcomes — used by the History screen.
   */
  async getHistory(userId: string, limit = 30) {
    // Fetch all past daily plans — date DESC, then created_at ASC so within
    // each day the row order matches getDailyTasks (which sorts by created_at ASC).
    const dailyPlans = await this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .select([
        'udt.id as "dailyId"',
        'udt.task_id as "taskId"',
        'udt.task_date as "date"',
        'udt.created_at as "createdAt"',
        'udt.status as "completionStatus"',
        'task.title as "title"',
        'task.category as "category"',
        'task.difficulty as "difficulty"',
        'task.priority as "priority"',
      ])
      .orderBy('udt.task_date', 'DESC')
      .addOrderBy('udt.created_at', 'ASC')
      .getRawMany();

    if (dailyPlans.length === 0) return { history: [] };

    // Fetch all user submissions in one query
    const taskIds = [...new Set(dailyPlans.map((r) => r.taskId as number))];
    const submissions = await this.submissionRepo.find({
      where: { user_id: userId, task_id: In(taskIds) },
      order: { submitted_at: 'DESC' },
    });

    // Build a map: task_id → latest approved submission (or latest if none approved)
    const submissionMap = new Map<number, (typeof submissions)[0]>();
    for (const sub of submissions) {
      const existing = submissionMap.get(sub.task_id);
      if (!existing) {
        submissionMap.set(sub.task_id, sub);
      } else if (sub.status === 'approved' && existing.status !== 'approved') {
        submissionMap.set(sub.task_id, sub);
      }
    }

    // Group by date — deduplicate task_ids per day (same fix as getDailyTasks)
    const byDate = new Map<string, typeof dailyPlans>();
    for (const row of dailyPlans) {
      const dateStr =
        typeof row.date === 'string'
          ? row.date.slice(0, 10)
          : new Date(row.date).toISOString().slice(0, 10);
      if (!byDate.has(dateStr)) byDate.set(dateStr, []);
      byDate.get(dateStr)!.push(row);
    }

    // Sort dates descending and apply limit
    const sortedDates = [...byDate.keys()]
      .sort((a, b) => b.localeCompare(a))
      .slice(0, limit);

    const history = sortedDates.map((date) => {
      const allRows = byDate.get(date)!;

      // Keep only first 4 unique task_ids (earliest created wins — same as getDailyTasks)
      const seenIds = new Set<number>();
      const rows: typeof dailyPlans = [];
      for (const r of allRows) {
        if (seenIds.has(r.taskId as number) || rows.length >= 4) continue;
        seenIds.add(r.taskId as number);
        rows.push(r);
      }

      const total = rows.length;
      const completedCount = rows.filter(
        (r) => r.completionStatus === 'completed',
      ).length;

      const tasks = rows.map((row) => {
        const sub = submissionMap.get(row.taskId as number);
        return {
          taskId: row.taskId,
          title: row.title,
          category: row.category,
          difficulty: row.difficulty,
          priority: row.priority,
          completionStatus: row.completionStatus as string,
          // Submission details (null if not submitted yet)
          submissionStatus: sub?.status ?? null,
          score: sub?.ai_result?.score ?? null,
          feedback: sub?.ai_result?.feedback ?? null,
          answer: sub?.text_content ?? null,
          submittedAt: sub?.submitted_at ?? null,
        };
      });

      // Day score = average of approved submission scores (or 0 if none)
      const scoredTasks = tasks.filter((t) => t.score != null);
      const dayScore =
        scoredTasks.length > 0
          ? Math.round(
              (scoredTasks.reduce((sum, t) => sum + (t.score ?? 0), 0) /
                scoredTasks.length) *
                10,
            ) / 10
          : null;

      return {
        date,
        completedCount,
        totalCount: total,
        dayScore,
        tasks,
      };
    });

    return { history };
  }
}
