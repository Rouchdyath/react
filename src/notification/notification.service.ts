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
      isRead: false,
    });
  }

  findUserNotifications(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  findUnreadNotifications(userId: number) {
    return this.repo.find({
      where: { 
        user: { id: userId },
        isRead: false 
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number) {
    await this.repo.update(id, { isRead: true });
    return this.repo.findOne({ where: { id } });
  }

  async markAllAsRead(userId: number) {
    return this.repo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true }
    );
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}