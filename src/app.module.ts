import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PrioritiesModule } from './priorities/priorities.module';
import { TicketsModule } from './tickets/tickets.module';
import { TicketAssignmentsModule } from './ticket_assignments/ticket_assignments.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { CommentsModule } from './comments/comments.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    // Charge .env et rend ConfigModule disponible partout
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'hopitaluser',
      password: '1234',
      database: 'ticket1_db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    UsersModule,
    PrioritiesModule,
    TicketsModule,
    TicketAssignmentsModule,
    AuthModule,
    NotificationModule,
    CommentsModule,
    StatsModule,
  ],
})
export class AppModule {}