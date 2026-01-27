import { db } from '../../config/database.js';
import { QualityControl, QualityCheck } from '../../types/domain.types.js';

export class QualityRepository {
  static async findAllControls(): Promise<QualityControl[]> {
    return db('quality_controls')
      .leftJoin('batches', 'quality_controls.batch_id', 'batches.id')
      .leftJoin('users', 'quality_controls.inspector_id', 'users.id')
      .select(
        'quality_controls.*', 
        'batches.batch_number',
        db.raw("users.first_name || ' ' || users.last_name as inspector_name")
      )
      .orderBy('quality_controls.inspection_date', 'desc');
  }

  static async findControlById(id: string): Promise<QualityControl | undefined> {
    return db('quality_controls')
      .leftJoin('batches', 'quality_controls.batch_id', 'batches.id')
      .leftJoin('users', 'quality_controls.inspector_id', 'users.id')
      .select(
        'quality_controls.*', 
        'batches.batch_number',
        db.raw("users.first_name || ' ' || users.last_name as inspector_name")
      )
      .where('quality_controls.id', id)
      .first();
  }

  static async findControlsByBatch(batchId: string): Promise<QualityControl[]> {
    return db('quality_controls')
      .where({ batch_id: batchId })
      .orderBy('inspection_date', 'desc');
  }

  static async findControlsByStatus(status: string): Promise<QualityControl[]> {
    return db('quality_controls')
      .where({ status })
      .orderBy('inspection_date', 'desc');
  }

  static async createControl(data: Partial<QualityControl>): Promise<QualityControl> {
    const [qc] = await db('quality_controls')
      .insert(data)
      .returning('*');
    return qc;
  }

  static async updateControl(id: string, data: Partial<QualityControl>): Promise<QualityControl> {
    const [qc] = await db('quality_controls')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return qc;
  }

  // Quality Checks (individual tests within a control)
  static async findChecksByControl(controlId: string): Promise<QualityCheck[]> {
    return db('quality_checks')
      .where({ quality_control_id: controlId });
  }

  static async createCheck(data: Partial<QualityCheck>): Promise<QualityCheck> {
    const [check] = await db('quality_checks')
      .insert(data)
      .returning('*');
    return check;
  }

  // Statistics
  static async getQCStats(): Promise<{ status: string; count: number }[]> {
    return db('quality_controls')
      .select('status')
      .count('* as count')
      .groupBy('status');
  }
}
