import { RequestHandler } from 'express';
import * as notificationService from '../services/notification.service';

export const list: RequestHandler = async (req, res) => {
  const notifications = await notificationService.listForUser(req.user!.id);
  res.json({ notifications });
};

export const markRead: RequestHandler = async (req, res) => {
  const n = await notificationService.markRead(req.user!.id, req.params.id);
  res.json({ notification: n });
};

export const markAllRead: RequestHandler = async (req, res) => {
  await notificationService.markAllRead(req.user!.id);
  res.status(204).end();
};
