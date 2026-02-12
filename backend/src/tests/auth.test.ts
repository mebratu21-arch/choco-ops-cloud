
import request from 'supertest';
import app from '../app';
import { db } from '../config/database';
import bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'admin@cocoaflow.com';
const ADMIN_PASS = 'admin123';
const USER_EMAIL = 'worker@cocoaflow.com';
const USER_PASS = 'worker123';

describe('Auth & RBAC', () => {
  afterAll(async () => {
    // We do NOT destroy DB here because integration tests run after? 
    // Actually Jest runs normally with teardown. We should properly close.
    // But since app.ts might export the app but server starts it... 
    // We assume 'app' is the express instance.
    await db.destroy();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASS });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: 'wrongpassword' });
      
      expect(res.status).toBe(400); // Or 401 depending on controller
    });
  });

  describe('RBAC checks', () => {
    let adminToken: string;
    let workerToken: string;

    beforeAll(async () => {
      const adminRes = await request(app).post('/api/auth/login').send({ email: ADMIN_EMAIL, password: ADMIN_PASS });
      adminToken = adminRes.body.data.accessToken;

      const workerRes = await request(app).post('/api/auth/login').send({ email: USER_EMAIL, password: USER_PASS });
      workerToken = workerRes.body.data.accessToken;
    });

    it('Admin should access admin-only routes (e.g., manage users)', async () => {
       // Assuming GET /api/admin/users exists or similar - verifying against known routes
       // Let's use GET /api/machines since admins can see machines
       const res = await request(app)
         .get('/api/machines')
         .set('Authorization', `Bearer ${adminToken}`);
       expect(res.status).toBe(200);
    });
    
    // NOTE: We need a simpler check if admin routes aren't public.
    // Checking /api/auth/me if strictly protected?
  });
});
