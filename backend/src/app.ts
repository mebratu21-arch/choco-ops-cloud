import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// @ts-ignore
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware.js';
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics.middleware.js';
import { rateLimiter } from './middleware/rate-limit.middleware.js';
import { features } from './config/features.js';

import authRoutes from './routes/auth.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import productionRoutes from './routes/production.routes.js';
import mechanicsRoutes from './routes/mechanics.routes.js';
import qcRoutes from './routes/qc.routes.js';
import salesRoutes from './routes/sales.routes.js';
import healthRoutes from './routes/health.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

/**
 * 1. Global Middleware
 */
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

/**
 * 2. Operational Metrics
 */
app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);

/**
 * 3. Mount API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/inventory', rateLimiter, inventoryRoutes);
app.use('/api/production', rateLimiter, productionRoutes);
app.use('/api/mechanics', rateLimiter, mechanicsRoutes);
app.use('/api/qc', rateLimiter, qcRoutes);
app.use('/api/sales', rateLimiter, salesRoutes);
app.use('/api/health', healthRoutes);

/**
 * 4. Feature Flagged Routes (AI)
 */
if (features.AI_CHATBOT) {
    app.use('/api/ai', rateLimiter, aiRoutes);
}

/**
 * 5. Error Handling (Bottom Level)
 */
app.use(errorHandler);

export default app;
