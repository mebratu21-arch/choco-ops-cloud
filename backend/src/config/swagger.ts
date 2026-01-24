import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChocoOps Cloud API',
      version: '1.0.0',
      description: 'Full-stack ERP for chocolate manufacturing – inventory, production, sales, quality, maintenance.',
      contact: { name: 'Mebratu Mengstu' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' },
      // Add production URL later
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/routes/v1/*.ts', // Updated path to match structure
    './src/controllers/*.ts',
    './src/schemas/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
