import { Notification, NotificationType } from '../models';
import { emitToUser } from '../sockets';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
  taskId?: string;
  teamId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await Notification.create({
    userId: input.userId,
    type: input.type,
    message: input.message,
    taskId: input.taskId,
    teamId: input.teamId,
  });

  emitToUser(input.userId, 'notification:new', notification.toJSON());
  return notification;
}

export async function markRead(userId: string, notificationId: string) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true },
  );
}

export async function markAllRead(userId: string) {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
}

export async function listForUser(userId: string) {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(100);
}
