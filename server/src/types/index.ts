import { Request } from 'express';

// Authenticated request with user info from JWT
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// User types
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Chat types
export interface ChatWithParticipants {
  id: string;
  type: string;
  directKey: string | null;
  lastMessageText: string | null;
  lastMessageSenderId: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  participants: SafeUser[];
  unreadCount: number;
}

// Firestore message types
export interface FirestoreMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  deleted: boolean;
}

export interface MessageWithReceipts extends FirestoreMessage {
  readBy: string[];
  deliveredTo: string[];
}

export interface ReadReceipt {
  userId: string;
  readAt: string;
}

export interface DeliveryReceipt {
  userId: string;
  deliveredAt: string;
}

export interface LastSeen {
  lastSeenMessageId: string;
  lastSeenAt: string;
}

// Pagination
export interface PaginatedMessages {
  messages: FirestoreMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Socket types
export interface SocketUser {
  userId: string;
  socketId: string;
}

export interface TypingEvent {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageEvent {
  chatId: string;
  message: FirestoreMessage;
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

export interface LastSeenEvent {
  chatId: string;
  userId: string;
  messageId: string;
}

