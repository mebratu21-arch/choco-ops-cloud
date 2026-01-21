/**
 * ============================================
 * FILE: 007_quality_controls.ts
 * ============================================
 * Purpose: Quality assurance inspection system
 * Multi-stage inspections with scoring
 * ============================================
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE inspection_stage AS ENUM (
      'mixing', 'cooking', 'cooling', 'packaging', 'final'
    );
    CREATE TYPE inspection_status AS ENUM (
      'passed', 'failed', 'pending'
    );
  `);

  await knex.schema.createTable('quality_controls', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique inspection record ID');
    
    table.uuid('batch_id').notNullable()
      .references('id').inTable('production_batches').onDelete('CASCADE')
      .comment('Batch being inspected');
    
    table.uuid('inspector_id').notNullable()
      .references('id').inTable('users').onDelete('RESTRICT')
      .comment('QC staff who performed inspection');
    
    table.specificType('inspection_stage', 'inspection_stage').notNullable()
      .comment('Production stage inspected');
    
    table.specificType('status', 'inspection_status').notNullable().defaultTo('pending')
      .comment('Inspection result');
    
    table.decimal('temperature', 5, 2)
      .comment('Temperature reading (°C)');
    
    table.integer('texture_score').checkBetween([1, 10])
      .comment('Texture quality: 1 (poor) to 10 (excellent)');
    
    table.integer('taste_score').checkBetween([1, 10])
      .comment('Taste quality: 1 (poor) to 10 (excellent)');
    
    table.text('notes')
      .comment('Inspector notes and observations');
    
    table.timestamp('inspected_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });

  await knex.schema.raw(`
    CREATE INDEX idx_quality_controls_batch_id ON quality_controls(batch_id);
    CREATE INDEX idx_quality_controls_status ON quality_controls(status);
    CREATE INDEX idx_quality_controls_inspector_id ON quality_controls(inspector_id);
    
    COMMENT ON TABLE quality_controls IS 'Multi-stage quality inspections with temperature and sensory scoring';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quality_controls');
  await knex.raw('DROP TYPE IF EXISTS inspection_stage CASCADE');
  await knex.raw('DROP TYPE IF EXISTS inspection_status CASCADE');
}
