import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { productionService } from '../services/productionService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { BatchFilters, BatchStatus } from '../types/production.types.js';

// --- RECIPES ---

export const listRecipes = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      page: req.query.page,
      limit: req.query.limit
    };
    const result = await productionService.getAllRecipes(filters);
    return successResponse(res, result);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getRecipe = async (req: Request, res: Response) => {
  try {
    const recipe = await productionService.getRecipeById(req.params.id);
    if (!recipe) return errorResponse(res, 'Recipe not found', 404);
    return successResponse(res, recipe);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const createRecipe = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const { ingredients, ...recipeData } = req.body;
    const newRecipe = await productionService.createRecipe(recipeData, ingredients);
    return successResponse(res, newRecipe, 'Recipe created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const { ingredients, ...recipeData } = req.body;
    const updated = await productionService.updateRecipe(req.params.id, recipeData, ingredients);
    if (!updated) return errorResponse(res, 'Recipe not found', 404);
    return successResponse(res, updated, 'Recipe updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    await productionService.deleteRecipe(req.params.id);
    return successResponse(res, null, 'Recipe deleted successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

// --- BATCHES ---

export const listBatches = async (req: Request, res: Response) => {
  try {
    const filters: BatchFilters = {
      status: req.query.status as BatchStatus,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    };

    const result = await productionService.getAllBatches(filters);
    return successResponse(res, result);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getBatch = async (req: Request, res: Response) => {
  try {
    const batch = await productionService.getBatchById(req.params.id);
    if (!batch) return errorResponse(res, 'Batch not found', 404);
    return successResponse(res, batch);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const createBatch = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const { recipeId, targetQuantity } = req.body;
    const userId = req.user!.id;
    
    // Auto-check logic inside service
    const newBatch = await productionService.createBatch(recipeId, targetQuantity, userId);
    return successResponse(res, newBatch, 'Production batch created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message, error.message.startsWith('Insufficient') ? 400 : 500);
  }
};

export const updateBatchStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const userId = req.user!.id;
    
    const updated = await productionService.updateBatchStatus(req.params.id, status, userId);
    if (!updated) return errorResponse(res, 'Batch not found', 404);
    
    return successResponse(res, updated, `Batch status updated to ${status}`);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const checkIngredients = async (req: Request, res: Response) => {
  try {
    const { recipeId, targetQuantity } = req.body;
    const check = await productionService.checkIngredientAvailability(recipeId, targetQuantity);
    return successResponse(res, check);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};
