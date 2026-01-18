import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('onboarding_responses')
export class OnboardingResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 👇 Each onboarding answer as its own column

  @Column('text', { array: true, nullable: true })
  primaryFocus: string[] | null;

  @Column('text', { array: true, nullable: true })
  currentStatus: string[] | null;

  @Column('text', { array: true, nullable: true })
  preferredRole: string[] | null;

  @Column('text', { array: true, nullable: true })
  areasOfInterest: string[] | null;

  @Column('text', { array: true, nullable: true })
  employmentType: string[] | null;

  // Resume data
  @Column({ nullable: true })
  resumeName?: string;

  @Column({ nullable: true })
  resumeUrl?: string;

  @Column({ type: 'text', nullable: true })
  resumeText: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
