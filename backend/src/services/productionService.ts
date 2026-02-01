import { db } from '../config/database.js';
import { Recipe, RecipeIngredient, ProductionBatch, BatchFilters, BatchStatus } from '../types/production.types.js';
import { InventoryItem } from '../types/inventory.types.js';

export class ProductionService {
  
  // --- RECIPE METHODS ---

  async getAllRecipes(filters: any) {
    const { search, category, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let query = db('recipes').where('is_active', true);

    if (search) {
      query = query.where('name', 'ilike', `%${search}%`);
    }

    if (category) {
      query = query.where('category', category);
    }

    const countQuery = query.clone().count('id as total').first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult?.total as string || '0');

    const recipes = await query.orderBy('name', 'asc').limit(limit).offset(offset);

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getRecipeById(id: string) {
    const recipe = await db('recipes').where({ id }).first();
    if (!recipe) return null;

    const ingredients = await db('recipe_ingredients')
      .join('inventory_items', 'recipe_ingredients.inventory_item_id', 'inventory_items.id')
      .where({ recipe_id: id })
      .select('recipe_ingredients.*', 'inventory_items.name as item_name', 'inventory_items.code as item_code', 'inventory_items.unit as item_unit');

    return { ...recipe, ingredients };
  }

  async createRecipe(data: Partial<Recipe>, ingredients: Partial<RecipeIngredient>[]) {
    return db.transaction(async (trx) => {
      const [newRecipe] = await trx('recipes').insert(data).returning('*');

      if (ingredients && ingredients.length > 0) {
        const ingredientsToInsert = ingredients.map(ing => ({
          ...ing,
          recipe_id: newRecipe.id
        }));
        await trx('recipe_ingredients').insert(ingredientsToInsert);
      }

      return newRecipe;
    });
  }

  async updateRecipe(id: string, data: Partial<Recipe>, ingredients?: Partial<RecipeIngredient>[]) {
    return db.transaction(async (trx) => {
      // Update recipe details
      const [updatedRecipe] = await trx('recipes').where({ id }).update({ ...data, updated_at: new Date() }).returning('*');

      // Update ingredients if provided
      if (ingredients) {
        // Simple approach: delete existing and re-insert (or smarter update)
        // For MVP, replace is safer to ensure consistency
        await trx('recipe_ingredients').where({ recipe_id: id }).del();
        if (ingredients.length > 0) {
            const ingredientsToInsert = ingredients.map(ing => ({
                ...ing,
                recipe_id: id
            }));
            await trx('recipe_ingredients').insert(ingredientsToInsert);
        }
      }

      return updatedRecipe;
    });
  }

  async deleteRecipe(id: string) {
    // Soft delete usually or check dependencies
    return db('recipes').where({ id }).update({ is_active: false });
  }

  // --- BATCH METHODS ---

  async getAllBatches(filters: BatchFilters) {
    const { status, search, startDate, endDate, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let query = db('production_batches')
      .join('recipes', 'production_batches.recipe_id', 'recipes.id')
      .select('production_batches.*', 'recipes.name as recipe_name');

    if (status) {
      query = query.where('production_batches.status', status);
    }
    
    if (search) {
        query = query.where('production_batches.batch_number', 'ilike', `%${search}%`);
    }

    if (startDate && endDate) {
      query = query.whereBetween('production_batches.created_at', [startDate, endDate]);
    }

    const countQuery = query.clone().count('production_batches.id as total').first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult?.total as string || '0');

    const batches = await query.orderBy('production_batches.created_at', 'desc').limit(limit).offset(offset);

    return {
      batches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getBatchById(id: string) {
    const batch = await db('production_batches')
      .join('recipes', 'production_batches.recipe_id', 'recipes.id')
      .leftJoin('users', 'production_batches.started_by', 'users.id')
      .where('production_batches.id', id)
      .select('production_batches.*', 'recipes.name as recipe_name', 'users.full_name as started_by_name')
      .first();

    if (!batch) return null;

    const materials = await db('batch_materials')
      .join('inventory_items', 'batch_materials.inventory_item_id', 'inventory_items.id')
      .where({ batch_id: id })
      .select('batch_materials.*', 'inventory_items.name as item_name');

    return { ...batch, materials };
  }

  async checkIngredientAvailability(recipeId: string, targetQuantity: number) {
    const recipe = await db('recipes').where({ id: recipeId }).first();
    if (!recipe) throw new Error('Recipe not found');

    const ingredients = await db('recipe_ingredients')
      .join('inventory_items', 'recipe_ingredients.inventory_item_id', 'inventory_items.id')
      .where({ recipe_id: recipeId })
      .select('recipe_ingredients.quantity', 'recipe_ingredients.inventory_item_id', 'inventory_items.quantity as stock_quantity', 'inventory_items.name');

    const scaleFactor = targetQuantity / recipe.yield_quantity;
    const missingIngredients = [];

    for (const ing of ingredients) {
      const requiredAmount = ing.quantity * scaleFactor;
      if (ing.stock_quantity < requiredAmount) {
        missingIngredients.push({
          id: ing.inventory_item_id,
          name: ing.name,
          required: requiredAmount,
          available: ing.stock_quantity
        });
      }
    }

    return {
      available: missingIngredients.length === 0,
      missing: missingIngredients
    };
  }

  async createBatch(recipeId: string, targetQuantity: number, userId: string) {
    // 1. Check availability first
    const check = await this.checkIngredientAvailability(recipeId, targetQuantity);
    if (!check.available) {
      throw new Error(`Insufficient ingredients: ${check.missing.map((m: any) => m.name).join(', ')}`);
    }

    // 2. Create Batch
    return db.transaction(async (trx) => {
        // Generate batch number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const countRes = await trx('production_batches').count('id as count').first();
        const count = parseInt(countRes?.count as string || '0') + 1;
        const batchNumber = `BATCH-${dateStr}-${String(count).padStart(3, '0')}`;

        const [newBatch] = await trx('production_batches').insert({
            batch_number: batchNumber,
            recipe_id: recipeId,
            status: 'pending',
            target_quantity: targetQuantity,
            started_by: userId,
            started_at: new Date()
        }).returning('*');

        // Note: For this MVP, we are checking availability but NOT automatically deducting stock at 'pending' or 'started'.
        // Real systems might allocate stock. Here we might deduct when calculating actuals or moving to 'completed'.
        // The prompt asked for "check availability" in createBatch.
        // We will stick to creating the record. Stock deduction usually happens via "Batch Materials" recording or completion.
        
        return newBatch;
    });
  }

  async updateBatchStatus(id: string, status: BatchStatus, userId: string) {
    const updateData: any = { status, updated_at: new Date() };
    if (status === 'completed') {
        updateData.completed_at = new Date();
    }
    
    const [updatedBatch] = await db('production_batches')
      .where({ id })
      .update(updateData)
      .returning('*');
      
    return updatedBatch;
  }
}

export const productionService = new ProductionService();
