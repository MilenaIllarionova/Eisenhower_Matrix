import express, { Application } from 'express';
import cors from 'cors';
import 'express-async-errors';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import projectRoutes from './routes/project.routes';
import teamRoutes from './routes/team.routes';
import notificationRoutes from './routes/notification.routes';
import userRoutes from './routes/user.routes';

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use((req, res, next) => {
    if (env.nodeEnv === 'production' && req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
