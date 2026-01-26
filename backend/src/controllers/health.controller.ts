import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { io } from '../config/socket.js';

export class HealthController {
  /**
   * Basic liveness probe - always returns 200 if server is running
   */
  static async liveness(req: Request, res: Response) {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  }

  /**
   * Readiness probe – checks if dependencies are ready
   */
  static async readiness(req: Request, res: Response) {
    const checks = await Promise.allSettled([
      db.raw('SELECT 1').then(() => ({ name: 'database', status: 'ok' })),
      redis.ping().then(() => ({ name: 'redis', status: 'ok' })),
    ]);

    const failed = checks.filter(r => r.status === 'rejected');

    if (failed.length > 0) {
      logger.warn('Readiness check failed', { failures: failed });
      return res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: checks.map(r => r.status === 'fulfilled' ? r.value : { name: 'unknown', status: 'failed' }),
        failures: failed.length,
      });
    }

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: checks.map(r => (r as any).value),
    });
  }

  /**
   * Deep health check – verifies critical dependencies including Gemini AI
   */
  static async deepHealth(req: Request, res: Response) {
    const start = Date.now();

    const results = await Promise.allSettled([
      // Database
      db.raw('SELECT 1').then(() => ({ name: 'database', status: 'ok', latency_ms: Date.now() - start })),

      // Redis
      redis.ping().then(() => ({ name: 'redis', status: 'ok', latency_ms: Date.now() - start })),

      // Gemini AI (minimal test call)
      (async () => {
        try {
          const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          await model.generateContent('ping'); // very small test
          return { name: 'gemini_ai', status: 'ok', latency_ms: Date.now() - start };
        } catch (err: any) {
          throw err;
        }
      })(),

      // Socket.IO (check if server is listening)
      Promise.resolve({ 
        name: 'socket_io', 
        status: (io && io.engine) ? 'ok' : 'unknown', 
        latency_ms: 0 
      }),
    ]);

    const failed = results.filter(r => r.status === 'rejected');
    const allChecks = results.map(r => r.status === 'fulfilled' ? r.value : { name: 'unknown', status: 'failed', error: (r as any).reason?.message });

    const statusCode = failed.length === 0 ? 200 : 503;

    if (failed.length > 0) {
      logger.warn('Deep health check failed', { failures: failed.length, details: failed });
    }

    res.status(statusCode).json({
      status: failed.length === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      total_checks: allChecks.length,
      failed_checks: failed.length,
      checks: allChecks,
      response_time_ms: Date.now() - start,
    });
  }

  static async health(req: Request, res: Response) { 
    return HealthController.liveness(req, res); 
  }

  static async ready(req: Request, res: Response) { 
    return HealthController.readiness(req, res); 
  }
}
