import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware';

const router = Router();

router.get('/', authenticate, usersController.getAllUsers);
router.get('/search', authenticate, usersController.searchUsers);
router.get('/:userId', authenticate, usersController.getUserById);

export { router as usersRoutes };

