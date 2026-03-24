import { Request, Response, NextFunction } from 'express';
import { RecipeRepository } from '../../repositories/production/recipe.repository.js';
import { logger } from '../../config/logger.js';
import { db } from '../../config/database.js';

interface ImportRecipeData {
  title: string;
  batch_size: string;
  ingredients: Array<{ item: string; amount: number; unit: string }>;
  instructions: string[];
  description?: string;
}

interface ImportRequest {
  scaling_factor?: number;
  recipes: ImportRecipeData[];
}

export class RecipeController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const recipes = await RecipeRepository.findAll();
      res.json({ success: true, data: recipes });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await RecipeRepository.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ success: false, error: 'Recipe not found' });
      }
      res.json({ success: true, data: recipe });
    } catch (error) {
      next(error);
    }
  }

  static async getWithIngredients(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RecipeRepository.findWithIngredients(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Recipe not found' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await RecipeRepository.create(req.body);
      logger.info('Recipe created', { id: recipe.id });
      res.status(201).json({ success: true, data: recipe });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const recipe = await RecipeRepository.update(req.params.id, req.body);
      logger.info('Recipe updated', { id: req.params.id });
      res.json({ success: true, data: recipe });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await RecipeRepository.delete(req.params.id);
      logger.info('Recipe deleted', { id: req.params.id });
      res.json({ success: true, message: 'Recipe deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async addIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const ingredient = await RecipeRepository.addIngredient(req.params.id, req.body);
      res.status(201).json({ success: true, data: ingredient });
    } catch (error) {
      next(error);
    }
  }

  static async removeIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      await RecipeRepository.removeIngredient(req.params.id, req.params.ingredientId);
      res.json({ success: true, message: 'Ingredient removed from recipe' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Import recipes from JSON with scaling factor
   */
  static async importFromJSON(req: Request, res: Response, next: NextFunction) {
    try {
      const { scaling_factor = 1, recipes }: ImportRequest = req.body;
      const userId = req.user?.id;

      if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No recipes provided' 
        });
      }

      const results = [];
      let imported = 0;
      let failed = 0;

      // Process each recipe
      for (const recipeData of recipes) {
        try {
          // Check for duplicate recipe name
          const existing = await db('recipes')
            .whereRaw('LOWER(name) = ?', [recipeData.title.toLowerCase()])
            .first();

          if (existing) {
            results.push({
              title: recipeData.title,
              status: 'failed',
              error: 'Recipe with this name already exists'
            });
            failed++;
            continue;
          }

          // Extract batch size number
          const batchSizeMatch = recipeData.batch_size.match(/(\d+\.?\d*)/);
          const batchSizeNum = batchSizeMatch ? parseFloat(batchSizeMatch[1]) * scaling_factor : 1;
          const batchUnit = recipeData.batch_size.replace(/[\d.]+\s*/, '').trim() || 'unit';

          // Create recipe
          const [recipeId] = await db('recipes').insert({
            name: recipeData.title,
            description: recipeData.description || `Imported recipe: ${recipeData.title}`,
            batch_size: batchSizeNum,
            batch_unit: batchUnit,
            instructions: recipeData.instructions.join('\n'),
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }).returning('id');

          // Map and add ingredients
          const ingredientResults = [];
          for (const ing of recipeData.ingredients) {
            // Try to find ingredient by name (case-insensitive)
            const ingredient = await db('ingredients')
              .whereRaw('LOWER(name) LIKE ?', [`%${ing.item.toLowerCase()}%`])
              .first();

            if (ingredient) {
              const scaledAmount = ing.amount * scaling_factor;
              await db('recipe_ingredients').insert({
                recipe_id: recipeId,
                ingredient_id: ingredient.id,
                quantity: scaledAmount,
                unit: ing.unit
              });
              ingredientResults.push({ name: ing.item, status: 'added' });
            } else {
              ingredientResults.push({ name: ing.item, status: 'not_found' });
            }
          }

          results.push({
            title: recipeData.title,
            status: 'success',
            id: recipeId,
            ingredients: ingredientResults
          });
          imported++;
          logger.info('Recipe imported', { 
            id: recipeId, 
            name: recipeData.title, 
            userId,
            scalingFactor: scaling_factor 
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            title: recipeData.title,
            status: 'failed',
            error: errorMessage
          });
          failed++;
          logger.error('Recipe import failed', { 
            title: recipeData.title, 
            error: errorMessage 
          });
        }
      }

      res.status(imported > 0 ? 201 : 400).json({
        success: imported > 0,
        imported,
        failed,
        scaling_factor,
        results
      });

    } catch (error) {
      next(error);
    }
  }
}
