import { z } from 'zod';

export const CreateBatchBodySchema = z.object({
  recipe_id: z.string().uuid('Invalid Recipe ID'),
  quantity_produced: z.number()
    .positive('Quantity must be positive')
    .max(10000, 'Batch size too large'),
  notes: z.string().max(500).optional(),
});

export const GetBatchParamsSchema = z.object({
  id: z.string().uuid('Invalid batch ID'),
});

export const GetBatchesByStatusParamsSchema = z.object({
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']),
});

export const UpdateBatchBodySchema = z.object({
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  quantity_produced: z.number().min(1).max(100000).optional(),
  actual_yield: z.number().min(0).optional(),
  waste_percentage: z.number().min(0).max(100).optional(),
  actual_cost: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
});
