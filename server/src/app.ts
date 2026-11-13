import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, apiLimiter } from './middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { chatsRoutes } from './modules/chats/chats.routes';
import { messagesRoutes } from './modules/messages/messages.routes';
import { messagesController } from './modules/messages/messages.controller';
import { authenticate } from './middleware/auth';
import { validate } from './middleware/validate';
import { lastSeenSchema } from './modules/messages/messages.schema';
import { isUserOnline, getOnlineUserIds } from './socket';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Online users endpoint
app.get('/api/online-users', authenticate, (_req, res) => {
  res.json({ success: true, data: { onlineUserIds: getOnlineUserIds() } });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/chats/:chatId/messages', messagesRoutes);
app.use(
  '/api/chats/:chatId/last-seen',
  authenticate,
  validate(lastSeenSchema),
  messagesController.updateLastSeen
);

// Error handler (must be last)
app.use(errorHandler);

export { app };

