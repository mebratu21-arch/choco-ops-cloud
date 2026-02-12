import { db } from '../../config/database.js';
import { QualityControl, QualityCheck } from '../../types/domain.types.js';

export class QualityRepository {
  static async findAllControls(): Promise<unknown[]> {
    return db('qc_checks')
      .leftJoin('production_batches', 'qc_checks.batch_id', 'production_batches.id')
      .leftJoin('users', 'qc_checks.inspector_id', 'users.id')
      .select(
        'qc_checks.*', 
        'production_batches.batch_number',
        'users.full_name as inspector_name'
      )
      .orderBy('qc_checks.created_at', 'desc');
  }

  static async findControlById(id: string): Promise<unknown | undefined> {
    return db('qc_checks')
      .leftJoin('production_batches', 'qc_checks.batch_id', 'production_batches.id')
      .leftJoin('users', 'qc_checks.inspector_id', 'users.id')
      .select(
        'qc_checks.*', 
        'production_batches.batch_number',
        'users.full_name as inspector_name'
      )
      .where('qc_checks.id', id)
      .first();
  }

  static async findControlsByBatch(batchId: string): Promise<unknown[]> {
    return db('qc_checks')
      .where({ batch_id: batchId })
      .orderBy('created_at', 'desc');
  }

  static async findControlsByStatus(status: string): Promise<unknown[]> {
    return db('qc_checks')
      .where({ result: status })
      .orderBy('created_at', 'desc');
  }

  static async createControl(data: Partial<any>): Promise<any> {
    const [qc] = await db('qc_checks')
      .insert(data)
      .returning('*');
    return qc;
  }

  static async updateControl(id: string, data: Partial<any>): Promise<any> {
    const [qc] = await db('qc_checks')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return qc;
  }

  // Quality Checks (individual tests within a control)
  static async findChecksByControl(controlId: string): Promise<any[]> {
    // Note: If qc_defects is linked to qc_checks, join here
    return db('qc_defects')
      .where({ qc_check_id: controlId });
  }

  static async createCheck(data: Partial<QualityCheck>): Promise<QualityCheck> {
    const [check] = await db('quality_checks')
      .insert(data)
      .returning('*');
    return check;
  }

  // Statistics
  static async getQCStats(): Promise<{ status: string; count: number }[]> {
    return db('qc_checks')
      .select('result as status')
      .count('* as count')
  }
}
