import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('user_daily_tasks')
export class UserDailyTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column()
  task_id: number;

  @Column({ type: 'date' })
  task_date: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed';

  @CreateDateColumn()
  created_at: Date;
}
