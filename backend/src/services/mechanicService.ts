import { db } from '../config/database.js';
import { Machine, SOSAlert, MaintenanceLog, MachineManual, AlertFilters, MachineStatus, AlertStatus } from '../types/mechanic.types.js';

export class MechanicService {
  
  // --- MACHINE METHODS ---

  async getAllMachines() {
    return db('machines').select('*').orderBy('name', 'asc');
  }

  async getMachineById(id: string) {
    return db('machines').where({ id }).first();
  }

  async createMachine(data: Partial<Machine>) {
    const [newMachine] = await db('machines').insert(data).returning('*');
    return newMachine;
  }

  async updateMachine(id: string, data: Partial<Machine>) {
    const [updatedMachine] = await db('machines')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return updatedMachine;
  }

  async updateMachineStatus(id: string, status: MachineStatus) {
    const [updatedMachine] = await db('machines')
      .where({ id })
      .update({ status, updated_at: new Date() })
      .returning('*');
    return updatedMachine;
  }

  async getMachineManuals(machineId: string) {
    return db('machine_manuals').where({ machine_id: machineId });
  }

  async addManual(data: Partial<MachineManual>) {
    const [newManual] = await db('machine_manuals').insert(data).returning('*');
    return newManual;
  }

  // --- SOS ALERT METHODS ---

