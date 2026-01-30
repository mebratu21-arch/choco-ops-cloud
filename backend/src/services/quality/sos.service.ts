import { db } from '../../config/database.js';
import { logger } from '../../config/logger.js';

interface CreateSOSInput {
  equipmentId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  problemDescription: string;
}

interface UpdateSOSInput {
  assignedTo?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  solutionDescription?: string;
  mechanicNotes?: string;
}

export class SOSService {
  /**
   * Create SOS alert
   */
  static async create(input: CreateSOSInput, reportedBy: string) {
    try {
      const [alert] = await db('sos_alerts')
        .insert({
          equipment_id: input.equipmentId || null,
          reported_by: reportedBy,
          priority: input.priority,
          problem_description: input.problemDescription,
          status: 'OPEN',
          reported_at: new Date(),
        })
        .returning('*');

      // If equipment is specified, update its status
      if (input.equipmentId) {
        if (input.priority === 'CRITICAL') {
          await db('equipment')
            .where({ id: input.equipmentId })
            .update({ status: 'BROKEN' });
        } else if (input.priority === 'HIGH') {
          await db('equipment')
            .where({ id: input.equipmentId })
            .update({ status: 'MAINTENANCE' });
        }
      }

      logger.info('SOS alert created', {
        alertId: alert.id,
        priority: input.priority,
        reportedBy
      });

      return alert;
    } catch (error: any) {
      logger.error('Failed to create SOS alert', { error: error.message });
      throw new Error('Failed to create SOS alert');
    }
  }

  /**
   * Get all SOS alerts
   */
  static async getAll(filters?: { status?: string; priority?: string }) {
    try {
      let query = db('sos_alerts')
        .select(
          'sos_alerts.*',
          'reporter.name as reported_by_name',
          'reporter.email as reported_by_email',
          'mechanic.name as assigned_to_name',
          'mechanic.email as assigned_to_email',
          'equipment.name as equipment_name',
          'equipment.machine_code as equipment_code',
          'equipment.location as equipment_location'
        )
        .leftJoin('users as reporter', 'sos_alerts.reported_by', 'reporter.id')
        .leftJoin('users as mechanic', 'sos_alerts.assigned_to', 'mechanic.id')
        .leftJoin('equipment', 'sos_alerts.equipment_id', 'equipment.id')
        .orderBy('sos_alerts.priority', 'desc')
        .orderBy('sos_alerts.reported_at', 'desc');

      if (filters?.status) {
        query = query.where('sos_alerts.status', filters.status);
      }

      if (filters?.priority) {
        query = query.where('sos_alerts.priority', filters.priority);
      }

      const alerts = await query;
      return alerts;
    } catch (error: any) {
      logger.error('Failed to fetch SOS alerts', { error: error.message });
      throw new Error('Failed to fetch SOS alerts');
    }
  }

