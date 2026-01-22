// ========================================================
// CHOCOOPS CLOUD – ENVIRONMENT VALIDATION
// Type-Safe Configuration with Zod
// ========================================================

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment variable schema with strict validation
 * Ensures all required configuration is present and valid
 */
export const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid PostgreSQL connection URL')
    .refine(
      (url) => url.startsWith('postgres://') || url.startsWith('postgresql://'),
      'DATABASE_URL must be a PostgreSQL connection string'
    ),

  // Application Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // JWT Authentication Secrets
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .optional(),

  // Optional AI Integration
  GEMINI_API_KEY: z.string().optional(),

  // Server Configuration
  PORT: z.coerce.number().int().positive().default(5000),
});

/**
 * Validated and type-safe configuration object
 * Throws detailed error if validation fails
 */
export const config = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  • ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Check your .env file and ensure all required variables are set.');
      console.error('📄 See .env.example for reference.\n');
    }
    throw error;
  }
})();

/**
 * Type-safe configuration type
 */
export type Config = z.infer<typeof envSchema>;

/**
 * Helper to check if running in production
 */
export const isProduction = config.NODE_ENV === 'production';

/**
 * Helper to check if running in development
 */
export const isDevelopment = config.NODE_ENV === 'development';

/**
 * Helper to check if running in test mode
 */
export const isTest = config.NODE_ENV === 'test';
