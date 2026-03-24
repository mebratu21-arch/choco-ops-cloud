import { Request, Response, NextFunction } from 'express';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        // console.log(`[Metrics] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
};

export const metricsEndpoint = (req: Request, res: Response) => {
    res.json({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date()
    });
};
