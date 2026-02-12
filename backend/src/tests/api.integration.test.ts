
import request from 'supertest';
import app from '../app';
import { db } from '../config/database';

describe('API Integration', () => {
  let adminToken: string;
  let productionToken: string;
  let commonHeaders: any;

  beforeAll(async () => {
    // Admin login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cocoaflow.com', password: 'admin123' });
    adminToken = adminRes.body.data.accessToken;

    // Production Worker login
    const prodRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'worker@cocoaflow.com', password: 'worker123' });
    productionToken = prodRes.body.data.accessToken;
    
    commonHeaders = { Authorization: `Bearer ${adminToken}` };
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('Inventory Flow', () => {
    it('should list all inventory items', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set(commonHeaders);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });
  });

  describe('Production Flow', () => {
    it('should list production batches', async () => {
      const res = await request(app)
        .get('/api/batches')
        .set(commonHeaders); // Admin can view batches
      
      expect(res.status).toBe(200);
    });
  });

  describe('Machine Endpoint', () => {
    it('should list machines', async () => {
       const res = await request(app)
         .get('/api/machines')
         .set(commonHeaders);
       expect(res.status).toBe(200);
       expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
  
});
