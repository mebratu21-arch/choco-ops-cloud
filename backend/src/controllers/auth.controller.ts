import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      logger.info('Registration successful', { email: result.user.email });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      logger.info('Login successful', { userId: result.user.id });
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real app, you might want to identify WHICH token to revoke, 
      // but simplistic approach revokes all for user or specific one if passed
      if (req.user) {
        await AuthService.logout(req.user.id);
      }
      res.clearCookie('refreshToken');
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = req.body;
      const result = await AuthService.refreshTokens(refresh_token);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response) {
    res.json({
      success: true,
      data: { user: req.user },
    });
  }
}
