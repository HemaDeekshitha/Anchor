import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  constructor() {}

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  // 🔐 hashed password
  @Column({ type: 'varchar', nullable: true })
  provider: 'local' | 'google';

  @Column({ type: 'varchar', nullable: true })
  provider_id: string;

  @CreateDateColumn()
  createdAt: Date;
  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiresAt: Date | null;

  /**
   * Number of "360 Points" this user has earned by converting Anchor Points.
   * 500 Anchor Points → 1 "360 Point" (universal cross-platform currency).
   */
  @Column({ type: 'int', default: 0 })
  points_360: number;
  @Column({ nullable: true })
  timezone: string;

  @Column({ default: true })
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailOtpHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailOtpExpiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  emailOtpSentAt: Date | null;

  @Column({ type: 'int', default: 0 })
  emailOtpAttempts: number;

  @Column({ type: 'varchar', nullable: true })
  pendingEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  emailOtpPurpose:
    | 'signup'
    | 'email_change'
    | 'password_change'
    | 'password_reset'
    | null;
}
