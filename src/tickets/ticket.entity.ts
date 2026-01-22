import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Priority } from '../priorities/priorities.entity';
import { Comment } from '../comments/comments.entity';
import { TicketStatus } from './ticket-status.enum';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @ManyToOne(() => Priority)
  @JoinColumn({ name: 'priority_id' })
  priority: Priority;

  @OneToMany(() => Comment, comment => comment.ticket)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}