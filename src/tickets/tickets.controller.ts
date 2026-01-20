import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getTickets() {
    return this.ticketsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard) // ← AJOUTEZ le guard
  createTicket(@Body() data, @Req() req) { // ← AJOUTEZ @Req() req
    return this.ticketsService.create(data, req.user); // ← PASSEZ req.user
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateTicketStatusDto,
    @Req() req,
  ) {
    return this.ticketsService.updateStatus(
      +id,
      dto.status,
      req.user,
    );
  }
}