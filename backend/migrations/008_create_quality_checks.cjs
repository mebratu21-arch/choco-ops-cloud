// ========================================================
// MIGRATION 008: QUALITY_CHECKS TABLE
// Quality control assessments for batches
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('quality_checks', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Batch Reference
    table
      .uuid('batch_id')
      .notNullable()
      .references('id')
      .inTable('batches')
      .onDelete('CASCADE');

    // Inspector
    table
      .uuid('checked_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    // Quality Criteria
    table.enum('appearance', ['PASS', 'FAIL', 'N/A']).defaultTo('N/A');
    table.enum('texture', ['PASS', 'FAIL', 'N/A']).defaultTo('N/A');
    table.enum('taste', ['PASS', 'FAIL', 'N/A']).defaultTo('N/A');
    table.enum('packaging', ['PASS', 'FAIL', 'N/A']).defaultTo('N/A');

    // Defect Tracking
    table.integer('defect_count').notNullable().defaultTo(0);
    table.text('defect_description');

    // Final Decision
    table
      .enum('final_status', ['APPROVED', 'REJECTED', 'QUARANTINE', 'PENDING'])
      .notNullable()
      .defaultTo('PENDING');

    // Notes
    table.text('notes');

    // Soft Delete
    table.timestamp('deleted_at').nullable().index();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('batch_id', 'idx_quality_batch');
    table.index('final_status', 'idx_quality_status');
    table.index('checked_by', 'idx_quality_inspector');
    table.index(['final_status', 'created_at'], 'idx_quality_status_date');
  });

  // Add constraints
  await knex.raw(`
    ALTER TABLE quality_checks
    ADD CONSTRAINT chk_quality_defect_count
    CHECK (defect_count >= 0);
    
    -- Partial index for pending checks
    CREATE INDEX idx_quality_pending
    ON quality_checks (id, batch_id, created_at)
    WHERE final_status = 'PENDING' AND deleted_at IS NULL;
    
    COMMENT ON TABLE quality_checks IS 'Quality control assessments';
    COMMENT ON COLUMN quality_checks.final_status IS 'Overall quality decision';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('quality_checks');
}
