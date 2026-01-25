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
      order: { createdAt: 'ASC' }
    });
  }

  create(data: Partial<Comment>) {
    const comment = this.repo.create(data);
    return this.repo.save(comment);
  }

  async update(id: number, content: string, user: any) {
    const comment = await this.repo.findOne({ 
      where: { id },
      relations: ['user']
    });
    
    if (!comment) {
      throw new Error('Commentaire introuvable');
    }

    // Seul l'auteur ou un admin peut modifier
    if (comment.user.id !== (user.sub || user.id) && user.role !== 'admin') {
      throw new Error('Vous ne pouvez modifier que vos propres commentaires');
    }

    comment.message = content;
    return this.repo.save(comment);
  }

  async delete(id: number, user: any) {
    const comment = await this.repo.findOne({ 
      where: { id },
      relations: ['user']
    });
    
    if (!comment) {
      throw new Error('Commentaire introuvable');
    }

    // Seul l'auteur ou un admin peut supprimer
    if (comment.user.id !== (user.sub || user.id) && user.role !== 'admin') {
      throw new Error('Vous ne pouvez supprimer que vos propres commentaires');
    }

    return this.repo.delete(id);
  }
}