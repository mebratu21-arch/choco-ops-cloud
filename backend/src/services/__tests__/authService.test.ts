import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import { db } from '../../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

vi.mock('../../config/database', () => ({
  db: vi.fn(),
}));

vi.mock('bcrypt');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  describe('register', () => {
    it('should hash password and create user', async () => {
      // Mock db transaction
      const trx = {
        insert: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: '123', email: 'test@test.com', role: 'admin' }]),
      } as any;
      
      (db.transaction as any) = vi.fn((callback) => callback(trx));
      
      const hashedPassword = 'hashed_password';
      (bcrypt.hash as any).mockResolvedValue(hashedPassword);

      const result = await authService.register('test@test.com', 'password', 'Test User', 'admin');

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(result).toEqual({ id: '123', email: 'test@test.com', role: 'admin' });
    });
  });

  describe('login', () => {
      it('should return token for valid credentials', async () => {
          const user = { id: '123', email: 'test@test.com', password_hash: 'hashed', role: 'admin' };
          (db as any).mockReturnValue({
              where: vi.fn().mockReturnValue({
                  first: vi.fn().mockResolvedValue(user)
              })
          });

          (bcrypt.compare as any).mockResolvedValue(true);
          (jwt.sign as any).mockReturnValue('mock_token');

          const result = await authService.login('test@test.com', 'password');

          expect(result).toHaveProperty('token', 'mock_token');
          expect(result.user).toEqual({ id: '123', email: 'test@test.com', role: 'admin', full_name: undefined });
      });

      it('should throw error for invalid password', async () => {
           const user = { id: '123', email: 'test@test.com', password_hash: 'hashed' };
          (db as any).mockReturnValue({
              where: vi.fn().mockReturnValue({
                  first: vi.fn().mockResolvedValue(user) // User found
              })
          });
          (bcrypt.compare as any).mockResolvedValue(false); // Wrong password

          await expect(authService.login('test@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
      });
  });
});
