import { Request, Response } from 'express';
import { AdminService } from '../services/system/admin.service.js';

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

  static async getSystemStats(req: Request, res: Response) {
    // Mock robust system stats for dashboard
    res.json({
        success: true,
        data: {
            users: { total: 12, active: 8, new_this_week: 3 },
            system: { health: 'OPTIMAL', uptime: '99.99%', version: 'v1.2.0' },
            revenue: { daily: 14500, monthly: 450000, growth: '+12.5%' },
            db: { status: 'CONNECTED', latency: '24ms' }
        }
    });
  }
}
