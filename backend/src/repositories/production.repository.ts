import { db } from '../config/database.js';

/**
 * Repository for production batch management
 */
export class ProductionRepository {
  /**
   * Create a new production batch
   */
  static async createBatch(input: { recipe_id: string; quantity_produced: number; produced_by: string }, trx?: any) {
    const connection = trx || db;
    const [batch] = await connection('batches')
      .insert({
        id: connection.raw('gen_random_uuid()'),
        recipe_id: input.recipe_id,
        quantity_produced: input.quantity_produced,
        produced_by: input.produced_by,
        status: 'PENDING',
        created_at: connection.fn.now(),
        updated_at: connection.fn.now(),
      })
      .returning('*');
    return batch;
  }

  /**
   * Update batch details or status
   */
  static async updateBatch(id: string, data: { status?: string; quantity_produced?: number }, trx?: any) {
    const connection = trx || db;
    const [batch] = await connection('batches')
      .where('id', id)
      .update({ ...data, updated_at: connection.fn.now() })
      .returning('*');
    return batch;
  }

  /**
   * Fetch a single batch
   */
  static async getBatch(id: string) {
    return db('batches').where('id', id).first();
  }

  /**
   * For backward compatibility or internal use
   */
  static async create(data: any, trx: any) {
    const connection = trx || db;
    const [batch] = await connection('batches')
      .insert({
        id: connection.raw('gen_random_uuid()'),
        ...data,
        status: data.status || 'COMPLETED',
        started_at: connection.fn.now(),
        completed_at: connection.fn.now(),
      })
      .returning('*');
    return batch;
  }

  static async findAll(filters: { status?: string } = {}, trx?: any) {
    const connection = trx || db;
    let query = connection('batches')
      .leftJoin('recipes', 'batches.recipe_id', 'recipes.id')
      .select('batches.*', 'recipes.name as recipe_name')
      .whereNull('batches.deleted_at');

    if (filters.status) {
        query = query.where('batches.status', filters.status);
    }

    return query.orderBy('batches.created_at', 'desc');
  }

  static async countActiveBatches(): Promise<number> {
    const result = await db('batches')
      .count('* as count')
      .whereIn('status', ['PLANNED', 'IN_PROGRESS'])
      .whereNull('deleted_at')
      .first();
    return Number(result?.count || 0);
  }

  static async getRecipeWithIngredients(recipeId: string, trx: any) {
    return trx('recipe_ingredients')
      .where({ recipe_id: recipeId })
      .join('ingredients', 'recipe_ingredients.ingredient_id', 'ingredients.id')
      .select(
        'ingredients.id',
        'ingredients.name',
        'ingredients.current_stock',
        'recipe_ingredients.quantity as required_per_unit',
        'ingredients.unit',
        'ingredients.cost_per_unit'
      )
      .whereNull('ingredients.deleted_at')
      .forUpdate();
  }
}
