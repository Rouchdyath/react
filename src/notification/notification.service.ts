import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
    constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  create(userId: number, message: string) {
    return this.repo.save({
      message,
      user: { id: userId },
    });
  }

  findUserNotifications(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  markAsRead(id: number) {
    return this.repo.update(id, { isRead: true });
  }
}





