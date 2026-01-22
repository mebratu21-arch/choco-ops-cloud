import { Request, Response, NextFunction } from 'express';
import { SupplierRepository } from '../repositories/supplier.repository.js';
import { logger } from '../config/logger.js';

export class SupplierController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const suppliers = await SupplierRepository.findAll();
      res.json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierRepository.findById(req.params.id);
      if (!supplier) {
        return res.status(404).json({ success: false, error: 'Supplier not found' });
      }
      res.json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierRepository.create(req.body);
      logger.info('Supplier created', { id: supplier.id });
      res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierRepository.update(req.params.id, req.body);
      logger.info('Supplier updated', { id: req.params.id });
      res.json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await SupplierRepository.delete(req.params.id);
      logger.info('Supplier deleted', { id: req.params.id });
      res.json({ success: true, message: 'Supplier deleted' });
    } catch (error) {
      next(error);
    }
  }
}
