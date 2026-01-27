import { Request, Response, NextFunction } from 'express';
import { RecipeRepository } from '../../repositories/production/recipe.repository.js';
import { logger } from '../../config/logger.js';

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
}
