import { Router } from 'express';
import { messagesController } from './messages.controller';
import { authenticate, validate } from '../../middleware';
import {
  sendMessageSchema,
  getMessagesSchema,
  readMessageSchema,
  lastSeenSchema,
  editMessageSchema,
} from './messages.schema';

const router = Router({ mergeParams: true });

router.post('/', authenticate, validate(sendMessageSchema), messagesController.sendMessage);
router.get('/', authenticate, messagesController.getMessages);
router.post('/:messageId/read', authenticate, validate(readMessageSchema), messagesController.markAsRead);
router.post('/:messageId/delivered', authenticate, validate(readMessageSchema), messagesController.markAsDelivered);
router.patch('/:messageId', authenticate, validate(editMessageSchema), messagesController.editMessage);
router.delete('/:messageId', authenticate, messagesController.deleteMessage);

export { router as messagesRoutes };

