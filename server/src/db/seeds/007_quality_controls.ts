import { Knex } from 'knex';

/**
 * ============================================
 * FILE: 007_quality_controls.ts
 * ============================================
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE quality_controls RESTART IDENTITY CASCADE');

  await knex('quality_controls').insert([
    {
      batch_id: '990e8400-e29b-41d4-a716-446655440001',
      inspector_id: '660e8400-e29b-41d4-a716-446655440004',
      inspection_stage: 'final',
      status: 'passed',
      temperature: 45.5,
      texture_score: 9,
      taste_score: 9,
      notes: 'Excellent batch - smooth texture, rich flavor',
      inspected_at: '2025-01-15 16:00:00',
      created_at: '2025-01-15 16:00:00',
      updated_at: '2025-01-15 16:00:00',
    },
    {
      batch_id: '990e8400-e29b-41d4-a716-446655440002',
      inspector_id: '660e8400-e29b-41d4-a716-446655440004',
      inspection_stage: 'final',
      status: 'passed',
      temperature: 43.2,
      texture_score: 8,
      taste_score: 8,
      notes: 'Good quality - meets all standards',
      inspected_at: '2025-01-16 17:30:00',
      created_at: '2025-01-16 17:30:00',
      updated_at: '2025-01-16 17:30:00',
    },
  ]);

  console.log('Seeded quality control inspections');
}
