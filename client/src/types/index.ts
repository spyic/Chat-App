export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Chat {
  id: string;
  type: 'DIRECT' | 'GROUP';
  directKey?: string | null;
  participants: User[];
  lastMessageText?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  deleted: boolean;
  readBy?: string[];
  deliveredTo?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedMessages {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface TypingEvent {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export interface ReadReceiptEvent {
  chatId: string;
  messageId: string;
  userId: string;
  readAt: string;
}

export interface DeliveryReceiptEvent {
  chatId: string;
  messageId: string;
  userId: string;
  deliveredAt: string;
}
