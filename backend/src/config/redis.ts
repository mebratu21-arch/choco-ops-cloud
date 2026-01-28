import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../config/logger.js';
import { redisMock } from './redisMock.js';

/**
 * Redis client with graceful fallback to in-memory mock
 * Circuit breaker pattern for demo resilience
 */

let useRealRedis = true;

const realRedis = new Redis(env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
        if (times > 3) {
            logger.warn('Redis connection failed. Falling back to in-memory mock.');
            useRealRedis = false;
            return null; // Stop retrying
        }
        return Math.min(times * 100, 3000);
    }
});

realRedis.on('error', (err: any) => {
  logger.error('Redis connection error. Using mock Redis for demo.', { err: err.message });
  useRealRedis = false;
});

realRedis.on('connect', () => {
    logger.info('Redis connected successfully');
    useRealRedis = true;
});

process.on('SIGTERM', () => {
    if (useRealRedis) {
        realRedis.quit();
        logger.info('Redis connection closed via SIGTERM');
    }
});

/**
 * Exported redis client with automatic fallback
 */
export const redis = {
    async get(key: string): Promise<string | null> {
        if (useRealRedis) {
            try {
                return await realRedis.get(key);
            } catch (err) {
                logger.warn('Redis get failed, using mock', { key });
                useRealRedis = false;
                return await redisMock.get(key);
            }
        }
        return await redisMock.get(key);
    },

    async set(key: string, value: string, mode?: string, ttl?: number): Promise<void> {
        if (useRealRedis) {
            try {
                if (mode === 'EX' && ttl) {
                    await realRedis.set(key, value, 'EX', ttl);
                } else {
                    await realRedis.set(key, value);
                }
                return;
            } catch (err) {
                logger.warn('Redis set failed, using mock', { key });
                useRealRedis = false;
            }
        }
        await redisMock.set(key, value, mode, ttl);
    },

    async exists(key: string): Promise<number> {
        if (useRealRedis) {
            try {
                return await realRedis.exists(key);
            } catch (err) {
                logger.warn('Redis exists failed, using mock', { key });
                useRealRedis = false;
                return await redisMock.exists(key);
            }
        }
        return await redisMock.exists(key);
    },

    async del(key: string): Promise<number> {
        if (useRealRedis) {
            try {
                return await realRedis.del(key);
            } catch (err) {
                logger.warn('Redis del failed, using mock', { key });
                useRealRedis = false;
                return await redisMock.del(key);
            }
        }
        return await redisMock.del(key);
    }
};

// Log Redis status on startup
setTimeout(() => {
    if (!useRealRedis) {
        logger.warn('⚡ DEMO MODE: Using in-memory Redis mock (no external dependencies)');
    }
}, 2000);
