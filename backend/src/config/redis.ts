import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../config/logger.js';

/**
 * Redis client for caching and rate limiting
 */
export const redis = new Redis(env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
        return Math.min(times * 100, 3000);
    }
});

redis.on('error', (err: any) => {
  logger.error('Redis connection error', { err });
});

redis.on('connect', () => {
    logger.info('Redis connected successfully');
});

process.on('SIGTERM', () => {
    redis.quit();
    logger.info('Redis connection closed via SIGTERM');
});
