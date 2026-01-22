// ========================================================
// MIGRATION 009: AUDIT_LOGS TABLE
// Comprehensive audit trail for compliance
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('audit_logs', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // User Reference
    table
      .uuid('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    // Action Information
    table.string('action', 100).notNullable();
    table.string('resource', 100);
    table.uuid('resource_id');

    // Change Tracking (JSONB for flexibility)
    table.jsonb('old_values');
    table.jsonb('new_values');

    // Request Metadata
    table.specificType('ip_address', 'inet');
    table.string('user_agent', 500);

    // Timestamps (created_at only, no updates)
    table.timestamps(true, true);

    // Indexes for audit queries
    table.index(['user_id', 'created_at'], 'idx_audit_user_time');
    table.index(['resource', 'resource_id'], 'idx_audit_resource');
    table.index('action', 'idx_audit_action');
    table.index('created_at', 'idx_audit_created');
  });

  // Add GIN indexes for JSONB columns
  await knex.raw(`
    CREATE INDEX idx_audit_old_values_gin
    ON audit_logs USING GIN (old_values);
    
    CREATE INDEX idx_audit_new_values_gin
    ON audit_logs USING GIN (new_values);
    
    COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for compliance';
    COMMENT ON COLUMN audit_logs.old_values IS 'Previous state before change';
    COMMENT ON COLUMN audit_logs.new_values IS 'New state after change';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('audit_logs');
}
