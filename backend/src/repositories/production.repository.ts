import { db } from '../config/database.js';
import { Batch, ProductionBatch } from '../types/domain.types.js';

export class ProductionRepository {
  // Batches
  static async findAllBatches(): Promise<Batch[]> {
    return db('batches')
      .leftJoin('recipes', 'batches.recipe_id', 'recipes.id')
      .select('batches.*', 'recipes.name as recipe_name')
      .orderBy('batches.created_at', 'desc');
  }

  static async findBatchById(id: string): Promise<Batch | undefined> {
    return db('batches')
      .leftJoin('recipes', 'batches.recipe_id', 'recipes.id')
      .select('batches.*', 'recipes.name as recipe_name')
      .where('batches.id', id)
      .first();
  }

  static async findBatchesByStatus(status: string): Promise<Batch[]> {
    return db('batches')
      .where({ status })
      .orderBy('created_at', 'desc');
  }

  static async createBatch(data: Partial<Batch>): Promise<Batch> {
    const [batch] = await db('batches')
      .insert(data)
      .returning('*');
    return batch;
  }

  static async updateBatch(id: string, data: Partial<Batch>): Promise<Batch> {
    const [batch] = await db('batches')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return batch;
  }

  // Production Batches (line details)
  static async findProductionBatches(batchId?: string): Promise<ProductionBatch[]> {
    let query = db('production_batches')
      .leftJoin('batches', 'production_batches.batch_id', 'batches.id')
      .select('production_batches.*', 'batches.batch_number');
    
    if (batchId) {
      query = query.where('production_batches.batch_id', batchId);
    }
    
    return query.orderBy('production_batches.created_at', 'desc');
  }

  static async createProductionBatch(data: Partial<ProductionBatch>): Promise<ProductionBatch> {
    const [pb] = await db('production_batches')
      .insert(data)
      .returning('*');
    return pb;
  }

  static async updateProductionBatch(id: string, data: Partial<ProductionBatch>): Promise<ProductionBatch> {
    const [pb] = await db('production_batches')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return pb;
  }

  // Statistics
  static async getBatchStats(): Promise<{ status: string; count: number }[]> {
    return db('batches')
      .select('status')
      .count('* as count')
      .groupBy('status');
  }
}
