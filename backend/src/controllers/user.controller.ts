import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await db('users')
        .select('id', 'email', 'name', 'role', 'is_active', 'created_at', 'updated_at')
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc');
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await db('users')
        .select('id', 'email', 'name', 'role', 'is_active', 'created_at', 'updated_at')
        .where({ id: req.params.id })
        .whereNull('deleted_at')
        .first();
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await db('users')
        .select('id', 'email', 'name', 'role', 'is_active', 'created_at')
        .where({ role: req.params.role.toUpperCase() })
        .whereNull('deleted_at');
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;
      
      const existing = await db('users').where({ email: email.toLowerCase() }).first();
      if (existing) {
        return res.status(409).json({ success: false, error: 'User already exists' });
      }

      const password_hash = await bcrypt.hash(password, 12);
      const [user] = await db('users')
        .insert({ email: email.toLowerCase(), password_hash, name, role })
        .returning(['id', 'email', 'name', 'role', 'is_active', 'created_at']);
      
      logger.info('User created', { id: user.id, email: user.email });
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, ...updateData } = req.body;
      
      if (password) {
        (updateData as any).password_hash = await bcrypt.hash(password, 12);
      }

      const [user] = await db('users')
        .where({ id: req.params.id })
        .update({ ...updateData, updated_at: new Date() })
        .returning(['id', 'email', 'name', 'role', 'is_active', 'updated_at']);
      
      logger.info('User updated', { id: req.params.id });
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await db('users')
        .where({ id: req.params.id })
        .update({ deleted_at: new Date(), is_active: false });
      
      logger.info('User deleted', { id: req.params.id });
      res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await db('users').where({ id: req.params.id }).first();
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const [updated] = await db('users')
        .where({ id: req.params.id })
        .update({ is_active: !user.is_active, updated_at: new Date() })
        .returning(['id', 'email', 'is_active']);
      
      logger.info('User active status toggled', { id: req.params.id, is_active: updated.is_active });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}
