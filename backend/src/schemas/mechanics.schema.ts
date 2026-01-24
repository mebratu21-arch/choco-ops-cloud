import { z } from 'zod';

export const MachineFixSchema = z.object({
  description: z.string().min(5, 'Description too short'),
  batch_id: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});
