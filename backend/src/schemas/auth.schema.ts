import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['WAREHOUSE', 'PRODUCTION', 'QC', 'MECHANIC', 'CONTROLLER', 'MANAGER', 'ADMIN'])
      .default('PRODUCTION'),
  }),
});

export const LoginRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const RefreshTokenSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1, 'Refresh token is required'),
    refreshToken: z.string().min(1).optional() // supporting both
  }).transform(data => ({
      refresh_token: data.refresh_token || data.refreshToken
  })),
});

export const register = RegisterRequestSchema;
export const login = LoginRequestSchema;
export const refresh = RefreshTokenSchema;
