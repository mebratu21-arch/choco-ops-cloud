// ========================================================
// MIGRATION 006: BATCHES TABLE
// Production batch tracking with status workflow
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('batches', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Recipe Reference
    table
      .uuid('recipe_id')
      .references('id')
      .inTable('recipes')
      .onDelete('SET NULL');

    // Production Information
    table.decimal('quantity_produced', 12, 3).notNullable();
    table
      .enum('status', [
        'PLANNED',
        'IN_PROGRESS',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
      ])
      .notNullable()
      .defaultTo('PLANNED');

    // Personnel
    table
      .uuid('produced_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .uuid('created_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    // Time Tracking
    table.timestamp('started_at');
    table.timestamp('completed_at');

    // Quality Metrics
    table.decimal('actual_yield', 12, 3);
    table.decimal('waste_percentage', 5, 2);
    table.decimal('actual_cost', 12, 3);

    // Notes
    table.text('notes');

    // Soft Delete
    table.timestamp('deleted_at').nullable().index();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('status', 'idx_batches_status');
    table.index('produced_by', 'idx_batches_produced_by');
    table.index('recipe_id', 'idx_batches_recipe');
    table.index('completed_at', 'idx_batches_completed');
    table.index(['status', 'created_at'], 'idx_batches_status_created');
  });

  // Add constraints
  await knex.raw(`
    ALTER TABLE batches
    ADD CONSTRAINT chk_batch_quantity_positive
    CHECK (quantity_produced > 0);
    
    ALTER TABLE batches
    ADD CONSTRAINT chk_batch_yield
    CHECK (actual_yield IS NULL OR actual_yield <= quantity_produced);
    
    ALTER TABLE batches
    ADD CONSTRAINT chk_waste_range
    CHECK (waste_percentage IS NULL OR (waste_percentage >= 0 AND waste_percentage <= 100));
    
    ALTER TABLE batches
    ADD CONSTRAINT chk_batch_cost_positive
    CHECK (actual_cost IS NULL OR actual_cost >= 0);
    
    ALTER TABLE batches
    ADD CONSTRAINT chk_batch_timestamps
    CHECK (started_at IS NULL OR completed_at IS NULL OR completed_at >= started_at);
    
    -- Partial index for active batches
    CREATE INDEX idx_batches_active
    ON batches (id, status, created_at)
    WHERE status IN ('PLANNED', 'IN_PROGRESS') AND deleted_at IS NULL;
    
    COMMENT ON TABLE batches IS 'Production batch tracking';
    COMMENT ON COLUMN batches.waste_percentage IS 'Calculated as (quantity_produced - actual_yield) / quantity_produced * 100';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('batches');
}
