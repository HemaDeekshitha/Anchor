import { Entity, PrimaryGeneratedColumn, Column, Unique, Index } from 'typeorm';

@Entity('user_skills')
@Unique(['userId', 'skillId'])
export class UserSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() // faster queries by user
  @Column()
  userId: string;

  @Index() // faster joins with skills table
  @Column()
  skillId: number;
  @Column()
  skillName: string;

  @Column({ default: 'rag' })
  source: string;

  @Column({ type: 'float', nullable: true })
  confidence: number;
}
