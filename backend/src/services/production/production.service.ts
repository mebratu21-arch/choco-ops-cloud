import { db } from '../../config/database.js';
import { ProductionRepository } from '../../repositories/production/production.repository.js';
import { Audit } from '../../utils/audit.js';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/logger.js';

export class ProductionService {
  /**
   * Create Batch with Automatic Ingredient Deduction
   */
  static async createBatch(input: { recipe_id: string; quantity_produced: number; produced_by: string }) {
    return await db.transaction(async (trx) => {
      // 1. Fetch the recipe and its required ingredients
      const recipeIngredients = await trx('recipe_ingredients')
        .where('recipe_id', input.recipe_id)
        .select('ingredient_id', 'quantity as required_per_unit');

      if (!recipeIngredients.length) {
        throw new AppError(400, 'Recipe has no ingredients defined');
      }

      // 2. Check and Deduct stock for each ingredient
      for (const item of recipeIngredients) {
        const totalNeeded = Number(item.required_per_unit) * input.quantity_produced;
        
        // Lock the row for update to prevent race conditions
        const ingredient = await trx('ingredients')
          .where('id', item.ingredient_id)
          .forUpdate()
          .first();

        if (!ingredient || Number(ingredient.current_stock) < totalNeeded) {
          throw new AppError(
            400, 
            `Insufficient stock for ${ingredient?.name || 'ingredient'}. Need ${totalNeeded}, have ${ingredient?.current_stock || 0}`
          );
        }

        // Deduct the stock
        await trx('ingredients')
          .where('id', item.ingredient_id)
          .decrement('current_stock', totalNeeded);
      }

      // 3. Create the Production Batch
      const batch = await ProductionRepository.createBatch(input, trx);

      // 4. Audit Log
      await Audit.logAction(input.produced_by, 'CREATE_BATCH', 'production', {
        batch_id: batch.id,
        recipe_id: input.recipe_id,
        quantity: input.quantity_produced
      }, trx);

      logger.info('Batch created and ingredients deducted', { batchId: batch.id });
      return batch;
    });
  }

  /**
   * Simple read with repo
   */
  static async getBatches(status?: string) {
      // Assuming a generic findAll exists or adding one to match user request
      return await db('batches').whereNull('deleted_at').orderBy('created_at', 'desc');
  }
}
