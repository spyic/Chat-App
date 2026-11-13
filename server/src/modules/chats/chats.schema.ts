import { z } from 'zod';

export const createChatSchema = z.object({
  body: z.object({
    participantId: z.string().uuid('Invalid participant ID'),
  }),
});

export type CreateChatInput = z.infer<typeof createChatSchema>['body'];

