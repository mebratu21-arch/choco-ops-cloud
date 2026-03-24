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
      const batch = await trx('production_batches').where('id', input.batch_id).forUpdate().first();
      
      if (!batch) {
          throw new AppError(404, 'Batch not found');
      }

      const availableQty = Number(batch.quantity_produced);
      const soldQty = Number(input.quantity_sold);

      if (availableQty < soldQty) {
        throw new AppError(400, `Insufficient batch quantity for sale. Available: ${availableQty}, Requested: ${soldQty}`);
      }

      // 2. Deduct from batch quantity
      await trx('production_batches')
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

  /**
   * Process POS/Online Sale (Auto-selects batches FIFO)
   */
  static async processPOSSale(userId: string, items: { productId: string, quantity: number, price: number }[], paymentMethod: string, paymentReference: string) {
    return await db.transaction(async (trx) => {
      const saleRecords = [];

      for (const item of items) {
        let remainingQty = item.quantity;
        
        // Find batches with available quantity (oldest first)
        const batches = await trx('production_batches')
          .where('product_id', item.productId)
          .where('quantity_produced', '>', 0)
          .orderBy('created_at', 'asc')
          .forUpdate();

        if (batches.length === 0) {
           // For demo purposes, if no batch exists, we just record the sale without linking to a batch (or create a 'backorder')
           // In a strict system, this would throw an error.
           // logger.warn(`No inventory for product ${item.productId}, recording as backorder/unfulfilled`);
        }

        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const available = Number(batch.quantity_produced);
          const deduct = Math.min(available, remainingQty);

          await trx('production_batches')
            .where('id', batch.id)
            .decrement('quantity_produced', deduct);

          remainingQty -= deduct;

          // Record part of the sale linked to this batch
          const sale = await SalesRepository.createEmployeeSale({
            seller_id: userId,
            buyer_id: '00000000-0000-0000-0000-000000000000', // Walking Customer / Guest
            batch_id: batch.id,
            quantity_sold: deduct,
            unit: 'unit', // expanded: defaulting to unit for POS sales, ideally product should have unit
            original_price: item.price,
            final_amount: item.price * deduct,
            payment_method: paymentMethod as any, // Cast to any to bypass strict literal check for now
            notes: `POS/Crypto Sale: ${paymentReference}`
          }, trx);
          
          saleRecords.push(sale);
        }

        // If we still have remaining quantity (meaning we ran out of stock or no batches found)
        // usage: We might want to record this efficiently. For now, we'll verify if we want to block or allow details.
        // For this simulation: we allow it but log it.
        if (remainingQty > 0) {
             logger.warn(`Sold ${remainingQty} of ${item.productId} without inventory deduction (OOS)`);
        }
      }

      await Audit.logAction(userId, 'POS_SALE', 'sales', { 
        itemsCount: items.length, 
        totalValue: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
        paymentMethod
      }, trx);

      return saleRecords;
    });
  }

  static async getOnlineOrders(limit = 20, offset = 0) {
      return SalesRepository.getOnlineOrders(limit, offset);
  }
}
