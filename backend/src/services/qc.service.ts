import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { QcRepository } from '../repositories/qc.repository.js';
import { QualityUpdateInput } from '../types/qc.types.js';
import { NotFoundError } from '../utils/errors.js';

export class QcService {
  static async updateBatch(input: QualityUpdateInput, userId: string) {
    return db.transaction(async (trx) => {
      const [batch] = await QcRepository.updateBatch(input.batch_id, {
        status: input.status,
        notes: input.notes,
      }, trx);

      if (!batch) throw new NotFoundError('Batch not found');

      await trx('quality_checks').insert({
        batch_id: input.batch_id,
        checked_by: userId,
        final_status: input.status,
        defect_count: input.defect_count,
        notes: input.notes,
      });

      await trx('audit_logs').insert({
        user_id: userId,
        action: 'BATCH_QC_UPDATED',
        resource: 'batches',
        resource_id: input.batch_id,
        new_values: JSON.stringify({ status: input.status }), // Ensure JSON stringify for consistency often required by jsonb/text fields
      });

      logger.info('Batch QC updated', { batchId: input.batch_id, userId });

      return batch;
    });
  }
}
