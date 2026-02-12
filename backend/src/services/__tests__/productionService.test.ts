import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productionService } from '../productionService';
import { db } from '../../config/database';

vi.mock('../../config/database', () => ({
  db: vi.fn(),
}));

describe('ProductionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  describe('createBatch', () => {
    it('should create batch if ingredients are available', async () => {
      // Mock Ingredients Check
      // We need to return the recipe ingredients first
      const recipeIngredients = [
          { inventory_item_id: 'item1', quantity: 10, name: 'Sugar' }
      ];
      // Mock inventory items with sufficient stock
      const inventoryItems = [
          { id: 'item1', quantity: 100 }
      ];

      // Mock DB calls
      // 1. Get Recipe Ingredients
      // 2. Get Inventory Items
      // 3. Transaction for batch creation
      
      const trx = {
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'batch1', status: 'queued' }]),
      } as any;

      (db.transaction as any) = vi.fn((callback) => callback(trx));

      // Mock query chains
      const queryBuilder = {
          where: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          first: vi.fn(),
          join: vi.fn().mockReturnThis(),
          whereIn: vi.fn().mockReturnThis() // for fetching inventory items
      };
      
      // Mock db() call to return query builder
      (db as any).mockImplementation(() => queryBuilder);
      
      // Mock responses
      // First call (recipe ingredients)
      queryBuilder.select.mockResolvedValueOnce(recipeIngredients);
      // Second call (inventory items)
      queryBuilder.select.mockResolvedValueOnce(inventoryItems);

      const result = await productionService.createBatch({ recipe_id: 'recipe1', target_quantity: 10 });

      expect(result).toHaveProperty('id', 'batch1');
      expect(result).toHaveProperty('status', 'queued');
    });

    it('should throw error if insufficient stock', async () => {
       const recipeIngredients = [{ inventory_item_id: 'item1', quantity: 50, name: 'Sugar' }];
       const inventoryItems = [{ id: 'item1', quantity: 10 }]; // Not enough for 50

       const queryBuilder = {
          where: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          join: vi.fn().mockReturnThis(),
          whereIn: vi.fn().mockReturnThis()
       };
       (db as any).mockImplementation(() => queryBuilder);
       
       queryBuilder.select.mockResolvedValueOnce(recipeIngredients);
       queryBuilder.select.mockResolvedValueOnce(inventoryItems);

       await expect(productionService.createBatch({ recipe_id: 'recipe1', target_quantity: 1 }))
         .rejects.toThrow('Insufficient stock for ingredient: Sugar');
    });
  });
});
