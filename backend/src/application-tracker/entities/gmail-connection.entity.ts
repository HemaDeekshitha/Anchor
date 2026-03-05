// C:\Users\nsais\Anchor\backend\src\application-tracker\entities\gmail-connection.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class GmailConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gmailEmail: string;

  @Column({ type: 'text' })
  accessToken: string;

  @Column({ type: 'text' })
  refreshToken: string;

  @Column({ nullable: true })
  tokenExpiry: Date;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  lastSyncTimestamp: Date;

  @ManyToOne(() => User)
  user: User;
}