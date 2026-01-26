import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../config/logger.js';
import { db } from '../config/database.js';
import { Audit } from '../utils/audit.js';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role, name } = req.body;

      // Check if user exists
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await AuthService.hashPassword(password);

      // Delegate to AuthService (Handles Transaction + Audit)
      const user = await AuthService.register({
        email,
        password_hash: hashedPassword,
        role,
        name
      }, req.ip, req.get('user-agent'));

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * User login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await db('users').where({ email, is_active: true }).first();
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isValid = await AuthService.verifyPassword(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate tokens
      const accessToken = AuthService.generateAccessToken({
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      const refreshToken = AuthService.generateRefreshToken();

      // Save refresh token
      await AuthService.saveRefreshToken(user.id, refreshToken);

      // Log Login Audit
      await Audit.logAction(user.id, 'USER_LOGIN', 'auth', { 
        ip: req.ip, 
        userAgent: req.get('user-agent') 
      });

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Refresh token
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }

      // Validate refresh token
      const user = await AuthService.validateRefreshToken(refreshToken);
      if (!user) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
      }

      // Generate new tokens
      const newAccessToken = AuthService.generateAccessToken({
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      const newRefreshToken = AuthService.generateRefreshToken();

      // Rotate token logic in transaction
      await db.transaction(async (trx) => {
          await AuthService.revokeRefreshToken(refreshToken);
          await AuthService.saveRefreshToken(user.id, newRefreshToken, trx);
      });

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * User logout
   */
  static async logout(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await AuthService.revokeRefreshToken(refreshToken);
      }

      // Audit Log Logout
      if (req.user) {
        await Audit.logAction(req.user.id, 'USER_LOGOUT', 'auth', { 
          ip: req.ip 
        });
      }

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get current user
   */
  static async me(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      const user = await db('users')
        .where({ id: req.user!.userId })
        .select('id', 'email', 'role', 'name', 'is_active', 'created_at')
        .first();

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Profile shim
   */
  static async getProfile(req: Request & { user?: any }, res: Response): Promise<void> {
    return AuthController.me(req, res);
  }
}
