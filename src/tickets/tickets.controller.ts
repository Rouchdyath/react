import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard) // ← Active JWT + Rôles pour tout le controller
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @Roles('admin', 'agent') // ← Seuls admin et agent peuvent voir tous les tickets
  getTickets(@Query() query: any) {
    // Support des filtres pour les agents
    const filters = {
      status: query.status ? query.status.split(',') : undefined,
      priority: query.priority ? query.priority.split(',') : undefined,
      assignedAgent: query.assignedAgent,
      client: query.client,
      search: query.search,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };
    return this.ticketsService.findAllWithFilters(filters);
  }

  @Get('my-tickets')
  @Roles('client', 'agent', 'admin') // ← Tout le monde peut voir ses propres tickets
  getMyTickets(@Req() req) {
    console.log('🎫 Récupération des tickets pour l\'utilisateur:', req.user);
    return this.ticketsService.findByUser(req.user.sub || req.user.id);
  }

  @Get(':id')
  @Roles('client', 'agent', 'admin') // ← Tout le monde peut voir un ticket spécifique
  getTicketById(@Param('id') id: number, @Req() req) {
    console.log('🎫 Récupération du ticket ID:', id, 'pour l\'utilisateur:', req.user);
    return this.ticketsService.findOne(+id, req.user);
  }

  @Post()
  @Roles('client', 'agent', 'admin') // ← Tout le monde peut créer un ticket
  createTicket(@Body() data, @Req() req) {
    console.log('📝 Création de ticket, data:', data);
    console.log('👤 User from request:', req.user);
    return this.ticketsService.create(data, req.user);
  }

  @Patch(':id/status')
  @Roles('agent', 'admin') // ← Seuls agent et admin peuvent changer le statut
  updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateTicketStatusDto,
    @Req() req,
  ) {
    return this.ticketsService.updateStatus(+id, dto.status, req.user);
  }

  @Patch(':id/priority')
  @Roles('agent', 'admin') // ← Seuls agent et admin peuvent changer la priorité
  updatePriority(
    @Param('id') id: number,
    @Body() dto: { priority: string },
    @Req() req,
  ) {
    return this.ticketsService.updatePriority(+id, dto.priority, req.user);
  }

  @Patch(':id/assign')
  @Roles('agent', 'admin') // ← Seuls agent et admin peuvent assigner des tickets
  assignTicket(
    @Param('id') id: number,
    @Body() dto: { agentId: string },
    @Req() req,
  ) {
    return this.ticketsService.assignTicket(+id, dto.agentId, req.user);
  }

  @Patch('bulk/status')
  @Roles('agent', 'admin') // ← Actions en lot pour les agents
  bulkUpdateStatus(
    @Body() dto: { ticketIds: string[], status: string },
    @Req() req,
  ) {
    console.log('🔄 Bulk update request:', dto, 'User:', req.user?.role);
    return this.ticketsService.bulkUpdateStatus(dto.ticketIds, dto.status, req.user);
  }

  @Get(':id/comments')
  @Roles('client', 'agent', 'admin') // ← Tout le monde peut voir les commentaires d'un ticket
  getTicketComments(@Param('id') id: number, @Req() req) {
    return this.ticketsService.getTicketComments(+id, req.user);
  }

  @Post(':id/comments')
  @Roles('client', 'agent', 'admin') // ← Tout le monde peut ajouter des commentaires
  addTicketComment(
    @Param('id') id: number,
    @Body() dto: { content: string, isInternal?: boolean },
    @Req() req,
  ) {
    return this.ticketsService.addTicketComment(+id, dto.content, dto.isInternal || false, req.user);
  }
}
