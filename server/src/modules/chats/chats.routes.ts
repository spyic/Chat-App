import { Router } from 'express';
import { chatsController } from './chats.controller';
import { authenticate, validate } from '../../middleware';
import { createChatSchema } from './chats.schema';

const router = Router();

router.post('/', authenticate, validate(createChatSchema), chatsController.createOrGetChat);
router.get('/', authenticate, chatsController.getUserChats);
router.get('/:chatId', authenticate, chatsController.getChatById);

export { router as chatsRoutes };

