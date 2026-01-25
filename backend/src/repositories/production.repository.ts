import { db } from '../config/database.js';
import { Batch } from '../types/production.types.js';

export class ProductionRepository {
  static async getRecipeWithIngredients(recipeId: string, trx: any) {
    return trx('recipe_ingredients')
      .where({ recipe_id: recipeId })
      .join('ingredients', 'recipe_ingredients.ingredient_id', 'ingredients.id')
      .select(
        'ingredients.id',
        'ingredients.name',
        'ingredients.current_stock',
        'recipe_ingredients.quantity_per_batch',
        'recipe_ingredients.unit',
        'ingredients.cost_per_unit'  // for cost calc
      )
      .whereNull('ingredients.deleted_at')
      .forUpdate();
  }

  static async createBatch(data: Partial<Batch>, trx: any): Promise<Batch> {
    const [batch] = await trx('batches')
      .insert({
        ...data,
        status: 'COMPLETED',
        started_at: trx.fn.now(),
        completed_at: trx.fn.now(),
      })
      .returning('*');
    return batch;
  }

  static async insertBatchIngredient(batchId: string, ing: any, needed: number, trx: any) {
    await trx('batch_ingredients').insert({
      batch_id: batchId,
      ingredient_id: ing.id,
      quantity_used: needed,
      unit: ing.unit,
      cost_at_time: ing.cost_per_unit,
    });
  }

  static async findAll(trx?: any): Promise<Batch[]> {
    const connection = trx || db;
    return connection('batches')
      .leftJoin('recipes', 'batches.recipe_id', 'recipes.id')
      .select('batches.*', 'recipes.name as recipe_name')
      .whereNull('batches.deleted_at')
      .orderBy('batches.created_at', 'desc');
  }
}
