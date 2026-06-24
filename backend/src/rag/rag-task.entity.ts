import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('rag_tasks')
export class RagTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  category: string;

  @Column({ type: 'text' })
  difficulty: 'easy' | 'medium' | 'hard';

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags: string[];

  @Column({ type: 'int' })
  time_minutes: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'text', default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  // NULL = shared global task, set = user-specific AI-generated task
  @Column({ type: 'uuid', nullable: true, default: null })
  user_id: string | null;

  // Optional detailed description for AI-generated tasks
  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  // LeetCode URL for DSA category tasks (e.g. https://leetcode.com/problems/two-sum/)
  @Column({ type: 'text', nullable: true, default: null })
  leetcodeUrl: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  source_keywords: string[];

  @Column({ type: 'text', nullable: true, default: null })
  source_resume_point: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  selection_reason: string | null;
}
