import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column()
  title: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed';

  @Column({ default: false })
  is_ai_generated: boolean;

  @Column({ type: 'date' })
  task_date: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
