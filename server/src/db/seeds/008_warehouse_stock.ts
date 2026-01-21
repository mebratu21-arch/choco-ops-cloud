import { Knex } from 'knex';

/**
 * ============================================
 * FILE: 008_warehouse_stock.ts
 * ============================================
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE warehouse_stock RESTART IDENTITY CASCADE');

  await knex('warehouse_stock').insert([
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440001',
      batch_id: '990e8400-e29b-41d4-a716-446655440001',
      product_name: 'Dark Chocolate 70%',
      quantity: 500.00,
      unit: 'kg',
      location: 'W-A1',
      expiry_date: '2025-07-15',
      status: 'available',
      created_at: '2025-01-15 17:00:00',
      updated_at: '2025-01-15 17:00:00',
    },
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440002',
      batch_id: '990e8400-e29b-41d4-a716-446655440002',
      product_name: 'Milk Chocolate 40%',
      quantity: 800.00,
      unit: 'kg',
      location: 'W-A2',
      expiry_date: '2025-06-16',
      status: 'available',
      created_at: '2025-01-16 18:30:00',
      updated_at: '2025-01-16 18:30:00',
    },
  ]);

  console.log('Seeded warehouse stock');
}
