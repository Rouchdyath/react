import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('priorities')
export class Priority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  level: number;
}
