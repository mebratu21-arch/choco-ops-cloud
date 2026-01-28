import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// @ts-ignore
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware.js';
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics.middleware.js';
import { rateLimiter } from './middleware/rate-limit.middleware.js';
import { features } from './config/features.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

// Domain Routes
import authRoutes from './routes/identity/auth.routes.js';
import userRoutes from './routes/identity/user.routes.js';
import inventoryRoutes from './routes/inventory/inventory.routes.js';
import ingredientRoutes from './routes/inventory/ingredient.routes.js';
import rawMaterialRoutes from './routes/inventory/raw-material.routes.js';
import supplierRoutes from './routes/inventory/supplier.routes.js';
import warehouseRoutes from './routes/inventory/warehouse.routes.js';
import productionRoutes from './routes/production/production.routes.js';
import recipeRoutes from './routes/production/recipe.routes.js';
import mechanicsRoutes from './routes/quality/mechanics.routes.js';
import qcRoutes from './routes/quality/qc.routes.js';
import qualityRoutes from './routes/quality/quality.routes.js';
import salesRoutes from './routes/sales/sales.routes.js';
import healthRoutes from './routes/system/health.routes.js';
import aiRoutes from './routes/system/ai.routes.js';
import dashboardRoutes from './routes/system/dashboard.routes.js';
import adminRoutes from './routes/system/admin.routes.js';
import auditRoutes from './routes/system/audit.routes.js';

const app = express();

/**
 * 1. Global Middleware
 */
app.use(helmet());
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
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
// Identity
app.use('/api/auth', authRoutes);
app.use('/api/users', rateLimiter, userRoutes);

// Inventory
app.use('/api/inventory', rateLimiter, inventoryRoutes);
app.use('/api/ingredients', rateLimiter, ingredientRoutes);
app.use('/api/raw-materials', rateLimiter, rawMaterialRoutes);
app.use('/api/suppliers', rateLimiter, supplierRoutes);
app.use('/api/warehouses', rateLimiter, warehouseRoutes);

// Production
app.use('/api/production', rateLimiter, productionRoutes);
app.use('/api/recipes', rateLimiter, recipeRoutes);

// Quality
app.use('/api/mechanics', rateLimiter, mechanicsRoutes);
app.use('/api/qc', rateLimiter, qcRoutes);
app.use('/api/quality', rateLimiter, qualityRoutes);

// Sales
// Root route for API health check or guidance
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'ChocoOps Backend API is running',
    frontend_url: 'http://localhost:5173',
    documentation: '/api-docs'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/sales', rateLimiter, salesRoutes);
import shopRoutes from './routes/sales/shop.routes.js';
app.use('/api/shop', rateLimiter, shopRoutes);

// System
app.use('/api/health', healthRoutes);
app.use('/api/dashboard', rateLimiter, dashboardRoutes);
app.use('/api/admin', rateLimiter, adminRoutes);
app.use('/api/audit', rateLimiter, auditRoutes);

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
