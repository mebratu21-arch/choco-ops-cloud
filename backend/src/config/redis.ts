import { Redis } from 'ioredis';
import { env } from './environment.js';
import { logger } from '../utils/logger.js';

export const redis = new Redis(env.REDIS_URL, {
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err: Error) => logger.error('Redis error', { err }));

export const disconnectRedis = async () => {
  await redis.quit();
};
