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

  // 🔹 Récupérer tous les tickets
  findAll() {
    return this.ticketsRepository.find({
      relations: ['user', 'priority', 'assignedTo', 'comments'],
    });
  }

  // 🔹 Créer un ticket
  async create(data: Partial<Ticket>, user: any) {
  const ticketData = {
    title: data.title,
    description: data.description,
    status: data.status || TicketStatus.OPEN,
    user: { id: user.sub || user.id },
    priority: data.priority,
    ...(data.assignedTo && { assignedTo: data.assignedTo }),
  };

  const ticket = await this.ticketsRepository.save(ticketData);

  await this.notificationsService.create(
    user.sub || user.id,
    'Votre ticket a été créé avec succès',
  );

  return ticket;
}

  // 🔹 Mettre à jour le status d'un ticket
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

    // Règle métier : client ne peut fermer que son ticket
    if (user.role === 'client' && status !== TicketStatus.CLOSED) {
      throw new ForbiddenException(
        'Le client ne peut que fermer son ticket',
      );
    }

    ticket.status = status;
    await this.ticketsRepository.save(ticket);

    // Notification après changement de status
    await this.notificationsService.create(
      ticket.user.id,
      `Statut du ticket changé en ${status}`,
    );

    return ticket;
  }
}
