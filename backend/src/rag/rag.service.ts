import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RagTask } from './rag-task.entity';
import { Repository, In } from 'typeorm';
import { UserDailyTask } from './rag-daily-user-tasks.entity';

@Injectable()
export class RagService {
  constructor(
    @InjectRepository(RagTask)
    private ragTaskRepo: Repository<RagTask>,
    @InjectRepository(UserDailyTask)
    private readonly userDailyRepo: Repository<UserDailyTask>,
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
      .select('udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'completed' })
      .andWhere('DATE(udt.task_date) >= :recentDate', { recentDate })
      .getRawMany();

    const excludeTaskIds = recentlyCompleted.map((r) => r.task_id);

    console.log(
      `🚫 Excluding ${excludeTaskIds.length} recently completed tasks`,
    );

    let query = this.ragTaskRepo
      .createQueryBuilder('task')
      .where('task.is_active = true');

    if (excludeTaskIds.length > 0) {
      query = query.andWhere('task.id NOT IN (:...excludeIds)', {
        excludeIds: excludeTaskIds,
      });
    }

    const tasks = await query.orderBy('RANDOM()').limit(limit).getMany();

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
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay());
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

    // Start of week (Sunday)
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay());
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekStartDate = weekStart.toISOString().slice(0, 10);

    const tasks = await this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('task.difficulty = :difficulty', { difficulty: 'hard' })
      .select([
        'udt.id as "id"',
        'task.title as "title"',
        'udt.status as "status"',
        'udt.task_date as "date"',
      ])
      .orderBy('udt.task_date', 'ASC')
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
      })),
    };
  }
}
