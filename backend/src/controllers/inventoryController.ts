import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { inventoryService } from '../services/inventoryService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { InventoryFilters, StockUpdate } from '../types/inventory.types.js';

export const listItems = async (req: Request, res: Response) => {
  try {
    const filters: InventoryFilters = {
      search: req.query.search as string,
      category: req.query.category as string,
      lowStock: req.query.lowStock === 'true',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    };

    const result = await inventoryService.getAllItems(filters);
    return successResponse(res, result);
  } catch (error: any) {
    console.error('[Inventory Error] listItems failed:', error);
    return errorResponse(res, error.message);
  }
};

export const getItem = async (req: Request, res: Response) => {
  try {
    const item = await inventoryService.getItemById(req.params.id);
    if (!item) return errorResponse(res, 'Item not found', 404);
    return successResponse(res, item);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const createItem = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const existing = await inventoryService.getItemByCode(req.body.code);
    if (existing) return errorResponse(res, 'Item with this code already exists', 409);

    const newItem = await inventoryService.createItem(req.body);
    return successResponse(res, newItem, 'Item created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const updated = await inventoryService.updateItem(req.params.id, req.body);
    if (!updated) return errorResponse(res, 'Item not found', 404);
    return successResponse(res, updated, 'Item updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const deleted = await inventoryService.deleteItem(req.params.id);
    if (!deleted) return errorResponse(res, 'Item not found', 404);
    return successResponse(res, null, 'Item deleted successfully');
  } catch (error: any) {
    // Check for foreign key constraints (e.g., used in recipes/batches)
    if (error.code === '23503') {
      return errorResponse(res, 'Cannot delete item: It is being used in recipes or batches.', 400);
    }
    return errorResponse(res, error.message);
  }
};

export const updateStock = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', 400, errors.array());

  try {
    const { quantity, movementType, reason, referenceType, referenceId } = req.body;
    const userId = req.user!.id; // Authenticated user

    const updateData: StockUpdate = {
      quantity: Number(quantity),
      movementType,
      reason,
      referenceType,
      referenceId
    };

    const updatedItem = await inventoryService.updateStock(req.params.id, updateData.quantity, updateData, userId);
    return successResponse(res, updatedItem, 'Stock updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message, error.message === 'Insufficient stock' ? 400 : 500);
  }
};

export const getLowStockAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await inventoryService.getLowStockAlerts();
    return successResponse(res, alerts);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getExpiryAlerts = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const alerts = await inventoryService.getExpiryAlerts(days);
    return successResponse(res, alerts);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getMovements = async (req: Request, res: Response) => {
  try {
    const movements = await inventoryService.getMovementHistory(req.params.id);
    return successResponse(res, movements);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const searchItems = async (req: Request, res: Response) => {
    try {
        const term = req.query.q as string;
        if (!term) return errorResponse(res, 'Search term required', 400);
        const items = await inventoryService.searchItems(term);
        return successResponse(res, items);
    } catch (error: any) {
        return errorResponse(res, error.message);
    }
};
