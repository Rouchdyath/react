import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
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

  // 🔹 Récupérer tous les tickets avec filtres (pour les agents)
  async findAllWithFilters(filters: any = {}) {
    const queryBuilder = this.ticketsRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.priority', 'priority')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
      .leftJoinAndSelect('ticket.comments', 'comments')
      .orderBy('ticket.createdAt', 'DESC');

    // Filtrer par statut
    if (filters.status && filters.status.length > 0) {
      queryBuilder.andWhere('ticket.status IN (:...statuses)', { statuses: filters.status });
    }

    // Filtrer par priorité
    if (filters.priority && filters.priority.length > 0) {
      queryBuilder.andWhere('priority.label IN (:...priorities)', { priorities: filters.priority });
    }

    // Filtrer par agent assigné
    if (filters.assignedAgent) {
      queryBuilder.andWhere('assignedTo.id = :agentId', { agentId: filters.assignedAgent });
    }

    // Filtrer par client
    if (filters.client) {
      queryBuilder.andWhere('user.name LIKE :clientName', { clientName: `%${filters.client}%` });
    }

    // Recherche dans titre et description
    if (filters.search) {
      queryBuilder.andWhere(
        '(ticket.title LIKE :search OR ticket.description LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Filtrer par plage de dates
    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('ticket.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    return queryBuilder.getMany();
  }

  // 🔹 Récupérer tous les tickets (méthode de compatibilité)
  findAll() {
    return this.findAllWithFilters();
  }

  // 🔹 Récupérer les tickets d'un utilisateur spécifique
  findByUser(userId: number) {
    return this.ticketsRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'priority', 'assignedTo', 'comments'],
      order: { createdAt: 'DESC' }
    });
  }

  // 🔹 Récupérer un ticket spécifique
  async findOne(ticketId: number, user: any) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: ['user', 'priority', 'assignedTo', 'comments'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    // Vérifier que le client ne peut voir que ses propres tickets
    if (user.role === 'client' && ticket.user.id !== (user.sub || user.id)) {
      throw new ForbiddenException('Vous ne pouvez voir que vos propres tickets');
    }

    return ticket;
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

  // 🔹 Mettre à jour la priorité d'un ticket
  async updatePriority(ticketId: number, priorityId: string, user: any) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: ['user', 'priority'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    // Seuls les agents et admins peuvent changer la priorité
    if (user.role === 'client') {
      throw new ForbiddenException('Seuls les agents peuvent modifier la priorité');
    }

    // Mettre à jour la priorité
    ticket.priority = { id: parseInt(priorityId) } as any;
    await this.ticketsRepository.save(ticket);

    // Notification
    await this.notificationsService.create(
      ticket.user.id,
      `Priorité du ticket modifiée`,
    );

    return ticket;
  }

  // 🔹 Assigner un ticket à un agent
  async assignTicket(ticketId: number, agentId: string, user: any) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: ['user', 'assignedTo'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    // Seuls les agents et admins peuvent assigner des tickets
    if (user.role === 'client') {
      throw new ForbiddenException('Seuls les agents peuvent assigner des tickets');
    }

    // Assigner le ticket
    ticket.assignedTo = { id: parseInt(agentId) } as any;
    await this.ticketsRepository.save(ticket);

    // Notifications
    await this.notificationsService.create(
      ticket.user.id,
      `Votre ticket a été assigné à un agent`,
    );

    await this.notificationsService.create(
      parseInt(agentId),
      `Un nouveau ticket vous a été assigné`,
    );

    return ticket;
  }

  // 🔹 Mise à jour en lot des statuts
  async bulkUpdateStatus(ticketIds: (string | number)[], status: string, user: any) {
    console.log('🔄 Bulk update - IDs reçus:', ticketIds, 'Type:', typeof ticketIds[0], 'Status:', status, 'User:', user.role);
    
    // Seuls les agents et admins peuvent faire des actions en lot
    if (user.role === 'client') {
      throw new ForbiddenException('Seuls les agents peuvent effectuer des actions en lot');
    }

    // Valider le statut
    if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
      throw new BadRequestException(`Statut invalide: ${status}. Statuts valides: ${Object.values(TicketStatus).join(', ')}`);
    }

    // Convertir les IDs en nombres et filtrer les valides
    const numericIds = ticketIds
      .map(id => {
        const num = typeof id === 'number' ? id : parseInt(id.toString());
        return isNaN(num) ? null : num;
      })
      .filter(id => id !== null);

    console.log('🔢 IDs convertis:', numericIds);

    if (numericIds.length === 0) {
      throw new BadRequestException('Aucun ID de ticket valide fourni');
    }

    // Vérifier que les tickets existent
    const tickets = await this.ticketsRepository.find({
      where: { id: In(numericIds) },
      relations: ['user']
    });

    console.log('🎫 Tickets trouvés:', tickets.length, 'sur', numericIds.length, 'demandés');

    if (tickets.length === 0) {
      throw new NotFoundException('Aucun ticket trouvé avec les IDs fournis');
    }

    // Mettre à jour tous les tickets
    try {
      const updateResult = await this.ticketsRepository.update(
        { id: In(numericIds) },
        { status: status as TicketStatus }
      );

      console.log('✅ Mise à jour effectuée:', updateResult.affected, 'tickets');

      // Envoyer des notifications pour chaque ticket (sans bloquer si ça échoue)
      const notificationPromises = tickets.map(async (ticket) => {
        try {
          await this.notificationsService.create(
            ticket.user.id,
            `Statut du ticket changé en ${status}`,
          );
        } catch (notifError) {
          console.error('Erreur notification pour ticket', ticket.id, ':', notifError.message);
        }
      });

      // Attendre toutes les notifications sans bloquer
      await Promise.allSettled(notificationPromises);

      return { 
        updated: updateResult.affected || tickets.length,
        ticketsFound: tickets.length,
        ticketsRequested: numericIds.length
      };
    } catch (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      throw new BadRequestException(`Erreur lors de la mise à jour: ${updateError.message}`);
    }
  }

  // 🔹 Récupérer les commentaires d'un ticket
  async getTicketComments(ticketId: number, user: any) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: ['user', 'comments', 'comments.user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    // Vérifier les permissions
    if (user.role === 'client' && ticket.user.id !== (user.sub || user.id)) {
      throw new ForbiddenException('Vous ne pouvez voir que les commentaires de vos propres tickets');
    }

    // Filtrer les commentaires internes pour les clients
    let comments = ticket.comments || [];
    if (user.role === 'client') {
      comments = comments.filter(comment => !comment.isInternal);
    }

    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // 🔹 Ajouter un commentaire à un ticket
  async addTicketComment(ticketId: number, content: string, isInternal: boolean, user: any) {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Le commentaire ne peut pas être vide');
    }

    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: ['user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    // Vérifier les permissions
    if (user.role === 'client' && ticket.user.id !== (user.sub || user.id)) {
      throw new ForbiddenException('Vous ne pouvez commenter que vos propres tickets');
    }

    // Les clients ne peuvent pas créer de commentaires internes
    if (user.role === 'client' && isInternal) {
      throw new ForbiddenException('Les clients ne peuvent pas créer de commentaires internes');
    }

    // Créer le commentaire (ici on simule, il faudrait utiliser le service comments)
    const comment = {
      id: Date.now(), // Temporaire
      content: content.trim(),
      isInternal,
      authorId: user.sub || user.id,
      authorName: user.name || 'Utilisateur',
      authorRole: user.role,
      ticketId,
      createdAt: new Date(),
    };

    // Notification au client si c'est un commentaire d'agent
    if (user.role !== 'client' && !isInternal) {
      await this.notificationsService.create(
        ticket.user.id,
        `Nouveau commentaire sur votre ticket`,
      );
    }

    return comment;
  }
}
