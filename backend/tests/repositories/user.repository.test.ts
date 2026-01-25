import { db, disconnectDB } from '../../src/config/database.js';
import { UserRepository } from '../../src/repositories/user.repository.js';

describe('UserRepository', () => {
  let trx: any;

  beforeEach(async () => {
    trx = await db.transaction();
  });

  afterEach(async () => {
    await trx.rollback();
  });
  
  afterAll(async () => {
    await disconnectDB();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hashedpassword',
        role: 'WAREHOUSE' as const, // Fix TS string vs literal
      };

      const user = await UserRepository.create(input, trx);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('WAREHOUSE');
    });

    it('should throw on duplicate email', async () => {
      const input = {
        email: 'duplicate@example.com',
        name: 'Duplicate',
        password_hash: 'hash',
        role: 'WAREHOUSE' as const,
      };

      await UserRepository.create(input, trx);
      await expect(UserRepository.create(input, trx)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find existing user', async () => {
      const created = await UserRepository.create(
        { email: 'findme@example.com', name: 'Find Me', password_hash: 'hash', role: 'MANAGER' as const },
        trx
      );

      const found = await UserRepository.findById(created.id, trx);
      expect(found?.email).toBe('findme@example.com');
    });
  });

  describe('deactivate', () => {
    it('should soft-delete user', async () => {
      const created = await UserRepository.create(
        { email: 'delete@example.com', name: 'Delete Me', password_hash: 'hash', role: 'CONTROLLER' as const },
        trx
      );

      await UserRepository.deactivate(created.id, trx);
      
      const found = await UserRepository.findById(created.id, trx);
      expect(found).toBeUndefined(); // findById filters deleted_at: null
    });
  });
});
