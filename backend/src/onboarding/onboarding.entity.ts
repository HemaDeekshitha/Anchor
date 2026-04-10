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
  @Column({ nullable: true }) // ← TEMP
  userId: string;

  @Column('text', { array: true, nullable: true })
  primaryFocus: string[] | null;

  @Column('text', { array: true, nullable: true })
  currentStatus: string[] | null;

  @Column('text', { array: true, nullable: true })
  preferredRole: string[] | null;

  // The single committed role derived from the user's first/primary preferredRole selection.
  // Used as the authoritative base for task generation and role-type detection.
  @Column({ type: 'text', nullable: true })
  dedicatedRole: string | null;

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

  // Auto-extracted or manually set location (e.g. "Fremont, CA")
  @Column({ type: 'text', nullable: true })
  location: string | null;

  // AI-extracted keywords from the resume (role, tools, domain concepts, etc.)
  @Column('text', { array: true, nullable: true })
  resumeKeywords: string[] | null;

  @CreateDateColumn()
  createdAt: Date;
  @Column({ type: 'text', nullable: true })
  profileImageUrl: string | null;

  @Column({ type: 'varchar' , nullable: true })
  yearsOfExperience: string | null;
}
