// ========================================================
// MIGRATION 010: REFRESH_TOKENS TABLE
// JWT refresh token management
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('refresh_tokens', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // User Reference
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Token Information
    table.string('hashed_token', 255).notNullable();
    table.timestamp('expires_at').notNullable();

    // Device Tracking
    table.string('device_fingerprint', 255);

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('user_id', 'idx_refresh_user');
    table.index('expires_at', 'idx_refresh_expiry');
    table.index('hashed_token', 'idx_refresh_token');
  });

  // Add constraints
  await knex.raw(`
    ALTER TABLE refresh_tokens
    ADD CONSTRAINT chk_refresh_expires_future
    CHECK (expires_at > created_at);
    
    COMMENT ON TABLE refresh_tokens IS 'JWT refresh token storage';
    COMMENT ON COLUMN refresh_tokens.hashed_token IS 'Hashed refresh token for security';
    COMMENT ON COLUMN refresh_tokens.device_fingerprint IS 'Browser/device identifier';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
}
