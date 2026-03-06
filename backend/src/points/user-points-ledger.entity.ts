import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { RagTask } from '../rag/rag-task.entity';

export type PointsEntryType =
  | 'task_earned'
  | 'converted_to_360'
  | 'streak_reward';

/**
 * Ledger-style table that records every point transaction for a user.
 *
 * A user's current balance is always derived by summing all `amount`
 * values for their user_id:
 *   SELECT SUM(amount) FROM user_points_ledger WHERE user_id = $1
 *
 * Entry types:
 *  - task_earned      → +25  (one task completed & approved)
 *  - converted_to_360 → -500 (redeemed for 1 "360 Point")
 */
@Entity('user_points_ledger')
@Index(['user_id', 'task_id']) // fast duplicate-earn check
export class UserPointsLedger {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Relations ────────────────────────────────────────────────────────

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Populated only for 'task_earned' entries so we can guard against
   * awarding points twice for the same task.
   */
  @Column({ nullable: true })
  task_id: number | null;

  @ManyToOne(() => RagTask, { nullable: true })
  @JoinColumn({ name: 'task_id' })
  task: RagTask | null;

  // ── Core fields ──────────────────────────────────────────────────────

  /**
   * Signed integer:
   *  +25  for task_earned
   *  -500 for converted_to_360
   */
  @Column({ type: 'int' })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['task_earned', 'converted_to_360', 'streak_reward'],
  })
  type: PointsEntryType;

  @CreateDateColumn()
  created_at: Date;
}
