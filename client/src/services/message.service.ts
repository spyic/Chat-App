import api from './api';
import type { Message, ApiResponse, PaginatedMessages } from '../types';

export const messageService = {
  async send(chatId: string, text: string, idempotencyKey?: string): Promise<Message> {
    const res = await api.post<ApiResponse<{ message: Message }>>(
      `/chats/${chatId}/messages`,
      { text, idempotencyKey }
    );
    return res.data.data.message;
  },

  async getMessages(chatId: string, limit = 50, cursor?: string): Promise<PaginatedMessages> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    const res = await api.get<ApiResponse<PaginatedMessages>>(
      `/chats/${chatId}/messages?${params}`
    );
    return res.data.data;
  },

  async markAsRead(chatId: string, messageId: string): Promise<void> {
    await api.post(`/chats/${chatId}/messages/${messageId}/read`);
  },

  async markAsDelivered(chatId: string, messageId: string): Promise<void> {
    await api.post(`/chats/${chatId}/messages/${messageId}/delivered`);
  },

  async updateLastSeen(chatId: string, messageId: string): Promise<void> {
    await api.post(`/chats/${chatId}/last-seen`, { messageId });
  },

  async editMessage(chatId: string, messageId: string, text: string): Promise<Message> {
    const res = await api.patch<ApiResponse<{ message: Message }>>(
      `/chats/${chatId}/messages/${messageId}`,
      { text }
    );
    return res.data.data.message;
  },

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    await api.delete(`/chats/${chatId}/messages/${messageId}`);
  },
};
