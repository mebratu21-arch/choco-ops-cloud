import { db } from '../config/database.js';

export class QcRepository {
  static async updateBatch(batchId: string, data: any, trx: any) {
    return trx('batches')
      .where({ id: batchId })
      .update(data)
      .returning('*');
  }
}
