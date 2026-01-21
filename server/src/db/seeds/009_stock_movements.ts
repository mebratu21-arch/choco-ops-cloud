import { Knex } from 'knex';

/**
 * ============================================
 * FILE: 009_stock_movements.ts
 * ============================================
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE stock_movements RESTART IDENTITY CASCADE');

  await knex('stock_movements').insert([
    {
      stock_id: 'aa0e8400-e29b-41d4-a716-446655440001',
      movement_type: 'in',
      quantity: 500.00,
      reason: 'production',
      performed_by: '660e8400-e29b-41d4-a716-446655440003',
      notes: 'Received from production batch BATCH-2025-001',
      created_at: '2025-01-15 17:00:00',
    },
    {
      stock_id: 'aa0e8400-e29b-41d4-a716-446655440002',
      movement_type: 'in',
      quantity: 800.00,
      reason: 'production',
      performed_by: '660e8400-e29b-41d4-a716-446655440003',
      notes: 'Received from production batch BATCH-2025-002',
      created_at: '2025-01-16 18:30:00',
    },
  ]);

  console.log('Seeded stock movements');
}
