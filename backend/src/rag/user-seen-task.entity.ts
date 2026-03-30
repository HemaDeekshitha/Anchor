import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_seen_tasks')
@Index(['user_id', 'title_key'], { unique: true })
export class UserSeenTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  // FK reference kept as a plain column to avoid circular-dep issues with RagTask.
  @Column({ type: 'int' })
  task_id: number;

  // Normalized title (lowercase + trimmed) used for exact dedup matching.
  @Column({ type: 'text' })
  title_key: string;

  @CreateDateColumn()
  first_seen: Date;
}