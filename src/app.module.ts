import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PrioritiesModule } from './priorities/priorities.module';
import { TicketsModule } from './tickets/tickets.module';
import { TicketAssignmentsModule } from './ticket_assignments/ticket_assignments.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'ticket_db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    UsersModule,
    PrioritiesModule,
    TicketsModule,
    TicketAssignmentsModule,
    AuthModule,
    NotificationModule,
  ],
})
export class AppModule {}
