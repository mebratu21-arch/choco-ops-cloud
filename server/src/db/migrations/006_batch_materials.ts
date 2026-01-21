/**
 * ============================================
 * FILE: 006_batch_materials.ts
 * ============================================
 * Purpose: Material consumption tracking (N:M junction table)
 * Links: production_batches ↔ raw_materials
 * ============================================
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('batch_materials', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique consumption record ID');
    
    table.uuid('batch_id').notNullable()
      .references('id').inTable('production_batches').onDelete('CASCADE')
      .comment('Production batch (CASCADE: delete if batch deleted)');
    
    table.uuid('material_id').notNullable()
      .references('id').inTable('raw_materials').onDelete('RESTRICT')
      .comment('Material consumed (RESTRICT: cannot delete used materials)');
    
    table.decimal('quantity_used', 10, 2).notNullable()
      .comment('Amount consumed in this batch');
    
    table.string('unit', 20).notNullable()
      .comment('Unit of measurement');
    
    table.decimal('cost_at_usage', 10, 2).notNullable()
      .comment('SNAPSHOT: Price at time of use (for cost tracking)');
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.raw(`
    CREATE INDEX idx_batch_materials_batch_id ON batch_materials(batch_id);
    CREATE INDEX idx_batch_materials_material_id ON batch_materials(material_id);
    
    COMMENT ON TABLE batch_materials IS 'Material consumption per batch (junction table with cost tracking)';
    COMMENT ON COLUMN batch_materials.cost_at_usage IS 'Price snapshot prevents historical cost errors';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('batch_materials');
}
