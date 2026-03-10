import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  category: string;
  @Column({ type: 'jsonb', nullable: true })
  aliases: string[];
  @Column({
    type: 'vector' as any,
    length: 1536,
    nullable: true,
  })
  embedding: number[];
}
