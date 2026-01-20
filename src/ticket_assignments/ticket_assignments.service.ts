import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketAssignment } from './ticket_assignement.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TicketAssignmentsService {

  constructor(
    @InjectRepository(TicketAssignment)
    private readonly assignmentRepository: Repository<TicketAssignment>,
    private readonly notificationsService: NotificationService,
  ) {}

  // ✅ async obligatoire
  async assignTicket(ticketId: number, agentId: number) {

    const assignment = this.assignmentRepository.create({
      ticket: { id: ticketId },
      agent: { id: agentId },
    });

    await this.assignmentRepository.save(assignment);

    // ✅ notification APRÈS la sauvegarde
    await this.notificationsService.create(
      agentId,
      'Un ticket vous a été assigné',
    );

    return assignment;
  }

  findAll() {
    return this.assignmentRepository.find({
      relations: ['ticket', 'agent'],
    });
  }
}
