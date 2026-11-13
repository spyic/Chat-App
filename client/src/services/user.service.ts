import api from './api';
import type { User, ApiResponse } from '../types';

export const userService = {
  async getAll(): Promise<User[]> {
    const res = await api.get<ApiResponse<{ users: User[] }>>('/users');
    return res.data.data.users;
  },

  async search(query: string): Promise<User[]> {
    const res = await api.get<ApiResponse<{ users: User[] }>>(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data.data.users;
  },

  async getById(userId: string): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>(`/users/${userId}`);
    return res.data.data.user;
  },
};
