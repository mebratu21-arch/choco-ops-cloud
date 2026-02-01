import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '../inventoryService';
import { db } from '../../config/database';

vi.mock('../../config/database', () => ({
  db: vi.fn(),
}));

describe('InventoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  describe('getAllItems', () => {
    it('should return paginated items', async () => {
      const mockItems = [{ id: '1', name: 'Cocoa Beans' }];
      const mockCount = { total: '10' };
      
      const queryBuilder = {
        clone: vi.fn().mockReturnThis(),
        count: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockCount),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockItems),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis()
      };

      (db as any).mockReturnValue(queryBuilder);

      const result = await inventoryService.getAllItems({});

      expect(result.items).toEqual(mockItems);
      expect(result.pagination.total).toBe(10);
    });
  });

  describe('checkStockLevels', () => {
      it('should return low stock items', async () => {
          const lowStockItems = [{ id: '1', name: 'Sugar', quantity: 5, reorder_level: 10 }];
          
           const queryBuilder = {
               whereRaw: vi.fn().mockResolvedValue(lowStockItems)
           };
           (db as any).mockReturnValue(queryBuilder);

           const result = await inventoryService.checkStockLevels();
           expect(result).toEqual(lowStockItems);
      });
  });
});
