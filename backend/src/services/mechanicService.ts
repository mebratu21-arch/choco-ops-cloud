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

    let query = db('sos_alerts')
      .join('machines', 'sos_alerts.machine_id', 'machines.id')
      .join('users as reporter', 'sos_alerts.reported_by', 'reporter.id')
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

    const countQuery = query.clone().count('sos_alerts.id as total').first();
    const totalResult = await countQuery;
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

  async createAlert(data: Partial<SOSAlert>) {
    return db.transaction(async (trx) => {
      // 1. Create Alert
      const [newAlert] = await trx('sos_alerts').insert({
        ...data,
        status: 'pending'
      }).returning('*');

      // 2. Auto-status update for machine to 'sos' or 'maintenance'
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
        status: 'assigned', 
        updated_at: new Date() 
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
          resolved_at: new Date(),
          updated_at: new Date() 
        })
        .returning('*');

      // 3. Update Machine Status back to 'operational' (User choice, but auto-reverting is helpful logic for MVP)
      // Check if there are other pending alerts for this machine? 
      // For now, assume resolution means machine is fixed.
      await trx('machines')
        .where({ id: alert.machine_id })
        .update({ status: 'operational', updated_at: new Date() });

      // 4. Optionally create a Maintenance Log automatically?
      // Let's create one for record keeping
      await trx('maintenance_logs').insert({
        machine_id: alert.machine_id,
        performed_by: mechanicId,
        maintenance_type: 'repair',
        description: `Resolved SOS Alert: ${resolutionNotes}`,
        date_performed: new Date()
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
    let query = db('maintenance_logs')
       .join('machines', 'maintenance_logs.machine_id', 'machines.id')
       .join('users', 'maintenance_logs.performed_by', 'users.id')
       .select(
           'maintenance_logs.*',
           'machines.name as machine_name', 
           'users.full_name as mechanic_name'
        );
    
    if (filters.machineId) query = query.where('maintenance_logs.machine_id', filters.machineId);
    
    return query.orderBy('date_performed', 'desc');
  }

  async createMaintenanceLog(data: Partial<MaintenanceLog>) {
    return db.transaction(async (trx) => {
        const [log] = await trx('maintenance_logs').insert(data).returning('*');
        
        // Update machine last/next dates
        if (data.next_maintenance_date) {
            await trx('machines').where({id: data.machine_id}).update({
                last_maintenance_date: data.date_performed,
                next_maintenance_date: data.next_maintenance_date
            });
        } else {
             await trx('machines').where({id: data.machine_id}).update({
                last_maintenance_date: data.date_performed
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
