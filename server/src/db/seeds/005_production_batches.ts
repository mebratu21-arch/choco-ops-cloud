import { Knex } from 'knex';

/**
 * ============================================
 * FILE: 005_production_batches.ts
 * ============================================
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE production_batches RESTART IDENTITY CASCADE');

  await knex('production_batches').insert([
    {
      id: '990e8400-e29b-41d4-a716-446655440001',
      batch_number: 'BATCH-2025-001',
      product_name: 'Dark Chocolate 70%',
      quantity: 500.00,
      unit: 'kg',
      status: 'completed',
      started_at: '2025-01-15 08:00:00',
      completed_at: '2025-01-15 16:30:00',
      created_by: '660e8400-e29b-41d4-a716-446655440002',
      notes: 'Premium dark chocolate batch - excellent quality',
      created_at: '2025-01-15 07:00:00',
      updated_at: '2025-01-15 16:30:00',
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440002',
      batch_number: 'BATCH-2025-002',
      product_name: 'Milk Chocolate 40%',
      quantity: 800.00,
      unit: 'kg',
      status: 'completed',
      started_at: '2025-01-16 09:00:00',
      completed_at: '2025-01-16 18:00:00',
      created_by: '660e8400-e29b-41d4-a716-446655440002',
      notes: 'Popular milk chocolate for retail',
      created_at: '2025-01-16 08:00:00',
      updated_at: '2025-01-16 18:00:00',
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440003',
      batch_number: 'BATCH-2025-003',
      product_name: 'White Chocolate',
      quantity: 300.00,
      unit: 'kg',
      status: 'packaging',
      started_at: '2025-01-20 07:30:00',
      completed_at: null,
      created_by: '660e8400-e29b-41d4-a716-446655440002',
      notes: 'Premium white chocolate - currently in packaging stage',
      created_at: '2025-01-20 07:00:00',
      updated_at: '2025-01-21 10:00:00',
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440004',
      batch_number: 'BATCH-2025-004',
      product_name: 'Dark Chocolate 85%',
      quantity: 200.00,
      unit: 'kg',
      status: 'mixing',
      started_at: '2025-01-21 08:00:00',
      completed_at: null,
      created_by: '660e8400-e29b-41d4-a716-446655440002',
      notes: 'Extra dark chocolate for specialty market',
      created_at: '2025-01-21 07:30:00',
      updated_at: '2025-01-21 09:00:00',
    },
  ]);

  console.log('Seeded 4 production batches');
}
