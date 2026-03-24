import { vi } from 'vitest';

// Global mocks
vi.mock('../config/database', () => ({
  db: vi.fn(),
}));

// Set env vars
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
