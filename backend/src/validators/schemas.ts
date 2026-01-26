import { z } from 'zod';

// Auth schemas
export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'QC', 'SALES']).optional(),
    }),
  }),
 
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),
 
  refresh: z.object({
    body: z.object({
      refreshToken: z.string().uuid('Invalid refresh token format'),
    }),
  }),
};

// Inventory schemas
export const inventorySchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1, 'Name is required'),
      sku: z.string().min(1, 'SKU is required'),
      quantity: z.number().min(0, 'Quantity must be non-negative'),
      unit: z.string().min(1, 'Unit is required'),
      min_threshold: z.number().min(0, 'Threshold must be non-negative'),
      cost_per_unit: z.number().min(0, 'Cost must be non-negative'),
      supplier: z.string().optional(),
    }),
  }),
 
  update: z.object({
    body: z.object({
      name: z.string().optional(),
      quantity: z.number().min(0).optional(),
      unit: z.string().optional(),
      min_threshold: z.number().min(0).optional(),
      cost_per_unit: z.number().min(0).optional(),
      supplier: z.string().optional(),
    }),
  }),
};

// Production schemas
export const productionSchemas = {
  create: z.object({
    body: z.object({
      batch_number: z.string().min(1, 'Batch number is required'),
      product_name: z.string().min(1, 'Product name is required'),
      quantity_planned: z.number().int().min(1, 'Quantity must be at least 1'),
      ingredients: z.array(z.object({
        ingredient_id: z.string().uuid(),
        quantity_used: z.number().min(0),
      })).optional(),
    }),
  }),
 
  complete: z.object({
    body: z.object({
      quantity_actual: z.number().int().min(0, 'Actual quantity must be non-negative'),
    }),
  }),
};

// QC schemas
export const qcSchemas = {
  create: z.object({
    body: z.object({
      batch_id: z.string().uuid('Invalid batch ID'),
      result: z.enum(['APPROVED', 'REJECTED', 'QUARANTINE', 'PENDING']),
      notes: z.string().optional(),
      temperature: z.number().optional(),
      ph: z.number().min(0).max(14).optional(),
    }),
  }),
};

// Sales schemas
export const salesSchemas = {
  create: z.object({
    body: z.object({
      customer_name: z.string().min(1, 'Customer name is required'),
      customer_email: z.string().email('Invalid email format'),
      items: z.array(z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
      })).min(1, 'At least one item is required'),
      discount_code: z.string().optional(),
    }),
  }),
 
  updateStatus: z.object({
    body: z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    }),
  }),
};

// Mechanics schemas
export const mechanicsSchemas = {
  createEquipment: z.object({
    body: z.object({
      equipment_id: z.string().min(1, 'Equipment ID is required'),
      name: z.string().min(1, 'Name is required'),
      type: z.string().min(1, 'Type is required'),
      purchase_date: z.string().optional(),
    }),
  }),
 
  createMaintenance: z.object({
    body: z.object({
      equipment_id: z.string().min(1, 'Equipment ID is required'),
      description: z.string().min(1, 'Description is required'),
      scheduled_at: z.string().datetime('Invalid datetime format'),
      cost: z.number().min(0).optional(),
    }),
  }),
};
