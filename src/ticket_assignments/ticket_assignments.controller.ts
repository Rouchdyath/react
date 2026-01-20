import { Controller, Post, Get, Body } from '@nestjs/common';
import { TicketAssignmentsService } from './ticket_assignments.service';

@Controller('assignments')
export class TicketAssignmentsController {
  constructor(private readonly service: TicketAssignmentsService) {}

  @Post()
  assign(@Body() data: { ticketId: number; agentId: number }) {
    return this.service.assignTicket(data.ticketId, data.agentId);
  }

  @Get()
  getAll() {
    return this.service.findAll();
  }
}
