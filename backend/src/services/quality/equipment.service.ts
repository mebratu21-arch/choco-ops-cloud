import { db } from '../../config/database.js';
import { logger } from '../../config/logger.js';

interface CreateEquipmentInput {
  name: string;
  machineCode: string;
  type: string;
  location: string;
  specifications?: string;
  assignedMechanic?: string;
}

interface UpdateEquipmentInput {
  name?: string;
  type?: string;
  location?: string;
  status?: 'OPERATIONAL' | 'MAINTENANCE' | 'BROKEN' | 'OFFLINE';
  specifications?: string;
  assignedMechanic?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

export class EquipmentService {
  /**
   * Create new equipment
   */
  static async create(input: CreateEquipmentInput) {
    try {
      const [equipment] = await db('machines')
        .insert({
          name: input.name,
          machine_code: input.machineCode,
          type: input.type,
          location: input.location,
          specifications: input.specifications || null,
          assigned_mechanic: input.assignedMechanic || null,
          status: 'OPERATIONAL',
          total_hours: 0,
        })
        .returning('*');

      logger.info('Equipment created', { equipmentId: equipment.id, machineCode: input.machineCode });
      return equipment;
    } catch (error: any) {
      logger.error('Failed to create equipment', { error: error.message });
      throw new Error('Failed to create equipment');
    }
  }

  /**
   * Get all equipment
   */
  static async getAll(filters?: { status?: string; type?: string }) {
    try {
      let query = db('machines')
        .select(
          'equipment.*',
          'users.name as mechanic_name',
          'users.email as mechanic_email'
        )
        .leftJoin('users', 'equipment.assigned_mechanic', 'users.id')
        .orderBy('equipment.name', 'asc');

      if (filters?.status) {
        query = query.where('equipment.status', filters.status);
      }

      if (filters?.type) {
        query = query.where('equipment.type', filters.type);
      }

      const equipment = await query;
      return equipment;
    } catch (error: any) {
      logger.error('Failed to fetch equipment', { error: error.message });
      throw new Error('Failed to fetch equipment');
    }
  }

  /**
   * Get single equipment by ID
   */
  static async getById(id: string) {
    try {
      const equipment = await db('machines')
        .select(
          'equipment.*',
          'users.name as mechanic_name',
          'users.email as mechanic_email'
        )
        .leftJoin('users', 'equipment.assigned_mechanic', 'users.id')
        .where('equipment.id', id)
        .first();

      if (!equipment) {
        throw new Error('Equipment not found');
      }

      return equipment;
    } catch (error: any) {
      logger.error('Failed to fetch equipment', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update equipment
   */
  static async update(id: string, input: UpdateEquipmentInput) {
    try {
      const updateData: any = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.specifications !== undefined) updateData.specifications = input.specifications;
      if (input.assignedMechanic !== undefined) updateData.assigned_mechanic = input.assignedMechanic;
      if (input.lastMaintenance !== undefined) updateData.last_maintenance = input.lastMaintenance;
      if (input.nextMaintenance !== undefined) updateData.next_maintenance = input.nextMaintenance;

      updateData.updated_at = new Date();

      const [updated] = await db('machines')
        .where({ id })
        .update(updateData)
        .returning('*');

      if (!updated) {
        throw new Error('Equipment not found');
      }

      logger.info('Equipment updated', { equipmentId: id });
      return updated;
    } catch (error: any) {
      logger.error('Failed to update equipment', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Delete equipment
   */
  static async delete(id: string) {
    try {
      const deleted = await db('machines')
        .where({ id })
        .delete();

      if (!deleted) {
        throw new Error('Equipment not found');
      }

      logger.info('Equipment deleted', { equipmentId: id });
      return { success: true, message: 'Equipment deleted' };
    } catch (error: any) {
      logger.error('Failed to delete equipment', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Get equipment maintenance history
   */
  static async getMaintenanceHistory(equipmentId: string) {
    try {
      const history = await db('maintenance_logs')
        .select(
          'maintenance_logs.*',
          'users.name as mechanic_name'
        )
        .leftJoin('users', 'maintenance_logs.performed_by', 'users.id')
        .where('maintenance_logs.equipment_id', equipmentId)
        .orderBy('maintenance_logs.performed_at', 'desc');

      return history;
    } catch (error: any) {
      logger.error('Failed to fetch maintenance history', { error: error.message, equipmentId });
      throw new Error('Failed to fetch maintenance history');
    }
  }

  /**
   * Get equipment needing maintenance
   */
  static async getNeedingMaintenance() {
    try {
      const now = new Date();
      const equipment = await db('machines')
        .select('*')
        .where('next_maintenance', '<=', now)
        .whereIn('status', ['OPERATIONAL', 'OFFLINE'])
        .orderBy('next_maintenance', 'asc');

      return equipment;
    } catch (error: any) {
      logger.error('Failed to fetch equipment needing maintenance', { error: error.message });
      throw new Error('Failed to fetch equipment needing maintenance');
    }
  }

  /**
   * Update equipment hours
   */
  static async updateHours(id: string, additionalHours: number) {
    try {
      const [updated] = await db('machines')
        .where({ id })
        .increment('total_hours', additionalHours)
        .update({ updated_at: new Date() })
        .returning('*');

      if (!updated) {
        throw new Error('Equipment not found');
      }

      logger.info('Equipment hours updated', { equipmentId: id, additionalHours });
      return updated;
    } catch (error: any) {
      logger.error('Failed to update equipment hours', { error: error.message, id });
      throw error;
    }
  }
}
