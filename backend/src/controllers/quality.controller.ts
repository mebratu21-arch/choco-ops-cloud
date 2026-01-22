import { Request, Response, NextFunction } from 'express';
import { QualityRepository } from '../repositories/quality.repository.js';
import { logger } from '../config/logger.js';

export class QualityController {
  static async getAllControls(req: Request, res: Response, next: NextFunction) {
    try {
      const controls = await QualityRepository.findAllControls();
      res.json({ success: true, data: controls });
    } catch (error) {
      next(error);
    }
  }

  static async getControlById(req: Request, res: Response, next: NextFunction) {
    try {
      const control = await QualityRepository.findControlById(req.params.id);
      if (!control) {
        return res.status(404).json({ success: false, error: 'Quality control not found' });
      }
      res.json({ success: true, data: control });
    } catch (error) {
      next(error);
    }
  }

  static async getControlsByBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const controls = await QualityRepository.findControlsByBatch(req.params.batchId);
      res.json({ success: true, data: controls });
    } catch (error) {
      next(error);
    }
  }

  static async getControlsByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const controls = await QualityRepository.findControlsByStatus(req.params.status);
      res.json({ success: true, data: controls });
    } catch (error) {
      next(error);
    }
  }

  static async createControl(req: Request, res: Response, next: NextFunction) {
    try {
      const control = await QualityRepository.createControl({
        ...req.body,
        inspector_id: req.user?.id
      });
      logger.info('Quality control created', { id: control.id });
      res.status(201).json({ success: true, data: control });
    } catch (error) {
      next(error);
    }
  }

  static async updateControl(req: Request, res: Response, next: NextFunction) {
    try {
      const control = await QualityRepository.updateControl(req.params.id, req.body);
      logger.info('Quality control updated', { id: req.params.id });
      res.json({ success: true, data: control });
    } catch (error) {
      next(error);
    }
  }

  // Quality Checks
  static async getChecks(req: Request, res: Response, next: NextFunction) {
    try {
      const checks = await QualityRepository.findChecksByControl(req.params.controlId);
      res.json({ success: true, data: checks });
    } catch (error) {
      next(error);
    }
  }

  static async createCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const check = await QualityRepository.createCheck({
        ...req.body,
        quality_control_id: req.params.controlId
      });
      res.status(201).json({ success: true, data: check });
    } catch (error) {
      next(error);
    }
  }

  // Statistics
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await QualityRepository.getQCStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
