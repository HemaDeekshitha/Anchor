import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { RagTask } from '../rag/rag-task.entity';

@Entity('task_submissions')
export class TaskSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  // Foreign key to users table
  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Foreign key to rag_tasks table
  @Column()
  task_id: number;

  @ManyToOne(() => RagTask)
  @JoinColumn({ name: 'task_id' })
  task: RagTask;

  // For now, only text submissions
  @Column({ type: 'text', default: 'text' })
  submission_type: 'text' | 'screenshot';

  // The actual answer the user submitted
  @Column({ type: 'text' })
  text_content: string;

  // AI evaluation result stored as JSON
  @Column({ type: 'jsonb' })
  ai_result: {
    score: number;
    feedback: string;
    approved: boolean;
    confidence: number;
    details: any;
  };

  // Overall status
  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  // When user submitted
  @CreateDateColumn()
  submitted_at: Date;

  // When AI verified it
  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;
}
