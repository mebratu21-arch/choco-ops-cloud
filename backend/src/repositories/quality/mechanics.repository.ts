import { db } from '../../config/database.js';

/**
 * Repository for machine maintenance and fixes
 */
export class MechanicsRepository {
  /**
   * Log a new maintenance fix
   */
  static async logFix(input: { machine_id: string; description: string; fixed_by: string }, trx?: any) {
    const connection = trx || db;
    const [row] = await connection('maintenance_logs')
      .insert({
        id: connection.raw('gen_random_uuid()'),
        equipment_id: input.machine_id,
        description: input.description,
        performed_by: input.fixed_by,
        scheduled_at: connection.fn.now(),
        created_at: connection.fn.now(),
      })
      .returning('*');
    return row;
  }

  /**
   * Update an existing fix
   */
  static async updateFix(id: string, data: { description?: string }, trx?: any) {
    const connection = trx || db;
    const [row] = await connection('maintenance_logs')
      .where('id', id)
      .update({ ...data, updated_at: connection.fn.now() })
      .returning('*');
    return row;
  }

  /**
   * Get a fix by ID
   */
  static async getFix(id: string) {
    return db('maintenance_logs').where('id', id).first();
  }

  // Support for equipment lookup if needed
  static async getEquipment(id: string) {
      return db('equipment').where('id', id).first();
  }
}
