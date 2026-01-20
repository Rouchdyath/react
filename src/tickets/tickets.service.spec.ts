import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { TicketStatus } from './ticket-status.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TicketsService {

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    private readonly notificationsService: NotificationService,
  ) {}

  findAll() {
    return this.ticketsRepository.find({
      relations: ['user', 'priority'],
    });
  }

  async create(data: Partial<Ticket>) {
    return this.ticketsRepository.save(data);
  }

  async updateStatus(
    ticketId: number,
    status: TicketStatus,
    user: any,
  ) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: ['user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    if (user.role === 'client' && status !== TicketStatus.CLOSED) {
      throw new ForbiddenException(
        'Le client ne peut que fermer son ticket',
      );
    }

    ticket.status = status;
    await this.ticketsRepository.save(ticket);

    await this.notificationsService.create(
      ticket.user.id,
      `Statut du ticket changé en ${status}`,
    );

    return ticket;
  }
}
