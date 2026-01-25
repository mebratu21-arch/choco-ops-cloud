/**
 * Core domain types for production module
 */
export interface Batch {
  id: string;
  batch_number?: string;
  recipe_id: string;
  quantity_produced: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  produced_by: string;
  created_by: string;
  started_at: string | null;
  completed_at: string | null;
  actual_yield: number | null;
  waste_percentage: number | null;
  actual_cost: number | null;  // calculated from ingredients
  notes: string | null;
  created_at: string;
  updated_at: string;
  recipe_name?: string;
}

export interface CreateBatchInput {
  recipe_id: string;
  quantity_produced: number;
  notes?: string;
}

export const BATCH_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'] as const;

export type BatchStatus = typeof BATCH_STATUSES[number];

export interface ProductionBatch {
  id: string;
  batch_id: string;
  batch_number?: string;
  line_number?: number;
  quantity: number;
  status: BatchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
