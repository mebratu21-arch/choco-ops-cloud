import { Request, Response, NextFunction } from 'express';
import { RawMaterialRepository } from '../repositories/raw-material.repository.js';
import { logger } from '../utils/logger.js';

export class RawMaterialController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const materials = await RawMaterialRepository.findAll();
      res.json({ success: true, data: materials });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const material = await RawMaterialRepository.findById(req.params.id);
      if (!material) {
        return res.status(404).json({ success: false, error: 'Raw material not found' });
      }
      res.json({ success: true, data: material });
    } catch (error) {
      next(error);
    }
  }

  static async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const materials = await RawMaterialRepository.findLowStock();
      res.json({ success: true, data: materials });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const material = await RawMaterialRepository.create(req.body);
      logger.info('Raw material created', { id: material.id });
      res.status(201).json({ success: true, data: material });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const material = await RawMaterialRepository.update(req.params.id, req.body);
      logger.info('Raw material updated', { id: req.params.id });
      res.json({ success: true, data: material });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await RawMaterialRepository.delete(req.params.id);
      logger.info('Raw material deleted', { id: req.params.id });
      res.json({ success: true, message: 'Raw material deleted' });
    } catch (error) {
      next(error);
    }
  }
}
