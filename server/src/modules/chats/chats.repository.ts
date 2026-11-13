import { prisma } from '../../config/database';
import { ChatMember } from '@prisma/client';

export const chatsRepository = {
  async findChatByDirectKey(directKey: string) {
    return prisma.chat.findUnique({
      where: { directKey },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  },

  async createDirectChat(directKey: string, userAId: string, userBId: string) {
    return prisma.chat.create({
      data: {
        type: 'DIRECT',
        directKey,
        members: {
          create: [
            { userId: userAId },
            { userId: userBId },
          ],
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  },

  async getChatById(chatId: string) {
    return prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  },

  async getUserChats(userId: string) {
    return prisma.chat.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      orderBy: [
        { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });
  },

  async isChatMember(chatId: string, userId: string): Promise<boolean> {
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: { chatId, userId },
      },
    });
    return !!member;
  },

  async updateChatLastMessage(
    chatId: string,
    text: string,
    senderId: string,
    timestamp: Date
  ) {
    return prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessageText: text,
        lastMessageSenderId: senderId,
        lastMessageAt: timestamp,
      },
    });
  },
};

