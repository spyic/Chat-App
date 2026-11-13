import api from './api';
import type { Chat, ApiResponse } from '../types';

export const chatService = {
  async createOrGet(participantId: string): Promise<Chat> {
    const res = await api.post<ApiResponse<{ chat: Chat }>>('/chats', { participantId });
    return res.data.data.chat;
  },

  async getMyChats(): Promise<Chat[]> {
    const res = await api.get<ApiResponse<{ chats: Chat[] }>>('/chats');
    return res.data.data.chats;
  },

  async getById(chatId: string): Promise<Chat> {
    const res = await api.get<ApiResponse<{ chat: Chat }>>(`/chats/${chatId}`);
    return res.data.data.chat;
  },
};
