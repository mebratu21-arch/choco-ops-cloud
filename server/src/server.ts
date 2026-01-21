import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { DatabaseHelpers } from './common/utils/database.helpers';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import supplierRoutes from './modules/suppliers/suppliers.routes';
import rawMaterialRoutes from './modules/raw-materials/raw-materials.routes';
import productionRoutes from './modules/production/production.routes';
import qualityRoutes from './modules/quality/quality.routes';
import warehouseRoutes from './modules/warehouse/warehouse.routes';
import salesRoutes from './modules/sales/sales.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/sales', salesRoutes);

// Health Check Endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const dbHealth = await DatabaseHelpers.checkHealth();
  
  if (dbHealth) {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } else {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      uptime: process.uptime()
    });
  }
});

// Basic Route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Choco Ops Cloud API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR] Unhandled Exception:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    requestId: crypto.randomUUID()
  });
});

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`\n[INFO] Server running on http://localhost:${PORT}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initial DB Check
  const dbConnected = await DatabaseHelpers.checkHealth();
  if (dbConnected) {
    console.log('[INFO] ✅ Database connected successfully');
  } else {
    console.error('[CRITICAL] ❌ Failed to connect to database');
  }
});

// Graceful Custom Shutdown
const shutdown = () => {
  console.log('\n[INFO] Shutting down server...');
  server.close(() => {
    console.log('[INFO] Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
