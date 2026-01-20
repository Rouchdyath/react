import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { NotificationModule } from '../notification/notification.module'; // ✅ import

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    NotificationModule, // ✅ nécessaire pour avoir NotificationService
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
