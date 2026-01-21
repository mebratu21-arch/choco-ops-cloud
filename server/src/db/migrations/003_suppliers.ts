/**
 * ============================================
 * MIGRATION: 003_suppliers.ts
 * ============================================
 * Purpose: Raw material supplier management
 * 
 * Table: suppliers
 * - Tracks material vendors (cocoa, dairy, sugar suppliers)
 * - Supplier performance ratings (1-5 scale)
 * - Contact information for procurement
 * - Active/inactive status for vendor management
 * 
 * Dependencies: None (independent table)
 * 
 * Business Rules:
 * - Supplier name should be descriptive (e.g., "Ghana Cocoa Exports")
 * - Rating scale: 1 (poor) to 5 (excellent)
 * - Inactive suppliers retained for historical data
 * 
 * Real-World Context (Max Brenner):
 * - International suppliers (Ghana cocoa, Swiss dairy)
 * - Rating based on: quality, delivery time, price
 * - Procurement team uses this for vendor selection
 * 
 * Author: Senior Database Team
 * Date: 2025-01-21
 * ============================================
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('suppliers', (table) => {
    // Primary Key
    table.uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique supplier identifier');

    // Company Information
    table.string('name', 255)
      .notNullable()
      .comment('Supplier company name');

    table.string('contact_person', 255)
      .comment('Primary contact name');

    table.string('email', 255)
      .comment('Supplier contact email');

    table.string('phone', 20)
      .comment('Supplier contact phone');

    table.text('address')
      .comment('Full supplier address (for shipping)');

    // Performance Metrics
    table.decimal('rating', 2, 1)
      .checkBetween([1, 5])
      .comment('Supplier rating: 1 (poor) to 5 (excellent)');

    // Status Management
    table.boolean('is_active')
      .defaultTo(true)
      .comment('Active supplier flag (false = no longer used)');

    // Audit Timestamps
    table.timestamps(true, true);
  });

  // Performance Indexes
  await knex.schema.raw(`
    CREATE INDEX idx_suppliers_name ON suppliers(name);
    COMMENT ON INDEX idx_suppliers_name IS 'Search suppliers by name';
    
    CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
    COMMENT ON INDEX idx_suppliers_is_active IS 'Filter active suppliers only';
    
    CREATE INDEX idx_suppliers_rating ON suppliers(rating DESC);
    COMMENT ON INDEX idx_suppliers_rating IS 'Sort suppliers by performance rating';
  `);

  // Table Documentation
  await knex.raw(`
    COMMENT ON TABLE suppliers IS 'Raw material vendor management and performance tracking';
    COMMENT ON COLUMN suppliers.rating IS 'Performance rating based on: quality, delivery, price';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('suppliers');
}
