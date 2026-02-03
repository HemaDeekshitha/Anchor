import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RagTask } from './rag-task.entity';
import { Repository } from 'typeorm';
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

    const existingPlan = await this.userDailyRepo.find({
      where: { user_id: userId, task_date: today },
    });

    if (existingPlan.length > 0) {
      // Return saved plan (stable across refresh)
      return this.fetchTasksFromDailyPlan(existingPlan);
    }

    const tasks = await this.ragTaskRepo
      .createQueryBuilder('task')
      .where('task.is_active = true')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    const dailyTasks = tasks.map((task) =>
      this.userDailyRepo.create({
        user_id: userId,
        task_id: task.id,
        task_date: today,
      }),
    );

    await this.userDailyRepo.save(dailyTasks);

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: 'pending',
    }));
  }

  private async fetchTasksFromDailyPlan(dailyTasks: UserDailyTask[]) {
    const taskIds = dailyTasks.map((d) => d.task_id);

    const tasks = await this.ragTaskRepo.findByIds(taskIds);

    return tasks.map((task) => {
      const daily = dailyTasks.find((d) => d.task_id === task.id);
      return {
        id: task.id,
        title: task.title,
        status: daily?.status ?? 'pending',
      };
    });
  }

  async getPendingTasks(userId: string) {
    const today = new Date().toISOString().slice(0, 10);

    const pending = await this.userDailyRepo
      .createQueryBuilder('udt')
      .innerJoin(RagTask, 'task', 'task.id = udt.task_id')
      .where('udt.user_id = :userId', { userId })
      .andWhere('udt.status = :status', { status: 'pending' })
      .andWhere('udt.task_date < :today', { today })
      .select(['task.id as id', 'task.title as title', 'udt.task_date as date'])
      .getRawMany();

    return pending;
  }
}
