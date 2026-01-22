import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards } from '@nestjs/common';
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
  getTickets() {
    return this.ticketsService.findAll();
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
}
