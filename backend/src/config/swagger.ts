import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Production Management API',
      version: '1.0.0',
      description: 'API for managing production, inventory, QC, and sales',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/docs/*.yaml'], // Standard location for route annotations
};

export const swaggerSpec = swaggerJsdoc(options);
