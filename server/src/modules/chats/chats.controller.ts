import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { chatsService } from './chats.service';
import { getIO } from '../../socket/io';

export const chatsController = {
  async createOrGetChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const participantId = req.body.participantId;
      const chat = await chatsService.createOrGetDirectChat(currentUserId, participantId);

      // Notify both users via Socket.IO so their sockets join the new room
      // and the chat appears in their sidebar instantly
      const io = getIO();
      if (io) {
        // Make both users' sockets join the new chat room dynamically
        const allSockets = await io.fetchSockets();
        for (const s of allSockets) {
          const sUserId = s.data?.userId;
          if (sUserId === currentUserId || sUserId === participantId) {
            s.join(`chat:${chat.id}`);
          }
        }
        // Emit to both users' personal rooms
        io.to(`user:${participantId}`).emit('chat:created', { chat });
        io.to(`user:${currentUserId}`).emit('chat:created', { chat });
      }

      res.status(200).json({ success: true, data: { chat } });
    } catch (error) {
      next(error);
    }
  },

  async getUserChats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chats = await chatsService.getUserChats(req.user!.userId);
      res.json({ success: true, data: { chats } });
    } catch (error) {
      next(error);
    }
  },

  async getChatById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chatId = req.params.chatId as string;
      await chatsService.verifyChatMembership(chatId, req.user!.userId);
      const chat = await chatsService.getChatById(chatId);
      res.json({ success: true, data: { chat } });
    } catch (error) {
      next(error);
    }
  },
};
