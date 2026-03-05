// C:\Users\nsais\Anchor\backend\src\application-tracker\entities\job-application.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  company: string;

  @Column()
  role: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  threadId: string;

  @Column({ nullable: true })
  lastMessageId: string;

  @Column({ nullable: true })
  sourceEmail: string;

  @Column({ type: 'timestamp' })
  appliedDate: Date;
}