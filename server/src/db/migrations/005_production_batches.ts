/**
 * ============================================
 * MIGRATION: 005_production_batches.ts
 * ============================================
 * Purpose: Chocolate production batch tracking system
 * 
 * Table: production_batches
 * - Tracks production from planning to completion
 * - Status-based workflow (planned → mixing → cooking → cooling → packaging → completed)
 * - Unique batch numbers for traceability
 * - Production manager ownership for accountability
 * 
 * Dependencies: users (002_users.ts)
 * 
 * Business Rules:
 * - Batch number format: BATCH-YYYY-NNN (e.g., BATCH-2025-001)
 * - Status progression: planned → mixing → cooking → cooling → packaging → completed
 * - Can be rejected at quality control (status: rejected)
 * - Production manager must exist (RESTRICT delete)
 * 
 * ENUM Types:
 * - batch_status: planned, mixing, cooking, cooling, packaging, completed, rejected
 * - production_unit: kg, units, liters
 * 
 * Real-World Context (Max Brenner):
 * - Typical batch: 500-1000 kg chocolate
 * - Production time: 6-8 hours (mixing to packaging)
 * - Multiple batches run daily
 * - Quality control at each stage
 * 
 * Author: Senior Database Team
 * Date: 2025-01-21
 * ============================================
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create ENUM type for batch status (production workflow)
  await knex.raw(`
    CREATE TYPE batch_status AS ENUM (
      'planned',     -- Initial state: batch planned, not started
      'mixing',      -- Stage 1: Mixing ingredients
      'cooking',     -- Stage 2: Heating/tempering
      'cooling',     -- Stage 3: Cooling chocolate
      'packaging',   -- Stage 4: Packaging finished product
      'completed',   -- Final state: Production complete
      'rejected'     -- Failed quality control
    );
    
    COMMENT ON TYPE batch_status IS 'Production workflow stages';
  `);

  // Create ENUM type for production units
  await knex.raw(`
    CREATE TYPE production_unit AS ENUM (
      'kg',      -- Kilograms (bulk chocolate)
      'units',   -- Individual items (bars, boxes)
      'liters'   -- Liquid chocolate
    );
    
    COMMENT ON TYPE production_unit IS 'Production quantity measurement units';
  `);

  // Create production_batches table
  await knex.schema.createTable('production_batches', (table) => {
    // Primary Key
    table.uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique batch identifier');

    // Batch Identification
    table.string('batch_number', 50)
      .notNullable()
      .unique()
      .comment('Unique batch number: BATCH-YYYY-NNN (e.g., BATCH-2025-001)');

    // Product Information
    table.string('product_name', 255)
      .notNullable()
      .comment('Product type: "Dark Chocolate 70%", "Milk Chocolate 40%", etc.');

    table.decimal('quantity', 10, 2)
      .notNullable()
      .comment('Production quantity');

    table.specificType('unit', 'production_unit')
      .notNullable()
      .comment('Quantity unit (kg, units, liters)');

    // Workflow Management
    table.specificType('status', 'batch_status')
      .notNullable()
      .defaultTo('planned')
      .comment('Current production stage');

    // Timeline Tracking
    table.timestamp('started_at')
      .comment('Production start timestamp');

    table.timestamp('completed_at')
      .comment('Production completion timestamp');

    // Ownership & Accountability
    table.uuid('created_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT')
      .comment('Production manager who created this batch');

    // Notes & Documentation
    table.text('notes')
      .comment('Production notes, special instructions, issues');

    // Audit Timestamps
    table.timestamps(true, true);
  });

  // Performance Indexes
  await knex.schema.raw(`
    CREATE INDEX idx_production_batches_batch_number ON production_batches(batch_number);
    COMMENT ON INDEX idx_production_batches_batch_number IS 'Fast batch lookup by number';
    
    CREATE INDEX idx_production_batches_status ON production_batches(status);
    COMMENT ON INDEX idx_production_batches_status IS 'Filter batches by current stage';
    
    CREATE INDEX idx_production_batches_created_by ON production_batches(created_by);
    COMMENT ON INDEX idx_production_batches_created_by IS 'Batches by production manager';
    
    CREATE INDEX idx_production_batches_created_at ON production_batches(created_at DESC);
    COMMENT ON INDEX idx_production_batches_created_at IS 'Recent batches first';
    
    CREATE INDEX idx_production_batches_active ON production_batches(status)
      WHERE status NOT IN ('completed', 'rejected');
    COMMENT ON INDEX idx_production_batches_active IS 'In-progress batches only';
  `);

  // Table Documentation
  await knex.raw(`
    COMMENT ON TABLE production_batches IS 'Chocolate production batch tracking with workflow management';
    COMMENT ON COLUMN production_batches.batch_number IS 'UNIQUE: Traceability identifier (e.g., BATCH-2025-001)';
    COMMENT ON COLUMN production_batches.status IS 'WORKFLOW: planned → mixing → cooking → cooling → packaging → completed';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('production_batches');
  await knex.raw('DROP TYPE IF EXISTS batch_status CASCADE');
  await knex.raw('DROP TYPE IF EXISTS production_unit CASCADE');
}
