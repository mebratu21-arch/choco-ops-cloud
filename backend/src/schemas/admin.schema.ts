import { z } from 'zod';

export const AdminUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2),
  role: z.enum(['WAREHOUSE', 'PRODUCTION', 'QC', 'MANAGER', 'ADMIN', 'MECHANIC', 'CONTROLLER']),
  is_active: z.boolean(),
});
