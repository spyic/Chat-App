import { chatsRepository } from './chats.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { prisma } from '../../config/database';
import { SafeUser, ChatWithParticipants } from '../../types';

function generateDirectKey(userAId: string, userBId: string): string {
  return [userAId, userBId].sort().join('_');
}

function toSafeUser(user: any): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function formatChat(chat: any): ChatWithParticipants {
  return {
    id: chat.id,
    type: chat.type,
    directKey: chat.directKey,
    lastMessageText: chat.lastMessageText,
    lastMessageSenderId: chat.lastMessageSenderId,
    lastMessageAt: chat.lastMessageAt,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    participants: chat.members.map((m: any) => toSafeUser(m.user)),
    unreadCount: 0, // Will be calculated separately if needed
  };
}

export const chatsService = {
  async createOrGetDirectChat(
    currentUserId: string,
    participantId: string
  ): Promise<ChatWithParticipants> {
    if (currentUserId === participantId) {
      throw new BadRequestError('Cannot create a chat with yourself');
    }

    // Verify participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
    });
    if (!participant) {
      throw new NotFoundError('Participant');
    }

    const directKey = generateDirectKey(currentUserId, participantId);

    // Check for existing chat
    const existingChat = await chatsRepository.findChatByDirectKey(directKey);
    if (existingChat) {
      return formatChat(existingChat);
    }

    // Create new chat
    const newChat = await chatsRepository.createDirectChat(
      directKey,
      currentUserId,
      participantId
    );

    return formatChat(newChat);
  },

  async getUserChats(userId: string): Promise<ChatWithParticipants[]> {
    const chats = await chatsRepository.getUserChats(userId);
    return chats.map(formatChat);
  },

  async getChatById(chatId: string): Promise<ChatWithParticipants> {
    const chat = await chatsRepository.getChatById(chatId);
    if (!chat) {
      throw new NotFoundError('Chat');
    }
    return formatChat(chat);
  },

  async verifyChatMembership(chatId: string, userId: string): Promise<void> {
    const isMember = await chatsRepository.isChatMember(chatId, userId);
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this chat');
    }
  },
};

