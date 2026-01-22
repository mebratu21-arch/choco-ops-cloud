import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/error.middleware.js';
import { requestId } from './middleware/request-id.middleware.js';
import { generalLimiter } from './middleware/rate-limit.middleware.js';
import routes from './routes/index.js';

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors({
  origin: config.NODE_ENV === 'production' 
    ? 'https://your-frontend.com' 
    : 'http://localhost:3000',
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Rate limiting
app.use(generalLimiter);

// Request tracking
app.use(requestId);

// API Routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
