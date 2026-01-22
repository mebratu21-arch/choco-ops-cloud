import request from 'supertest';
import { app } from '../../app';
import { db } from '../../config/database';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Reset database
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
          role: 'WAREHOUSE',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.access_token).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com', // Already exists from previous test
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test2@example.com',
          password: '123', // Too short
          first_name: 'Test',
          last_name: 'User',
        });

      expect(res.status).toBe(400); // 400 Bad Request (Validation Error)
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.access_token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });

    it('should fail after 5 attempts (rate limit)', async () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrong',
          });
      }

      // 6th attempt should be rate limited
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong',
        });

      expect(res.status).toBe(429);
      expect(res.body.error).toContain('Too many');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return profile with valid token', async () => {
        // Wait for rate limit window to pass or mock it? 
        // Rate limit is by IP. Since we just triggered it, we might be blocked.
        // For testing purposes we should probably mock rate limiter or wait, but waiting 15 mins is not viable.
        // In a real test environment, we'd use redis store that can be flushed.
        // For now, let's just create a new agent or trust that prior tests passed enough.
        // Actually, let's create a *different* user for this test to avoid lock-out if logic was user-based, 
        // but rate limit is IP based.
        // Let's Skip this test if rate limited, OR we can mock the rate limiter middleware but that requires structure changes.
        // I will comment out the rate limit test block above or reduced it to not block this one?
        // Actually, I can just use a different IP header? X-Forwarded-For
        
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', '10.0.0.1') // Bypass rate limit for previous IP
        .send({
          email: 'profile@example.com',
          password: 'password123',
          first_name: 'Profile',
          last_name: 'User',
          role: 'MANAGER'
        });
        
      const token = registerRes.body.data.access_token;

      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('profile@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile');

      expect(res.status).toBe(401);
    });
  });
});
