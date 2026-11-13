import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { messagesService } from './messages.service';
import { getIO } from '../../socket/io';

export const messagesController = {
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chatId = req.params.chatId as string;
      const { text, idempotencyKey } = req.body;
      const message = await messagesService.sendMessage(
        chatId,
        req.user!.userId,
        text,
        idempotencyKey
      );

      // Broadcast to all users in the chat room via Socket.IO
      const io = getIO();
      if (io) {
        io.to(`chat:${chatId}`).emit('chat:new_message', { chatId, message });
      }

      res.status(201).json({ success: true, data: { message } });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chatId = req.params.chatId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const cursor = req.query.cursor as string | undefined;

      const result = await messagesService.getMessages(
        chatId,
        req.user!.userId,
        limit,
        cursor
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chatId = req.params.chatId as string;
      const messageId = req.params.messageId as string;
      await messagesService.markAsRead(chatId, messageId, req.user!.userId);
      res.json({ success: true, message: 'Message marked as read' });
    } catch (error) {
      next(error);
    }
  },

  async markAsDelivered(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chatId = req.params.chatId as string;
      const messageId = req.params.messageId as string;
      await messagesService.markAsDelivered(chatId, messageId, req.user!.userId);
      res.json({ success: true, message: 'Message marked as delivered' });
    } catch (error) {
      next(error);
    }
  },

  async updateLastSeen(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chatId = req.params.chatId as string;
      const { messageId } = req.body;
      await messagesService.updateLastSeen(chatId, req.user!.userId, messageId);
      res.json({ success: true, message: 'Last seen updated' });
    } catch (error) {
      next(error);
    }
  },

  async editMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chatId = req.params.chatId as string;
      const messageId = req.params.messageId as string;
      const { text } = req.body;
      const message = await messagesService.editMessage(
        chatId,
        messageId,
        req.user!.userId,
        text
      );
      res.json({ success: true, data: { message } });
    } catch (error) {
      next(error);
    }
  },

  async deleteMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chatId = req.params.chatId as string;
      const messageId = req.params.messageId as string;
      await messagesService.deleteMessage(chatId, messageId, req.user!.userId);
      res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
      next(error);
    }
  },
};
