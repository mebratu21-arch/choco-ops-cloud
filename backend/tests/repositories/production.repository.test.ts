import { db, disconnectDB } from '../../src/config/database.js';
import { ProductionRepository } from '../../src/repositories/production/production.repository.js';
import { UserRepository } from '../../src/repositories/identity/user.repository.js';

describe('ProductionRepository', () => {
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

  describe('createBatch', () => {
    it('should create a planned batch', async () => {
      // Seed users
      const mgr = await UserRepository.create({ email: 'mgr@test.com', name: 'Mgr', role: 'MANAGER', password_hash: 'hash', is_active: true }, trx);
      const prod = await UserRepository.create({ email: 'prod@test.com', name: 'Prod', role: 'PRODUCTION', password_hash: 'hash', is_active: true }, trx);
      
      // Seed recipe
      const [recipe] = await trx('recipes').insert({
        name: 'Test Recipe', description: 'Desc', created_by: mgr.id,
        yield_quantity: 100, yield_unit: 'kg', is_active: true,
        created_at: new Date(), updated_at: new Date()
      }).returning('*');

      const input = {
        recipe_id: recipe.id,
        quantity_produced: 500,
        produced_by: prod.id,
        created_by: mgr.id,
      };

      const batch = await ProductionRepository.create(input, trx);

      expect(batch.status).toBe('COMPLETED');
      expect(Number(batch.quantity_produced)).toBe(500);
    });
  });

  describe('findAll', () => {
    it('should return batches', async () => {
      const mgr = await UserRepository.create({ email: 'mgr2@test.com', name: 'Mgr2', role: 'MANAGER', password_hash: 'hash', is_active: true }, trx);
      const prod = await UserRepository.create({ email: 'prod2@test.com', name: 'Prod2', role: 'PRODUCTION', password_hash: 'hash', is_active: true }, trx);
      const [recipe] = await trx('recipes').insert({ 
        name: 'Recipe2', created_by: mgr.id,
        yield_quantity: 100, yield_unit: 'kg', is_active: true,
        created_at: new Date(), updated_at: new Date()
      }).returning('*');

      await ProductionRepository.create({ 
        recipe_id: recipe.id, quantity_produced: 100, produced_by: prod.id, created_by: mgr.id 
      }, trx);

      const batches = await ProductionRepository.findAll({}, trx);
      expect(batches.length).toBeGreaterThan(0);
    });
  });
});
