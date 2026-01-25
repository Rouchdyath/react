import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';
import { TicketStatus } from '../tickets/ticket-status.enum';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  async getDashboardStats() {
    // Compter tous les tickets
    const totalTickets = await this.ticketsRepository.count();

    // Compter par statut
    const ticketsByStatus = {
      open: await this.ticketsRepository.count({ where: { status: TicketStatus.OPEN } }),
      in_progress: await this.ticketsRepository.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      resolved: await this.ticketsRepository.count({ where: { status: TicketStatus.RESOLVED } }),
      closed: await this.ticketsRepository.count({ where: { status: TicketStatus.CLOSED } }),
    };

    // Compter par priorité
    const ticketsByPriority = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.priority', 'priority')
      .select('priority.label', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('priority.label')
      .getRawMany();

    const priorityStats = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    ticketsByPriority.forEach(item => {
      const priority = item.priority?.toLowerCase();
      if (priority && priorityStats.hasOwnProperty(priority)) {
        priorityStats[priority] = parseInt(item.count);
      }
    });

    // Calculer le temps moyen de résolution (en minutes)
    const resolvedTickets = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .where('ticket.status = :status', { status: TicketStatus.RESOLVED })
      .getMany();

    let averageResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalTime = resolvedTickets.reduce((sum, ticket) => {
        const resolutionTime = new Date(ticket.updatedAt).getTime() - new Date(ticket.createdAt).getTime();
        return sum + resolutionTime;
      }, 0);
      averageResolutionTime = totalTime / resolvedTickets.length / (1000 * 60); // Convertir en minutes
    }

    // Statistiques personnelles (pour l'agent connecté)
    // TODO: Récupérer l'ID de l'agent connecté depuis le contexte
    const myAssignedTickets = 0; // Placeholder
    const myResolvedToday = 0; // Placeholder

    return {
      totalTickets,
      ticketsByStatus,
      ticketsByPriority: priorityStats,
      averageResolutionTime: Math.round(averageResolutionTime),
      myAssignedTickets,
      myResolvedToday,
    };
  }

  async getAgentStats(agentId: number) {
    const ticketsAssigned = await this.ticketsRepository.count({
      where: { assignedTo: { id: agentId } }
    });

    const ticketsResolved = await this.ticketsRepository.count({
      where: { 
        assignedTo: { id: agentId },
        status: TicketStatus.RESOLVED
      }
    });

    // Tickets résolus aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const ticketsResolvedToday = await this.ticketsRepository.count({
      where: {
        assignedTo: { id: agentId },
        status: TicketStatus.RESOLVED,
        updatedAt: {
          $gte: today,
          $lt: tomorrow
        } as any
      }
    });

    // Temps moyen de résolution pour cet agent
    const resolvedTickets = await this.ticketsRepository.find({
      where: { 
        assignedTo: { id: agentId },
        status: TicketStatus.RESOLVED
      }
    });

    let averageResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalTime = resolvedTickets.reduce((sum, ticket) => {
        const resolutionTime = new Date(ticket.updatedAt).getTime() - new Date(ticket.createdAt).getTime();
        return sum + resolutionTime;
      }, 0);
      averageResolutionTime = totalTime / resolvedTickets.length / (1000 * 60); // En minutes
    }

    return {
      ticketsAssigned,
      ticketsResolved,
      averageResolutionTime: Math.round(averageResolutionTime),
      ticketsResolvedToday,
    };
  }

  async getStatsByPeriod(startDate: Date, endDate: Date) {
    const tickets = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .where('ticket.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .getMany();

    const totalTickets = tickets.length;
    const ticketsByStatus = {
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      in_progress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
      closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
    };

    return {
      period: { startDate, endDate },
      totalTickets,
      ticketsByStatus,
    };
  }

  async getPerformanceMetrics() {
    // Métriques de performance globales
    const totalTickets = await this.ticketsRepository.count();
    const openTickets = await this.ticketsRepository.count({ 
      where: { status: TicketStatus.OPEN } 
    });
    const resolvedTickets = await this.ticketsRepository.count({ 
      where: { status: TicketStatus.RESOLVED } 
    });

    const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
    const pendingRate = totalTickets > 0 ? (openTickets / totalTickets) * 100 : 0;

    return {
      totalTickets,
      resolutionRate: Math.round(resolutionRate * 100) / 100,
      pendingRate: Math.round(pendingRate * 100) / 100,
      averageTicketsPerDay: 0, // TODO: Calculer basé sur l'historique
    };
  }
}