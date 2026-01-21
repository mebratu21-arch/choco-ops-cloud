import { Knex } from 'knex';

/**
 * ============================================
 * FILE: 006_batch_materials.ts
 * ============================================
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE batch_materials RESTART IDENTITY CASCADE');

  await knex('batch_materials').insert([
    // BATCH-2025-001 (Dark Chocolate 70%)
    {
      batch_id: '990e8400-e29b-41d4-a716-446655440001',
      material_id: '880e8400-e29b-41d4-a716-446655440001', // Cocoa Beans
      quantity_used: 350.00,
      unit: 'kg',
      cost_at_usage: 8.50,
      created_at: '2025-01-15 08:30:00',
    },
    {
      batch_id: '990e8400-e29b-41d4-a716-446655440001',
      material_id: '880e8400-e29b-41d4-a716-446655440004', // Cane Sugar
      quantity_used: 150.00,
      unit: 'kg',
      cost_at_usage: 1.20,
      created_at: '2025-01-15 08:30:00',
    },
    // BATCH-2025-002 (Milk Chocolate 40%)
    {
      batch_id: '990e8400-e29b-41d4-a716-446655440002',
      material_id: '880e8400-e29b-41d4-a716-446655440001', // Cocoa Beans
      quantity_used: 320.00,
      unit: 'kg',
      cost_at_usage: 8.50,
      created_at: '2025-01-16 09:30:00',
    },
    {
      batch_id: '990e8400-e29b-41d4-a716-446655440002',
      material_id: '880e8400-e29b-41d4-a716-446655440006', // Milk Powder
      quantity_used: 280.00,
      unit: 'kg',
      cost_at_usage: 4.50,
      created_at: '2025-01-16 09:30:00',
    },
    {
      batch_id: '990e8400-e29b-41d4-a716-446655440002',
      material_id: '880e8400-e29b-41d4-a716-446655440004', // Cane Sugar
      quantity_used: 200.00,
      unit: 'kg',
      cost_at_usage: 1.20,
      created_at: '2025-01-16 09:30:00',
    },
  ]);

  console.log('Seeded batch material consumption records');
}
