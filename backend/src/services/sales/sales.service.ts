import { db } from '../../config/database.js';
import { SalesRepository } from '../../repositories/sales/sales.repository.js';
import { Audit } from '../../utils/audit.js';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/logger.js';

export class SalesService {
  /**
   * Process Employee Sale (Deducts Finished Batches)
   */
  static async processEmployeeSale(userId: string, input: any) {
    return await db.transaction(async (trx) => {
      // 1. Verify batch availability
      const batch = await trx('batches').where('id', input.batch_id).forUpdate().first();
      
      if (!batch) {
          throw new AppError(404, 'Batch not found');
      }

      const availableQty = Number(batch.quantity_produced);
      const soldQty = Number(input.quantity_sold);

      if (availableQty < soldQty) {
        throw new AppError(400, `Insufficient batch quantity for sale. Available: ${availableQty}, Requested: ${soldQty}`);
      }

      // 2. Deduct from batch quantity
      await trx('batches')
        .where('id', input.batch_id)
        .decrement('quantity_produced', soldQty);

      // 3. Record the sale
      const sale = await SalesRepository.createEmployeeSale(input, trx);

      // 4. Audit
      await Audit.logAction(userId, 'EMPLOYEE_SALE', 'sales', { 
          sale_id: sale.id, 
          batch_id: input.batch_id, 
          quantity: soldQty 
      }, trx);

      logger.info('Employee sale processed', { saleId: sale.id, batchId: input.batch_id });
      return sale;
    });
  }

  static async getOnlineOrders(limit = 20, offset = 0) {
      return SalesRepository.getOnlineOrders(limit, offset);
  }
}
