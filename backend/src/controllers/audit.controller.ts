import { Request, Response, NextFunction } from 'express';
import { AuditRepository } from '../repositories/system/audit.repository.js';

export class AuditController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await AuditRepository.findAll(limit);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await AuditRepository.findById(req.params.id);
      if (!log) {
        return res.status(404).json({ success: false, error: 'Audit log not found' });
      }
      res.json({ success: true, data: log });
    } catch (error) {
      next(error);
    }
  }

  static async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await AuditRepository.findByUser(req.params.userId);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async getByEntity(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      const logs = await AuditRepository.findByEntity(entityType, entityId);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async getByAction(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await AuditRepository.findByAction(req.params.action);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async getByDateRange(req: Request, res: Response, next: NextFunction) {
    try {
      const { start_date, end_date } = req.query;
      if (!start_date || !end_date) {
        return res.status(400).json({ success: false, error: 'start_date and end_date required' });
      }
      const logs = await AuditRepository.findByDateRange(
        new Date(start_date as string),
        new Date(end_date as string)
      );
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}
