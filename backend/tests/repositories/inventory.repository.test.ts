import { db, disconnectDB } from '../../src/config/database.js';
import { InventoryRepository } from '../../src/repositories/inventory/inventory.repository.js';

describe('InventoryRepository', () => {
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

  describe('findLowStock', () => {
    it('should return items below minimum stock', async () => {
      const [supplier] = await trx('suppliers').insert({
        name: 'Test Supplier', contact_email: 'supp@test.com', contact_phone: '123',
        created_at: new Date(), updated_at: new Date()
      }).returning('*');

      await trx('ingredients').insert([
        { 
          id: db.raw('gen_random_uuid()'), name: 'Cocoa', current_stock: 5, minimum_stock: 20, optimal_stock: 100, unit: 'kg',
          supplier_id: supplier.id, cost_per_unit: 10, is_active: true, created_at: new Date(), updated_at: new Date()
        },
        { 
          id: db.raw('gen_random_uuid()'), name: 'Sugar', current_stock: 50, minimum_stock: 10, optimal_stock: 100, unit: 'kg',
          supplier_id: supplier.id, cost_per_unit: 5, is_active: true, created_at: new Date(), updated_at: new Date()
        },
      ]);

      const low = await InventoryRepository.findLowStock(trx);
      expect(low.length).toBe(1);
      expect(low[0].name).toBe('Cocoa');
    });
  });

  describe('updateStock', () => {
    it('should update stock quantity', async () => {
      const [supplier] = await trx('suppliers').insert({
        name: 'Test Supplier 2', contact_email: 'supp2@test.com', contact_phone: '123',
        created_at: new Date(), updated_at: new Date()
      }).returning('*');

      const [ingredient] = await trx('ingredients')
        .insert({ 
          name: 'Milk', current_stock: 100, minimum_stock: 50, optimal_stock: 200, unit: 'liter', 
          supplier_id: supplier.id, cost_per_unit: 2.5, is_active: true,
          created_at: new Date(), updated_at: new Date()
        })
        .returning('*');

      await InventoryRepository.updateStock(ingredient.id, 80, trx);

      const updated = await db('ingredients').where('id', ingredient.id).first().transacting(trx);
      console.log('Updated ingredient:', updated);
      expect(Number(updated.current_stock)).toBe(80);
    });
  });
});
