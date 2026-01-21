/**
 * ============================================
 * FILE: 009_stock_movements.ts
 * ============================================
 * Purpose: Warehouse movement audit trail
 * Tracks all stock changes (in/out/adjustments)
 * ============================================
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE movement_type AS ENUM (
      'in', 'out', 'adjustment', 'transfer'
    );
  `);

  await knex.schema.createTable('stock_movements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique movement record ID');
    
    table.uuid('stock_id').notNullable()
      .references('id').inTable('warehouse_stock').onDelete('CASCADE')
      .comment('Stock item affected');
    
    table.specificType('movement_type', 'movement_type').notNullable()
      .comment('Movement direction: in/out/adjustment/transfer');
    
    table.decimal('quantity', 10, 2).notNullable()
      .comment('Quantity moved (positive or negative)');
    
    table.string('reason', 100).notNullable()
      .comment('Reason: production/sale/damage/transfer/adjustment');
    
    table.uuid('performed_by').notNullable()
      .references('id').inTable('users').onDelete('RESTRICT')
      .comment('User who performed movement');
    
    table.text('notes')
      .comment('Additional movement details');
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.raw(`
    CREATE INDEX idx_stock_movements_stock_id ON stock_movements(stock_id);
    CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);
    CREATE INDEX idx_stock_movements_performed_by ON stock_movements(performed_by);
    
    COMMENT ON TABLE stock_movements IS 'Complete audit trail of all warehouse stock changes';
    COMMENT ON COLUMN stock_movements.reason IS 'AUDIT: Required for compliance and reconciliation';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('stock_movements');
  await knex.raw('DROP TYPE IF EXISTS movement_type CASCADE');
}
