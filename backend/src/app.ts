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
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/identity/user.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import ingredientRoutes from './routes/inventory/ingredient.routes.js';
import rawMaterialRoutes from './routes/inventory/raw-material.routes.js';
import supplierRoutes from './routes/inventory/supplier.routes.js';
import warehouseRoutes from './routes/inventory/warehouse.routes.js';
import batchesRoutes from './routes/batches.routes.js';
import recipesRoutes from './routes/recipes.routes.js';
import qcRoutes from './routes/qc.routes.js';
import machinesRoutes from './routes/machines.routes.js';
import sosRoutes from './routes/sos.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import managerRoutes from './routes/manager.routes.js';
import aiRoutes from './routes/ai.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js'; // Verified

const app = express();

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', rateLimiter, userRoutes);

app.use('/api/inventory', rateLimiter, inventoryRoutes);
app.use('/api/ingredients', rateLimiter, ingredientRoutes);
app.use('/api/raw-materials', rateLimiter, rawMaterialRoutes);
app.use('/api/suppliers', rateLimiter, supplierRoutes);
app.use('/api/warehouses', rateLimiter, warehouseRoutes);

app.use('/api/batches', rateLimiter, batchesRoutes);
app.use('/api/recipes', rateLimiter, recipesRoutes);

app.use('/api/qc', rateLimiter, qcRoutes);
app.use('/api/machines', rateLimiter, machinesRoutes);
app.use('/api/sos', rateLimiter, sosRoutes);
app.use('/api/maintenance', rateLimiter, maintenanceRoutes);

app.use('/api/manager', rateLimiter, managerRoutes);
app.use('/api/dashboard', rateLimiter, dashboardRoutes); // Mounted

if (features.AI_CHATBOT) {
    app.use('/api/ai', rateLimiter, aiRoutes);
}

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'ChocoOps Backend API is running',
    frontend_url: 'http://localhost:5173',
    documentation: '/api-docs'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// REMOVED LEGACY/UNVERIFIED ROUTES TO PREVENT CRASH
// app.use('/api/sales', salesRoutes);
// app.use('/api/shop', shopRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/audit', auditRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'CocoaFlow API Root',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      inventory: '/api/inventory',
      docs: '/api-docs'
    }
  });
});

app.use(errorHandler);

export default app;