  /**
   * Get single SOS alert
   */
  static async getById(id: string) {
    try {
      const alert = await db('sos_alerts')
        .select(
          'sos_alerts.*',
          'reporter.name as reported_by_name',
          'mechanic.name as assigned_to_name',
          'equipment.name as equipment_name',
          'equipment.machine_code as equipment_code'
        )
        .leftJoin('users as reporter', 'sos_alerts.reported_by', 'reporter.id')
        .leftJoin('users as mechanic', 'sos_alerts.assigned_to', 'mechanic.id')
        .leftJoin('equipment', 'sos_alerts.equipment_id', 'equipment.id')
        .where('sos_alerts.id', id)
        .first();

      if (!alert) {
        throw new Error('SOS alert not found');
      }

      return alert;
    } catch (error: any) {
      logger.error('Failed to fetch SOS alert', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update SOS alert
   */
  static async update(id: string, input: UpdateSOSInput, userId?: string) {
    try {
      const updateData: any = {};

      if (input.assignedTo !== undefined) updateData.assigned_to = input.assignedTo;
      if (input.status !== undefined) {
        updateData.status = input.status;
        // Auto-set resolved_at when status changes to RESOLVED
        if (input.status === 'RESOLVED' && !updateData.resolved_at) {
          updateData.resolved_at = new Date();

          // Calculate response time
          const alert = await db('sos_alerts').where({ id }).first();
          if (alert) {
            const reportedAt = new Date(alert.reported_at);
            const resolvedAt = new Date();
            const responseTimeMinutes = Math.round((resolvedAt.getTime() - reportedAt.getTime()) / 60000);
            updateData.response_time_minutes = responseTimeMinutes;
          }
        }
      }
      if (input.solutionDescription !== undefined) updateData.solution_description = input.solutionDescription;
      if (input.mechanicNotes !== undefined) updateData.mechanic_notes = input.mechanicNotes;

      updateData.updated_at = new Date();

      const [updated] = await db('sos_alerts')
        .where({ id })
        .update(updateData)
        .returning('*');

      if (!updated) {
        throw new Error('SOS alert not found');
      }

      // If resolved, update equipment status back to operational
      if (input.status === 'RESOLVED' && updated.equipment_id) {
        await db('equipment')
          .where({ id: updated.equipment_id })
          .update({ status: 'OPERATIONAL' });
      }

      logger.info('SOS alert updated', { alertId: id, updatedBy: userId });
      return updated;
    } catch (error: any) {
      logger.error('Failed to update SOS alert', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Assign SOS alert to mechanic
   */
  static async assign(id: string, mechanicId: string) {
    try {
      const [updated] = await db('sos_alerts')
        .where({ id })
        .update({
          assigned_to: mechanicId,
          status: 'IN_PROGRESS',
          updated_at: new Date(),
        })
        .returning('*');

      if (!updated) {
        throw new Error('SOS alert not found');
      }

      logger.info('SOS alert assigned', { alertId: id, mechanicId });
      return updated;
    } catch (error: any) {
      logger.error('Failed to assign SOS alert', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Resolve SOS alert
   */
  static async resolve(id: string, solutionDescription: string, mechanicId: string) {
    try {
      const alert = await db('sos_alerts').where({ id }).first();
      if (!alert) {
        throw new Error('SOS alert not found');
      }

      const reportedAt = new Date(alert.reported_at);
      const resolvedAt = new Date();
      const responseTimeMinutes = Math.round((resolvedAt.getTime() - reportedAt.getTime()) / 60000);

      const [updated] = await db('sos_alerts')
        .where({ id })
        .update({
          status: 'RESOLVED',
          solution_description: solutionDescription,
          resolved_at: resolvedAt,
          response_time_minutes: responseTimeMinutes,
          updated_at: resolvedAt,
        })
        .returning('*');

      // Update equipment status back to operational
      if (alert.equipment_id) {
        await db('equipment')
          .where({ id: alert.equipment_id })
          .update({ status: 'OPERATIONAL' });
      }

      logger.info('SOS alert resolved', { alertId: id, mechanicId, responseTimeMinutes });
      return updated;
    } catch (error: any) {
      logger.error('Failed to resolve SOS alert', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Delete SOS alert
   */
  static async delete(id: string) {
    try {
      const deleted = await db('sos_alerts')
        .where({ id })
        .delete();

      if (!deleted) {
        throw new Error('SOS alert not found');
      }

      logger.info('SOS alert deleted', { alertId: id });
      return { success: true, message: 'SOS alert deleted' };
    } catch (error: any) {
      logger.error('Failed to delete SOS alert', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Get open SOS alerts (for mechanics)
   */
  static async getOpen() {
    try {
      const alerts = await db('sos_alerts')
        .select(
          'sos_alerts.*',
          'equipment.name as equipment_name',
          'equipment.location as equipment_location',
          'reporter.name as reported_by_name'
        )
        .leftJoin('equipment', 'sos_alerts.equipment_id', 'equipment.id')
        .leftJoin('users as reporter', 'sos_alerts.reported_by', 'reporter.id')
        .whereIn('sos_alerts.status', ['OPEN', 'IN_PROGRESS'])
        .orderBy('sos_alerts.priority', 'desc')
        .orderBy('sos_alerts.reported_at', 'asc');

      return alerts;
    } catch (error: any) {
      logger.error('Failed to fetch open SOS alerts', { error: error.message });
      throw new Error('Failed to fetch open SOS alerts');
    }
  }

  /**
   * Get SOS alerts by mechanic
   */
  static async getByMechanic(mechanicId: string) {
    try {
      const alerts = await db('sos_alerts')
        .select(
          'sos_alerts.*',
          'equipment.name as equipment_name',
          'equipment.location as equipment_location'
        )
        .leftJoin('equipment', 'sos_alerts.equipment_id', 'equipment.id')
        .where('sos_alerts.assigned_to', mechanicId)
        .whereIn('sos_alerts.status', ['IN_PROGRESS', 'OPEN'])
        .orderBy('sos_alerts.priority', 'desc');

      return alerts;
    } catch (error: any) {
      logger.error('Failed to fetch mechanic SOS alerts', { error: error.message, mechanicId });
      throw new Error('Failed to fetch SOS alerts');
    }
  }
}
