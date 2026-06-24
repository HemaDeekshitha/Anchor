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
import { LearningTracksService } from 'src/learning-tracks/learning-tracks.service';

@Injectable()
export class RagService {
  // Tracks the timestamp of the last failed generation attempt per user.
  // Retries are allowed after 5 minutes so transient Gemini errors self-heal
  // on the user's next dashboard load without blocking them for the whole day.
  private readonly generationFailedAt = new Map<string, number>();
  private readonly dailyTaskRequests = new Map<string, Promise<any>>();
  private readonly RETRY_AFTER_MS = 5 * 60 * 1000; // 5 minutes

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
    private readonly learningTracksService: LearningTracksService,
  ) {}

  /** Clears the failure throttle for a user and immediately re-runs task generation. */
  async forceRegenerateTasks(userId: string) {
    this.generationFailedAt.delete(userId);
    return this.getDailyTasks(userId);
  }

  private async getUserTimezone(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['timezone'],
    });
    return user?.timezone || 'UTC';
  }

  async getDailyTasks(userId: string, requestedLimit?: number) {
    // One user can have only one daily-plan build in flight, even when two
    // callers request different display limits during onboarding/navigation.
    const requestKey = userId;
    const activeRequest = this.dailyTaskRequests.get(requestKey);
    if (activeRequest) return activeRequest;

    const request = this.getDailyTasksInternal(userId, requestedLimit);
    this.dailyTaskRequests.set(requestKey, request);
    try {
      return await request;
    } finally {
      if (this.dailyTaskRequests.get(requestKey) === request) {
        this.dailyTaskRequests.delete(requestKey);
      }
    }
  }

  private async getDailyTasksInternal(userId: string, requestedLimit?: number) {
    const currentTrack = await this.learningTracksService.getCurrent(userId);
    let mix = await this.performanceService.getDifficultyMix(
      userId,
      requestedLimit,
    );
    let limit = mix.total;
    const timezone = await this.getUserTimezone(userId);
    const today = getTodayInTimezone(timezone);

    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'name'],
    });
    const userName = user?.name || 'there';
    let carriedPlan: UserDailyTask[] = [];

    // Tasks created before learning tracks were introduced have no track_id.
    // Adopt only the rows that fall inside the active track, preserving the
    // user's already-generated questions and progress after an upgrade.
    if (currentTrack) {
      await this.userDailyRepo
        .createQueryBuilder()
        .update(UserDailyTask)
        .set({ track_id: currentTrack.id })
        .where('user_id = :userId', { userId })
        .andWhere('track_id IS NULL')
        .andWhere('DATE(task_date) >= :trackStart', {
          trackStart: currentTrack.startDate,
        })
        .execute();
    }

    // ── 1. Return today's plan if it already exists ──────────────────────────
    const existingPlanQuery = this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('DATE(udt.task_date) = :today', { today });
    // A plan change applies to the next generated set. Today's questions stay
    // stable even when they were created under the previously active track.
    const existingPlan = await existingPlanQuery
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

      if (canonicalPlan.length >= 3) {
        const tasks = await this.fetchTasksFromDailyPlan(canonicalPlan);
        return { userName, tasks: tasks.slice(0, limit) };
      }

      // Repair a previously persisted undersized plan without repeating its tasks.
      carriedPlan = canonicalPlan;
      mix = await this.performanceService.getDifficultyMix(
        userId,
        Math.max(3, limit - canonicalPlan.length),
      );
      limit = mix.total;
    }

    if (currentTrack) {
      const questionTarget =
        currentTrack.questionTarget ??
        currentTrack.roadmap.estimatedQuestionsMax ??
        (currentTrack.durationMonths === 1
          ? 100
          : currentTrack.durationMonths === 3
            ? 225
            : 500);
      const generatedSoFar = await this.userDailyRepo
        .createQueryBuilder('udt')
        .where('udt.user_id = :userId', { userId })
        .andWhere('udt.track_id = :trackId', { trackId: currentTrack.id })
        .getCount();
      const remaining = Math.max(0, questionTarget - generatedSoFar);
      if (remaining === 0) {
        return {
          userName,
          performanceLevel: mix.performanceLevel,
          trackComplete: true,
          tasks: [],
        };
      }

      const constrainedCount = this.constrainCountToQuota(limit, remaining);
      if (constrainedCount !== limit) {
        mix = await this.performanceService.getDifficultyMix(
          userId,
          constrainedCount,
        );
        limit = mix.total;
      }
    }

    const curriculumContext = currentTrack
      ? this.getCurriculumContext(currentTrack)
      : undefined;
    if (
      curriculumContext &&
      curriculumContext.week <= 2 &&
      !['excelling', 'excellent'].includes(mix.performanceLevel) &&
      mix.hard > 0
    ) {
      mix = {
        ...mix,
        easy: mix.easy + mix.hard,
        hard: 0,
      };
    }

    // ── 2. Determine difficulty mix based on past performance ────────────────
    // Deduplication of already-seen task titles is handled inside
    // TaskGenerationService via the user_seen_tasks table (title_key-based),
    // so no separate exclusion list is needed here.
    console.log(`📊 Performance mix for ${userName}:`, mix);

    // ── 3. Generate an adaptive 3–5 fresh tasks via LLM ─────────────────────
    // Seen-task history is fetched inside TaskGenerationService from the
    // user_seen_tasks table — no need to pass recentTitles from here.
    const lastFailedAt = this.generationFailedAt.get(userId);
    if (lastFailedAt && Date.now() - lastFailedAt < this.RETRY_AFTER_MS) {
      const minsLeft = Math.ceil((this.RETRY_AFTER_MS - (Date.now() - lastFailedAt)) / 60000);
      console.warn(
        `⚠️ Skipping generation for ${userName} — failed recently, retry in ${minsLeft} min.`,
      );
      return { userName, tasks: [] };
    }

    const generated = await this.taskGenerationService.generateTasksForToday(
      userId,
      mix,
      curriculumContext,
    );

    // ── 4. Race-condition guard: re-check before saving ───────────────────────
    // A concurrent call (e.g. onboarding fire-and-forget + dashboard load)
    // may have already saved today's plan while LLM was running.
    const raceCheckQuery = this.userDailyRepo
      .createQueryBuilder('udt')
      .where('udt.user_id = :userId', { userId })
      .andWhere('DATE(udt.task_date) = :today', { today });
    // Do not scope this check to the current track: a user may have changed
    // plans while today's already-generated set still belongs to the old one.
    const raceCheckPlan = await raceCheckQuery
      .orderBy('udt.created_at', 'ASC')
      .getMany();

    if (raceCheckPlan.length >= 3) {
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

    // If LLM failed (quota/error), throttle retries to once per 5 minutes
    if (generated.length === 0) {
      this.generationFailedAt.set(userId, Date.now());
      console.warn(
        `⚠️ No tasks generated for ${userName}. Will retry in ${this.RETRY_AFTER_MS / 60000} minutes.`,
      );
      return { userName, tasks: [] };
    }

    this.generationFailedAt.delete(userId); // clear any stale failure flag
    console.log(
      `✨ Generated ${generated.length} tasks for ${userName} (mix: ${JSON.stringify(mix)})`,
    );

    // ── 5. Persist the daily plan ─────────────────────────────────────────────
    const dailyRows = generated.map((task) =>
      this.userDailyRepo.create({
        user_id: userId,
        task_id: task.id,
        track_id: currentTrack?.id ?? null,
        task_date: today,
        status: 'pending',
      }),
    );
    await this.userDailyRepo.save(dailyRows);

    const carriedTasks =
      carriedPlan.length > 0
        ? await this.fetchTasksFromDailyPlan(carriedPlan)
        : [];

    return {
      userName,
      performanceLevel: mix.performanceLevel,
      tasks: [...carriedTasks, ...generated.map((t) => ({
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
      }))],
    };
  }

  private getCurriculumContext(track: NonNullable<Awaited<ReturnType<LearningTracksService['getCurrent']>>>) {
    const start = new Date(`${track.startDate}T00:00:00Z`).getTime();
    const elapsedWeeks = Math.max(
      0,
      Math.floor((Date.now() - start) / (7 * 24 * 60 * 60 * 1000)),
    );
    const week = Math.min(track.roadmap.totalWeeks, elapsedWeeks + 1);
    const roadmapWeek =
      track.roadmap.weeks.find((candidate) => candidate.week === week) ??
      track.roadmap.weeks[track.roadmap.weeks.length - 1];

    return {
      durationMonths: track.durationMonths,
      week,
      totalWeeks: track.roadmap.totalWeeks,
      phase: roadmapWeek.phase,
      focus: roadmapWeek.focus,
      milestone: roadmapWeek.milestone,
    };
  }

  private constrainCountToQuota(preferred: number, remaining: number) {
    const allowed = [3, 4, 5].filter(
      (count) => remaining - count === 0 || remaining - count >= 3,
    );
    if (allowed.length === 0) return Math.min(preferred, remaining);
    return allowed.reduce((closest, candidate) =>
      Math.abs(candidate - preferred) < Math.abs(closest - preferred)
        ? candidate
        : closest,
    );
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
    const currentTrack = await this.learningTracksService.getCurrent(userId);

    const pendingQuery = this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'pending' })
      .andWhere('DATE(udt.task_date) < :today', { today });
    if (currentTrack) {
      pendingQuery.andWhere('udt.track_id = :trackId', {
        trackId: currentTrack.id,
      });
    } else {
      pendingQuery.andWhere('DATE(udt.task_date) >= :weekStart', {
        weekStart: weekStartDate,
      });
    }

    const pending = await pendingQuery
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
      .limit(100)
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
