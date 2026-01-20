import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketAssignment } from './ticket_assignement.entity';
import { TicketAssignmentsService } from './ticket_assignments.service';
import { TicketAssignmentsController } from './ticket_assignments.controller';
import { NotificationModule } from '../notification/notification.module'; // 🔹 IMPORTANT

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketAssignment]),
    NotificationModule, // 🔹 Ajouter ici
  ],
  providers: [TicketAssignmentsService],
  controllers: [TicketAssignmentsController],
})
export class TicketAssignmentsModule {}
