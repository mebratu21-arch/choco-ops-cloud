/**
 * ============================================
 * MIGRATION: 004_raw_materials.ts
 * ============================================
 * Purpose: Chocolate factory raw material inventory
 * 
 * Table: raw_materials
 * - Inventory management for cocoa, sugar, milk, additives
 * - Real-time stock tracking with units
 * - Automated reorder alerts (quantity < reorder_point)
 * - Expiry date monitoring for perishable items
 * - Material categorization for organization
 * 
 * Dependencies: suppliers (003_suppliers.ts)
 * 
 * Business Rules:
 * - Each material linked to primary supplier
 * - Reorder point triggers procurement alerts
 * - Expiry tracking for perishables (milk, cream)
 * - Storage location for warehouse management
 * 
 * ENUM Types:
 * - material_category: cocoa, sweetener, dairy, additive, packaging
 * - material_unit: kg, liters, units, grams
 * 
 * Real-World Context (Max Brenner):
 * - Cocoa beans: ~5000kg average stock
 * - Sugar: ~3000kg average stock
 * - Milk powder: ~2000kg average stock
 * - Reorder alerts prevent production delays
 * 
 * Author: Senior Database Team
 * Date: 2025-01-21
 * ============================================
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create ENUM types for material categories and units
  await knex.raw(`
    CREATE TYPE material_category AS ENUM (
      'cocoa',      -- Cocoa beans, butter, powder
      'sweetener',  -- Sugar, brown sugar, alternatives
      'dairy',      -- Milk powder, cream, butter
      'additive',   -- Vanilla, salt, lecithin
      'packaging'   -- Boxes, wrappers, labels
    );
    
    COMMENT ON TYPE material_category IS 'Raw material classification for inventory organization';
  `);

  await knex.raw(`
    CREATE TYPE material_unit AS ENUM (
      'kg',      -- Kilograms (solid materials)
      'liters',  -- Liters (liquid materials)
      'units',   -- Individual items (packaging)
      'grams'    -- Precise measurements (additives)
    );
    
    COMMENT ON TYPE material_unit IS 'Measurement units for inventory tracking';
  `);

  // Create raw_materials table
  await knex.schema.createTable('raw_materials', (table) => {
    // Primary Key
    table.uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique material identifier');

    // Foreign Key: Supplier
    table.uuid('supplier_id')
      .references('id')
      .inTable('suppliers')
      .onDelete('SET NULL')
      .comment('Primary supplier (NULL if supplier deleted)');

    // Material Information
    table.string('name', 255)
      .notNullable()
      .comment('Material name (e.g., "Premium Cocoa Beans")');

    table.specificType('category', 'material_category')
      .notNullable()
      .comment('Material category for organization');

    // Inventory Tracking
    table.decimal('quantity', 10, 2)
      .notNullable()
      .defaultTo(0)
      .comment('Current stock level');

    table.specificType('unit', 'material_unit')
      .notNullable()
      .comment('Measurement unit (kg, liters, etc.)');

    // Pricing
    table.decimal('unit_price', 10, 2)
      .notNullable()
      .comment('Price per unit (for cost calculations)');

    // Reorder Management
    table.decimal('reorder_point', 10, 2)
      .notNullable()
      .defaultTo(100)
      .comment('Alert threshold: triggers procurement when quantity < reorder_point');

    // Warehouse Management
    table.string('storage_location', 50)
      .comment('Warehouse location code (e.g., "A1", "B2")');

    // Expiry Tracking
    table.date('expiry_date')
      .comment('Expiration date (critical for perishables)');

    // Audit Timestamps
    table.timestamps(true, true);
  });

  // Performance Indexes
  await knex.schema.raw(`
    CREATE INDEX idx_raw_materials_name ON raw_materials(name);
    COMMENT ON INDEX idx_raw_materials_name IS 'Search materials by name';
    
    CREATE INDEX idx_raw_materials_category ON raw_materials(category);
    COMMENT ON INDEX idx_raw_materials_category IS 'Filter by material category';
    
    CREATE INDEX idx_raw_materials_supplier_id ON raw_materials(supplier_id);
    COMMENT ON INDEX idx_raw_materials_supplier_id IS 'Materials by supplier';
    
    CREATE INDEX idx_raw_materials_quantity ON raw_materials(quantity);
    COMMENT ON INDEX idx_raw_materials_quantity IS 'Low stock detection';
    
    CREATE INDEX idx_raw_materials_expiry_date ON raw_materials(expiry_date);
    COMMENT ON INDEX idx_raw_materials_expiry_date IS 'Expiring items monitoring';
    
    CREATE INDEX idx_raw_materials_reorder_alert ON raw_materials(quantity, reorder_point)
      WHERE quantity < reorder_point;
    COMMENT ON INDEX idx_raw_materials_reorder_alert IS 'Fast reorder alerts';
  `);

  // Table Documentation
  await knex.raw(`
    COMMENT ON TABLE raw_materials IS 'Chocolate factory raw material inventory with automated reorder alerts';
    COMMENT ON COLUMN raw_materials.reorder_point IS 'ALERT TRIGGER: quantity < reorder_point notifies procurement';
    COMMENT ON COLUMN raw_materials.quantity IS 'Real-time stock level (updated on production and procurement)';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('raw_materials');
  await knex.raw('DROP TYPE IF EXISTS material_category CASCADE');
  await knex.raw('DROP TYPE IF EXISTS material_unit CASCADE');
}
