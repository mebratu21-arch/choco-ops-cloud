import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const schema = Joi.object({
  PORT: Joi.number().default(5000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  GEMINI_API_KEY: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
});

const { error, value } = schema.validate(process.env, { abortEarly: false, allowUnknown: true });

if (error) {
  throw new Error(`Environment validation failed:\n${error.details.map(d => `- ${d.message}`).join('\n')}`);
}

export const env = value;
