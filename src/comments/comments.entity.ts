import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Ticket } from '../tickets/ticket.entity'; // Ajuste le chemin selon ta structure
import { User } from '../users/users.entity'; // Ajuste le chemin selon ta structure

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ticket, ticket => ticket.comments)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  message: string;

  @CreateDateColumn()
  created_at: Date;
}