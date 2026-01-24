import { Request, Response } from 'express';
import { MechanicsService } from '../services/mechanics.service.js';

export class MechanicsController {
  static async logFix(req: Request & { user?: any }, res: Response) {
    try {
      const input = req.body;
      const userId = req.user.id;

      await MechanicsService.logFix(input, userId);

      res.json({ success: true, message: 'Fix logged successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
