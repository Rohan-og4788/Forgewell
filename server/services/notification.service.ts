import { prisma } from '../lib/prisma.ts';
import { type NotificationType } from '@prisma/client';

export interface CreateNotificationDTO {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: any;
}

export class NotificationService {
  async create(data: CreateNotificationDTO) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        link: data.link,
        metadata: data.metadata,
      },
    });
  }

  async list(userId: string, isRead?: boolean, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total, page, limit };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  async markAsRead(id: string, userId: string) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) {
      throw new Error('Notification not found');
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  async delete(id: string, userId: string) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) {
      throw new Error('Notification not found');
    }

    await prisma.notification.delete({ where: { id } });
    return { deleted: true, id };
  }
}

export const notificationService = new NotificationService();
