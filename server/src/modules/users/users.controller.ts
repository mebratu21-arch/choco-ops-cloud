import { Request, Response } from 'express';
import { UserService } from './users.service';

export const UserController = {
  async getAll(_req: Request, res: Response) {
    try {
      const users = await UserService.findAll();
      res.json({ status: 'success', data: users });
    } catch (error: any) {
      console.error('[USER ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      // @ts-ignore - user added by middleware (to be implemented)
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }
      
      const user = await UserService.findById(userId);
      res.json({ status: 'success', data: user });
    } catch (error: any) {
      console.error('[USER ERROR]', error.message);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
};
