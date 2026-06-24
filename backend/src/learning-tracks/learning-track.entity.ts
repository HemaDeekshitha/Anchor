import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TrackDurationMonths = 1 | 3 | 6;
export type TrackStatus = 'active' | 'paused' | 'completed';

export interface RoadmapPhase {
  name: string;
  startWeek: number;
  endWeek: number;
  outcome: string;
  competencies: string[];
}

export interface RoadmapWeek {
  week: number;
  phase: string;
  focus: string[];
  milestone: string;
}

export interface TrackRoadmap {
  totalWeeks: number;
  learningDaysPerWeek: number;
  estimatedQuestionsMin: number;
  estimatedQuestionsMax: number;
  phases: RoadmapPhase[];
  weeks: RoadmapWeek[];
}

@Entity('learning_tracks')
export class LearningTrack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 160 })
  targetRole: string;

  @Column({ type: 'varchar', length: 120 })
  blueprintSlug: string;

  @Column({ type: 'int', default: 1 })
  blueprintVersion: number;

  @Column({ type: 'smallint' })
  durationMonths: TrackDurationMonths;

  @Column({ type: 'int', nullable: true })
  questionTarget: number | null;

  @Column({ type: 'smallint', default: 5 })
  learningDaysPerWeek: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  targetDate: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: TrackStatus;

  @Column({ type: 'jsonb' })
  roadmap: TrackRoadmap;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
