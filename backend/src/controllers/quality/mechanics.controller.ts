import { Request, Response } from 'express';
import { EquipmentService } from '../../services/quality/equipment.service.js';
import { SOSService } from '../../services/quality/sos.service.js';
import { MechanicsService } from '../../services/quality/mechanics.service.js';
import { logger } from '../../config/logger.js';

export class MechanicsController {
  // ============= EQUIPMENT/MACHINES =============

  static async createEquipment(req: Request, res: Response) {
    try {
      const equipment = await EquipmentService.create(req.body);
      res.status(201).json({ success: true, data: equipment });
    } catch (error: any) {
      logger.error('Create equipment failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAllEquipment(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        type: req.query.type as string,
      };
      const equipment = await EquipmentService.getAll(filters);
      res.json({ success: true, data: equipment });
    } catch (error: any) {
      logger.error('Get equipment failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch equipment' });
    }
  }

  static async getEquipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipment = await EquipmentService.getById(id);
      res.json({ success: true, data: equipment });
    } catch (error: any) {
      logger.error('Get equipment failed', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async updateEquipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipment = await EquipmentService.update(id, req.body);
      res.json({ success: true, data: equipment });
    } catch (error: any) {
      logger.error('Update equipment failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteEquipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await EquipmentService.delete(id);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      logger.error('Delete equipment failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getEquipmentMaintenanceHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const history = await EquipmentService.getMaintenanceHistory(id);
      res.json({ success: true, data: history });
    } catch (error: any) {
      logger.error('Get maintenance history failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch maintenance history' });
    }
  }

  static async getEquipmentNeedingMaintenance(req: Request, res: Response) {
    try {
      const equipment = await EquipmentService.getNeedingMaintenance();
      res.json({ success: true, data: equipment });
    } catch (error: any) {
      logger.error('Get equipment needing maintenance failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch equipment' });
    }
  }

  // ============= SOS ALERTS =============

  static async createSOS(req: Request & { user?: any }, res: Response) {
    try {
      const alert = await SOSService.create(req.body, req.user.id);
      res.status(201).json({ success: true, data: alert });
    } catch (error: any) {
      logger.error('Create SOS failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAllSOS(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
      };
      const alerts = await SOSService.getAll(filters);
      res.json({ success: true, data: alerts });
    } catch (error: any) {
      logger.error('Get SOS alerts failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch SOS alerts' });
    }
  }

  static async getSOS(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const alert = await SOSService.getById(id);
      res.json({ success: true, data: alert });
    } catch (error: any) {
      logger.error('Get SOS alert failed', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async updateSOS(req: Request & { user?: any }, res: Response) {
    try {
      const { id } = req.params;
      const alert = await SOSService.update(id, req.body, req.user.id);
      res.json({ success: true, data: alert });
    } catch (error: any) {
      logger.error('Update SOS alert failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async assignSOS(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { mechanicId } = req.body;
      const alert = await SOSService.assign(id, mechanicId);
      res.json({ success: true, data: alert });
    } catch (error: any) {
      logger.error('Assign SOS alert failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async resolveSOS(req: Request & { user?: any }, res: Response) {
    try {
      const { id } = req.params;
      const { solutionDescription } = req.body;
      const alert = await SOSService.resolve(id, solutionDescription, req.user.id);
      res.json({ success: true, data: alert });
    } catch (error: any) {
      logger.error('Resolve SOS alert failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteSOS(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await SOSService.delete(id);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      logger.error('Delete SOS alert failed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getOpenSOS(req: Request, res: Response) {
    try {
      const alerts = await SOSService.getOpen();
      res.json({ success: true, data: alerts });
    } catch (error: any) {
      logger.error('Get open SOS alerts failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch SOS alerts' });
    }
  }

  static async getMySOS(req: Request & { user?: any }, res: Response) {
    try {
      const alerts = await SOSService.getByMechanic(req.user.id);
      res.json({ success: true, data: alerts });
    } catch (error: any) {
      logger.error('Get my SOS alerts failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch SOS alerts' });
    }
  }

  // ============= MAINTENANCE LOGS =============

  static async logFix(req: Request, res: Response) {
    try {
      const fix = await MechanicsService.logFix(req.body, req.user?.id);
      res.status(201).json({ success: true, data: fix });
    } catch (error: any) {
      logger.error('Log fix failed', { error });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getFix(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ success: true, data: { id, description: 'Mocked fix retrieval' } });
  }

  static async getAllFixes(req: Request, res: Response) {
    try {
      res.json({ success: true, data: [] });
    } catch (error: any) {
      logger.error('Get all fixes failed', { error });
      res.status(500).json({ success: false, error: 'Failed to fetch fixes' });
    }
  }

  static async updateFix(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ success: true, data: { id, ...req.body, status: 'UPDATED' } });
  }
}
