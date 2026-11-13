import { messagesRepository } from './messages.repository';
import { chatsRepository } from '../chats/chats.repository';
import { chatsService } from '../chats/chats.service';
import { FirestoreMessage, PaginatedMessages } from '../../types';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export const messagesService = {
  /**
   * Send a message - shared between REST and Socket.IO
   */
  async sendMessage(
    chatId: string,
    senderId: string,
    text: string,
    idempotencyKey?: string
  ): Promise<FirestoreMessage> {
    // Verify chat membership
    await chatsService.verifyChatMembership(chatId, senderId);

    // Save to Firestore
    const message = await messagesRepository.createMessage(
      chatId,
      senderId,
      text,
      idempotencyKey
    );

    // Update PostgreSQL chat summary (best-effort, retry once)
    try {
      await chatsRepository.updateChatLastMessage(
        chatId,
        text.substring(0, 200), // Truncate for summary
        senderId,
        new Date(message.createdAt)
      );
    } catch (error) {
      logger.error('Failed to update chat summary in PostgreSQL', {
        chatId,
        messageId: message.id,
        error,
      });
      // Retry once
      try {
        await chatsRepository.updateChatLastMessage(
          chatId,
          text.substring(0, 200),
          senderId,
          new Date(message.createdAt)
        );
      } catch (retryError) {
        logger.error('Retry failed for chat summary update', {
          chatId,
          messageId: message.id,
          error: retryError,
        });
        // Don't throw - message is already saved in Firestore
        // This is a known consistency limitation between PG and Firestore
      }
    }

    return message;
  },

  /**
   * Get messages with pagination
   */
  async getMessages(
    chatId: string,
    userId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<PaginatedMessages> {
    await chatsService.verifyChatMembership(chatId, userId);
    return messagesRepository.getMessages(chatId, limit, cursor);
  },

  /**
   * Mark a message as read
   */
  async markAsRead(
    chatId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    await chatsService.verifyChatMembership(chatId, userId);

    const message = await messagesRepository.getMessageById(chatId, messageId);
    if (!message) {
      throw new NotFoundError('Message');
    }

    // Don't mark own messages as read
    if (message.senderId === userId) {
      return;
    }

    await messagesRepository.markAsRead(chatId, messageId, userId);
  },

  /**
   * Mark a message as delivered
   */
  async markAsDelivered(
    chatId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    await chatsService.verifyChatMembership(chatId, userId);

    const message = await messagesRepository.getMessageById(chatId, messageId);
    if (!message) {
      throw new NotFoundError('Message');
    }

    if (message.senderId === userId) {
      return;
    }

    await messagesRepository.markAsDelivered(chatId, messageId, userId);
  },

  /**
   * Update last-seen position
   */
  async updateLastSeen(
    chatId: string,
    userId: string,
    messageId: string
  ): Promise<void> {
    await chatsService.verifyChatMembership(chatId, userId);

    const message = await messagesRepository.getMessageById(chatId, messageId);
    if (!message) {
      throw new NotFoundError('Message');
    }

    await messagesRepository.updateLastSeen(chatId, userId, messageId);
  },

  /**
   * Edit a message (owner only)
   */
  async editMessage(
    chatId: string,
    messageId: string,
    userId: string,
    newText: string
  ): Promise<FirestoreMessage> {
    await chatsService.verifyChatMembership(chatId, userId);

    const message = await messagesRepository.getMessageById(chatId, messageId);
    if (!message) {
      throw new NotFoundError('Message');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenError('You can only edit your own messages');
    }

    if (message.deleted) {
      throw new BadRequestError('Cannot edit a deleted message');
    }

    return messagesRepository.editMessage(chatId, messageId, newText);
  },

  /**
   * Soft delete a message (owner only)
   */
  async deleteMessage(
    chatId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    await chatsService.verifyChatMembership(chatId, userId);

    const message = await messagesRepository.getMessageById(chatId, messageId);
    if (!message) {
      throw new NotFoundError('Message');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenError('You can only delete your own messages');
    }

    await messagesRepository.softDeleteMessage(chatId, messageId);
  },
};

