/**
 * ============================================
 * FILE: 008_warehouse_stock.ts
 * ============================================
 * Purpose: Finished goods warehouse management
 * Location tracking and expiry monitoring
 * ============================================
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE stock_status AS ENUM (
      'available', 'reserved', 'sold', 'expired', 'damaged'
    );
  `);

  await knex.schema.createTable('warehouse_stock', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique stock item ID');
    
    table.uuid('batch_id').notNullable()
      .references('id').inTable('production_batches').onDelete('RESTRICT')
      .comment('Source production batch');
    
    table.string('product_name', 255).notNullable()
      .comment('Product description');
    
    table.decimal('quantity', 10, 2).notNullable()
      .comment('Available stock quantity');
    
    table.string('unit', 20).notNullable()
      .comment('Unit of measurement');
    
    table.string('location', 50).notNullable()
      .comment('Warehouse location code (e.g., W-A1, W-B2)');
    
    table.date('expiry_date').notNullable()
      .comment('Product expiration date');
    
    table.specificType('status', 'stock_status').notNullable().defaultTo('available')
      .comment('Stock availability status');
    
    table.timestamps(true, true);
  });

  await knex.schema.raw(`
    CREATE INDEX idx_warehouse_stock_batch_id ON warehouse_stock(batch_id);
    CREATE INDEX idx_warehouse_stock_status ON warehouse_stock(status);
    CREATE INDEX idx_warehouse_stock_location ON warehouse_stock(location);
    CREATE INDEX idx_warehouse_stock_expiry_date ON warehouse_stock(expiry_date);
    
    COMMENT ON TABLE warehouse_stock IS 'Finished goods inventory with location and expiry tracking';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('warehouse_stock');
  await knex.raw('DROP TYPE IF EXISTS stock_status CASCADE');
}
