import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { Audit } from '../utils/audit.js';

export class QcService {
  static async createCheck(input: any, userId?: string) {
    return db.transaction(async (trx) => {
      // Create quality check record
      const [check] = await trx('quality_checks')
        .insert({
          id: db.raw('gen_random_uuid()'),
          batch_id: input.batch_id,
          checked_by: userId || input.checked_by,
          final_status: input.status || input.final_status,
          notes: input.notes,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        })
        .returning('*');

      // Update batch status if needed
      if (input.status || input.final_status) {
        const finalStatus = input.status || input.final_status;
        const batchStatus = finalStatus === 'APPROVED' ? 'COMPLETED' : 'FAILED';
        await trx('batches')
          .where({ id: input.batch_id })
          .update({
            status: batchStatus,
            updated_at: trx.fn.now(),
          });
      }

      // Audit log
      await Audit.logAction(userId, 'CREATE_QC_CHECK', 'qc', { checkId: check.id, batchId: input.batch_id }, trx);

      logger.info('QC Check created', { batchId: input.batch_id, userId });
      return check;
    });
  }
}
