import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comments.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private repo: Repository<Comment>
  ) {}

  findAll() {
    return this.repo.find({ relations: ['ticket', 'user'] });
  }

  findByTicket(ticketId: number) {
    return this.repo.find({ 
      where: { ticket: { id: ticketId } },
      relations: ['user'],
      order: { created_at: 'ASC' }
    });
  }

  create(data: Partial<Comment>) {
    const comment = this.repo.create(data);
    return this.repo.save(comment);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}