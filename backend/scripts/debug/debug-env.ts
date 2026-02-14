import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

console.log(`Loading .env from: ${envPath}`);
if (result.error) {
  console.warn('Failed to load .env file:', result.error.message);
} else {
  console.log('.env loaded successfully');
  console.log('Keys loaded:', Object.keys(result.parsed || {}));
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().default('10'),
  GEMINI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
} else {
  console.log('✅ Environment variables are valid!');
  console.log('DATABASE_URL starts with:', parsed.data.DATABASE_URL.substring(0, 10));
}
