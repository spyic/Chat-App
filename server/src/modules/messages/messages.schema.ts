import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
    idempotencyKey: z.string().optional(),
  }),
  params: z.object({
    chatId: z.string().uuid('Invalid chat ID'),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    chatId: z.string().uuid('Invalid chat ID'),
  }),
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
  }),
});

export const readMessageSchema = z.object({
  params: z.object({
    chatId: z.string().uuid('Invalid chat ID'),
    messageId: z.string().min(1),
  }),
});

export const lastSeenSchema = z.object({
  body: z.object({
    messageId: z.string().min(1, 'Message ID is required'),
  }),
  params: z.object({
    chatId: z.string().uuid('Invalid chat ID'),
  }),
});

export const editMessageSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  }),
  params: z.object({
    chatId: z.string().uuid('Invalid chat ID'),
    messageId: z.string().min(1),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
export type EditMessageInput = z.infer<typeof editMessageSchema>['body'];

