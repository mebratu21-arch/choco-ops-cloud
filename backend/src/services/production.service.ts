import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { ProductionRepository } from '../repositories/production.repository.js';
import { InventoryRepository } from '../repositories/inventory.repository.js';
import { CreateBatchInput, Batch } from '../types/production.types.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class ProductionService {
  static async createBatch(input: CreateBatchInput, userId: string): Promise<Batch> {
    return db.transaction(async (trx) => {
      // 1. Get recipe + ingredients (locked)
      const ingredients = await ProductionRepository.getRecipeWithIngredients(input.recipe_id, trx);

      if (!ingredients.length) {
        throw new NotFoundError('Recipe not found or has no ingredients');
      }

      // 2. Check stock availability & Calculate Cost
      let totalCost = 0;
      for (const ing of ingredients) {
        const needed = Number(ing.quantity_per_batch) * input.quantity_produced;
        if (Number(ing.current_stock) < needed) {
          throw new ValidationError(
            `Insufficient ${ing.name}: need ${needed} ${ing.unit}, have ${ing.current_stock}`
          );
        }
        
        // Deduct stock (update inventory)
        await InventoryRepository.updateStock(ing.id, Number(ing.current_stock) - needed, trx);
        
        // Calculate cost
        totalCost += needed * Number(ing.cost_per_unit || 0);
      }

      // 3. Create batch
      const batch = await ProductionRepository.createBatch(
        {
          recipe_id: input.recipe_id,
          quantity_produced: input.quantity_produced,
          produced_by: userId,
          created_by: userId,
          notes: input.notes,
          actual_cost: totalCost,
        },
        trx
      );

      // 4. Traceability: Insert batch_ingredients
      for (const ing of ingredients) {
        const needed = Number(ing.quantity_per_batch) * input.quantity_produced;
        await ProductionRepository.insertBatchIngredient(batch.id, ing, needed, trx);
      }

      // 5. Audit log
      await trx('audit_logs').insert({
        user_id: userId,
        action: 'BATCH_CREATED',
        resource: 'batches',
        resource_id: batch.id,
        new_values: { 
          recipe_id: input.recipe_id, 
          quantity: input.quantity_produced,
          cost: totalCost
        },
      });

      logger.info('Batch created successfully', { batchId: batch.id, userId, totalCost });

      return batch;
    });
  }

  static async getBatches(): Promise<Batch[]> {
    return ProductionRepository.findAll();
  }
}
