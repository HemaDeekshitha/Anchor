import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
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
}