  async getAllAlerts(filters: AlertFilters) {
    const { status, priority, machineId, assignedTo, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    try {
      let query = db('sos_alerts')
        .leftJoin('machines', 'sos_alerts.machine_id', 'machines.id')
        .leftJoin('users as reporter', 'sos_alerts.reported_by', 'reporter.id')
        .leftJoin('users as mechanic', 'sos_alerts.assigned_to', 'mechanic.id')
        .select(
          'sos_alerts.*',
          'machines.name as machine_name',
          'machines.machine_code',
          'machines.location as machine_location',
          'reporter.full_name as reporter_name',
          'mechanic.full_name as mechanic_name'
        );

      if (status) query = query.where('sos_alerts.status', status);
      if (priority) query = query.where('sos_alerts.priority', priority);
      if (machineId) query = query.where('sos_alerts.machine_id', machineId);
      if (assignedTo) query = query.where('sos_alerts.assigned_to', assignedTo);

      const countQuery = db('sos_alerts').count('id as total');
      if (status) countQuery.where('status', status);
      if (priority) countQuery.where('priority', priority);
      if (machineId) countQuery.where('machine_id', machineId);
      if (assignedTo) countQuery.where('assigned_to', assignedTo);

      const totalResult = await countQuery.first();
      const total = parseInt(totalResult?.total as string || '0');

      const alerts = await query.orderBy('sos_alerts.created_at', 'desc').limit(limit).offset(offset);

      return {
        alerts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      console.error('getAllAlerts error:', error.message);
      throw error;
    }
  }

  async getAlertById(id: string) {
    return db('sos_alerts')
      .join('machines', 'sos_alerts.machine_id', 'machines.id')
      .join('users as reporter', 'sos_alerts.reported_by', 'reporter.id')
      .leftJoin('users as mechanic', 'sos_alerts.assigned_to', 'mechanic.id')
      .where('sos_alerts.id', id)
      .select(
        'sos_alerts.*',
        'machines.name as machine_name',
        'machines.machine_code',
        'reporter.full_name as reporter_name',
        'mechanic.full_name as mechanic_name'
      )
      .first();
  }

  async createAlert(data: any) {
    return db.transaction(async (trx) => {
      // Map incoming data to database column names
      const dbData = {
        machine_id: data.machine_id,
        reported_by: data.reported_by,
        priority: data.priority,
        problem_description: data.description || data.problem_description,
        status: 'open'  // Match migration enum: open, in_progress, resolved, cancelled
      };

      // 1. Create Alert
      const [newAlert] = await trx('sos_alerts').insert(dbData).returning('*');

      // 2. Auto-status update for machine to 'sos'
      await trx('machines')
        .where({ id: data.machine_id })
        .update({ status: 'sos', updated_at: new Date() });

      return newAlert;
    });
  }

  async updateAlert(id: string, data: Partial<SOSAlert>) {
    const [updatedAlert] = await db('sos_alerts')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return updatedAlert;
  }

  async assignAlert(id: string, mechanicId: string) {
    const [updatedAlert] = await db('sos_alerts')
      .where({ id })
      .update({
        assigned_to: mechanicId,
        status: 'in_progress'  // Match migration enum
      })
      .returning('*');
    return updatedAlert;
  }

  async resolveAlert(id: string, resolutionNotes: string, mechanicId: string) {
    return db.transaction(async (trx) => {
      // 1. Get current alert to find machine
      const alert = await trx('sos_alerts').where({ id }).first();
      if (!alert) throw new Error('Alert not found');

      // 2. Update Alert
      const [updatedAlert] = await trx('sos_alerts')
        .where({ id })
        .update({
          status: 'resolved',
          resolution_notes: resolutionNotes,
          resolved_at: new Date()
        })
        .returning('*');

      // 3. Update Machine Status back to 'operational'
      await trx('machines')
        .where({ id: alert.machine_id })
        .update({ status: 'operational', updated_at: new Date() });

      // 4. Create a Maintenance Log for record keeping
      await trx('maintenance_logs').insert({
        machine_id: alert.machine_id,
        mechanic_id: mechanicId,
        maintenance_type: 'corrective',  // Match migration enum: preventive, corrective, emergency
        description: `Resolved SOS Alert: ${resolutionNotes}`,
        performed_at: new Date()
      });

      return updatedAlert;
    });
  }

  async cancelAlert(id: string) {
      return db.transaction(async (trx) => {
          const alert = await trx('sos_alerts').where({ id }).first();
          if(!alert) throw new Error('Alert not found');
          
          const [cancelled] = await trx('sos_alerts')
             .where({id})
             .update({ status: 'cancelled', updated_at: new Date() })
             .returning('*');
             
           // If no other active alerts, revert machine status? 
           // Simplification: Set machine to operational if it was SOS
           const machine = await trx('machines').where({id: alert.machine_id}).first();
           if(machine.status === 'sos') {
               await trx('machines').where({id: alert.machine_id}).update({ status: 'operational' });
           }
           
           return cancelled;
      });
  }

  // --- MAINTENANCE LOG METHODS ---

  async getAllMaintenanceLogs(filters: any) {
    try {
      let query = db('maintenance_logs')
         .leftJoin('machines', 'maintenance_logs.machine_id', 'machines.id')
         .leftJoin('users', 'maintenance_logs.mechanic_id', 'users.id')
         .select(
             'maintenance_logs.*',
             'machines.name as machine_name',
             'users.full_name as mechanic_name'
          );

      if (filters.machineId) query = query.where('maintenance_logs.machine_id', filters.machineId);

      return query.orderBy('performed_at', 'desc');
    } catch (error: any) {
      console.error('getAllMaintenanceLogs error:', error.message);
      throw error;
    }
  }

  async createMaintenanceLog(data: any) {
    return db.transaction(async (trx) => {
        // Map incoming data to database column names
        const dbData = {
          machine_id: data.machine_id,
          mechanic_id: data.performed_by || data.mechanic_id,
          maintenance_type: data.maintenance_type,
          description: data.description,
          parts_used: data.parts_used,
          duration_minutes: data.duration_minutes,
          cost: data.cost,
          performed_at: data.date_performed || data.performed_at || new Date()
        };

        const [log] = await trx('maintenance_logs').insert(dbData).returning('*');

        // Update machine last/next dates
        const nextDate = data.next_maintenance_date;
        if (nextDate) {
            await trx('machines').where({id: data.machine_id}).update({
                last_maintenance_date: dbData.performed_at,
                next_maintenance_date: nextDate
            });
        } else {
             await trx('machines').where({id: data.machine_id}).update({
                last_maintenance_date: dbData.performed_at
            });
        }

        return log;
    });
  }

  async getUpcomingMaintenance() {
      return db('machines')
        .where('next_maintenance_date', '>=', new Date())
        .orderBy('next_maintenance_date', 'asc')
        .limit(10);
  }
}

export const mechanicService = new MechanicService();
