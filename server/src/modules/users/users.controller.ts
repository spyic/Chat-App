import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { usersService } from './users.service';

export const usersController = {
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await usersService.getAllUsers(req.user!.userId);
      res.json({ success: true, data: { users } });
    } catch (error) {
      next(error);
    }
  },

  async searchUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      if (!query.trim()) {
        res.json({ success: true, data: { users: [] } });
        return;
      }
      const users = await usersService.searchUsers(query, req.user!.userId);
      res.json({ success: true, data: { users } });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const user = await usersService.getUserById(userId);
      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  },
};
