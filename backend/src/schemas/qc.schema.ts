import { z } from 'zod';

export const QualityUpdateSchema = z.object({
  batch_id: z.string().uuid('Invalid Batch ID'),
  status: z.enum(['APPROVED', 'REJECTED', 'QUARANTINE', 'PENDING']),
  defect_count: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});
