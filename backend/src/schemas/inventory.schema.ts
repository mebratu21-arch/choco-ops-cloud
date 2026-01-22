import { z } from 'zod';

export const GetInventoryQuerySchema = z.object({
  low_stock_only: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  expiring_soon_days: z.coerce.number().min(0).max(365).optional(),
  supplier_id: z.string().uuid().optional(),
  aisle: z.string().max(10).optional(),
  shelf: z.string().max(10).optional(),
  bin: z.string().max(10).optional(),
});

export const UpdateStockBodySchema = z.object({
  ingredient_id: z.string().uuid('Invalid ingredient ID'),
  quantity_change: z.number().refine(val => val !== 0, { message: 'Quantity change cannot be zero' }),
  reason: z.string().min(3).max(500).optional(),
});

export const GetIngredientParamsSchema = z.object({
  id: z.string().uuid('Invalid ingredient ID'),
});