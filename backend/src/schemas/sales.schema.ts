import { z } from 'zod';

export const CreateEmployeeSaleSchema = z.object({
  batch_id: z.string().uuid('Invalid Batch ID'),
  buyer_id: z.string().uuid('Invalid Buyer ID'),
  quantity_sold: z.number().positive('Quantity must be positive'),
  unit: z.enum(['kg', 'g', 'liter', 'unit', 'pack', 'bar']),
  discount_percentage: z.number().min(0).max(100).optional(),
  deduct_stock: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

export const employeeCreate = z.object({
  body: CreateEmployeeSaleSchema
});

export const onlineCreate = z.object({
  body: z.object({
    customer_email: z.string().email(),
    batch_id: z.string().uuid().optional(),
    quantity: z.number().positive(),
    unit: z.string(),
    total_amount: z.number().positive(),
  })
});

export const employeeUpdate = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PAID', 'REFUNDED']).optional(),
    notes: z.string().optional()
  })
});

const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const onlineUpdate = z.object({
  body: UpdateOrderStatusSchema
});
