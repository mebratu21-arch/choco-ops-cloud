import { Request, Response, NextFunction } from 'express';
import { ProductionRepository } from '../repositories/production.repository.js';
import { logger } from '../config/logger.js';

export class ProductionController {
  // Batches
  static async getAllBatches(req: Request, res: Response, next: NextFunction) {
    try {
      const batches = await ProductionRepository.findAllBatches();
      res.json({ success: true, data: batches });
    } catch (error) {
      next(error);
    }
  }

  static async getBatchById(req: Request, res: Response, next: NextFunction) {
    try {
      const batch = await ProductionRepository.findBatchById(req.params.id);
      if (!batch) {
        return res.status(404).json({ success: false, error: 'Batch not found' });
      }
      res.json({ success: true, data: batch });
    } catch (error) {
      next(error);
    }
  }

  static async getBatchesByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const batches = await ProductionRepository.findBatchesByStatus(req.params.status);
      res.json({ success: true, data: batches });
    } catch (error) {
      next(error);
    }
  }

  static async createBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const batch = await ProductionRepository.createBatch(req.body);
      logger.info('Batch created', { id: batch.id, batchNumber: batch.batch_number });
      res.status(201).json({ success: true, data: batch });
    } catch (error) {
      next(error);
    }
  }

  static async updateBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const batch = await ProductionRepository.updateBatch(req.params.id, req.body);
      logger.info('Batch updated', { id: req.params.id });
      res.json({ success: true, data: batch });
    } catch (error) {
      next(error);
    }
  }

  // Production Batches (line details)
  static async getProductionBatches(req: Request, res: Response, next: NextFunction) {
    try {
      const batchId = req.query.batch_id as string | undefined;
      const productionBatches = await ProductionRepository.findProductionBatches(batchId);
      res.json({ success: true, data: productionBatches });
    } catch (error) {
      next(error);
    }
  }

  static async createProductionBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const pb = await ProductionRepository.createProductionBatch(req.body);
      logger.info('Production batch created', { id: pb.id });
      res.status(201).json({ success: true, data: pb });
    } catch (error) {
      next(error);
    }
  }

  static async updateProductionBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const pb = await ProductionRepository.updateProductionBatch(req.params.id, req.body);
      logger.info('Production batch updated', { id: req.params.id });
      res.json({ success: true, data: pb });
    } catch (error) {
      next(error);
    }
  }

  // Statistics
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ProductionRepository.getBatchStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
