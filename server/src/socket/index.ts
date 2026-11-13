import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { messagesService } from '../modules/messages/messages.service';
import { chatsService } from '../modules/chats/chats.service';
import { chatsRepository } from '../modules/chats/chats.repository';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map<string, Set<string>>();

export function setupSocketIO(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string;
        email: string;
      };
      socket.userId = decoded.userId;
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    logger.info('User connected', { userId, socketId: socket.id });

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId });

    // Auto-join ALL user's chat rooms so they receive messages for every conversation
    (async () => {
      try {
        const userChats = await chatsRepository.getUserChats(userId);
        for (const chat of userChats) {
          socket.join(`chat:${chat.id}`);
        }
        // Also join a personal room for direct notifications
        socket.join(`user:${userId}`);
        logger.debug('Auto-joined chat rooms', { userId, count: userChats.length });
      } catch (error) {
        logger.error('Failed to auto-join chat rooms', { userId, error });
      }
    })();

    // Join a chat room
    socket.on('chat:join', async (data: { chatId: string }) => {
      try {
        await chatsService.verifyChatMembership(data.chatId, userId);
        socket.join(`chat:${data.chatId}`);
        socket.emit('chat:joined', { chatId: data.chatId });
        logger.debug('User joined chat room', { userId, chatId: data.chatId });
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to join chat' });
      }
    });

    // Leave a chat room
    socket.on('chat:leave', (data: { chatId: string }) => {
      socket.leave(`chat:${data.chatId}`);
      logger.debug('User left chat room', { userId, chatId: data.chatId });
    });

    // Send a message via socket
    socket.on(
      'message:send',
      async (data: { chatId: string; text: string; idempotencyKey?: string }) => {
        try {
          const message = await messagesService.sendMessage(
            data.chatId,
            userId,
            data.text,
            data.idempotencyKey
          );

          // Emit to sender confirmation
          socket.emit('chat:message_sent', { chatId: data.chatId, message });

          // Broadcast to all in room (including sender for consistency)
          io.to(`chat:${data.chatId}`).emit('chat:new_message', {
            chatId: data.chatId,
            message,
          });
        } catch (error: any) {
          socket.emit('error', { message: error.message || 'Failed to send message' });
        }
      }
    );

    // Read receipt
    socket.on('message:read', async (data: { chatId: string; messageId: string }) => {
      try {
        await messagesService.markAsRead(data.chatId, data.messageId, userId);
        io.to(`chat:${data.chatId}`).emit('chat:message_read', {
          chatId: data.chatId,
          messageId: data.messageId,
          userId,
          readAt: new Date().toISOString(),
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to mark as read' });
      }
    });

    // Delivery receipt
    socket.on('message:delivered', async (data: { chatId: string; messageId: string }) => {
      try {
        await messagesService.markAsDelivered(data.chatId, data.messageId, userId);
        io.to(`chat:${data.chatId}`).emit('chat:message_delivered', {
          chatId: data.chatId,
          messageId: data.messageId,
          userId,
          deliveredAt: new Date().toISOString(),
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to mark as delivered' });
      }
    });

    // Typing indicators
    socket.on('typing:start', (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('chat:typing', {
        chatId: data.chatId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('chat:typing', {
        chatId: data.chatId,
        userId,
        isTyping: false,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info('User disconnected', { userId, socketId: socket.id });

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Broadcast offline only when all sockets are disconnected
          socket.broadcast.emit('user:offline', { userId });
        }
      }
    });
  });

  return io;
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId) && onlineUsers.get(userId)!.size > 0;
}

export function getOnlineUserIds(): string[] {
  return Array.from(onlineUsers.keys());
}

