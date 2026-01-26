import { db } from '../config/database.js';

export interface QualityCheckCreateInput {
  batch_id: string;
  checked_by: string;
  final_status: string;
  notes?: string;
}

export class QcRepository {
  static async create(input: QualityCheckCreateInput) {
    return db('quality_checks')
      .insert({
        id: db.raw('gen_random_uuid()'),
        ...input,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning('*');
  }

  static async findByBatch(batchId: string) {
    return db('quality_checks')
      .where('batch_id', batchId)
      .orderBy('created_at', 'desc');
  }
}
