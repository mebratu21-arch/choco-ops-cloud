import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  static async createUser(req: Request & { user?: any }, res: Response) {
    try {
      const input = req.body;
      const userId = req.user.id;

      const user = await AdminService.createUser(input, userId);

      res.status(201).json({
        success: true,
        message: 'User created',
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await AdminService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  }
}
