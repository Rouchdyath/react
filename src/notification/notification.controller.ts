 import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import {  NotificationService } from './notification.service';
@UseGuards(JwtAuthGuard)
@Controller('notifications')

export class NotificationController {
    constructor(private service: NotificationService) {}

  @Get()
  getMyNotifications(@Req() req) {
    return this.service.findUserNotifications(req.user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: number) {
    return this.service.markAsRead(id);
  }
}


