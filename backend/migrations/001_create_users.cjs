// ========================================================
// MIGRATION 001: USERS TABLE
// Core authentication and authorization
// ========================================================

exports.up = async function(knex) {
  await knex.schema.createTable('users', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Authentication
    table.string('email', 255).unique().notNullable().index();
    table.string('password_hash', 255).notNullable();

    // Profile
    table.string('name', 100).notNullable();

    // Authorization
    table
      .enum('role', [
        'WAREHOUSE',
        'PRODUCTION',
        'QC',
        'MANAGER',
        'ADMIN',
        'MECHANIC',
        'CONTROLLER',
      ])
      .notNullable()
      .defaultTo('PRODUCTION');

    // Status
    table.boolean('is_active').notNullable().defaultTo(true);

    // Soft Delete
    table.timestamp('deleted_at').nullable().index();

    // Timestamps
    table.timestamps(true, true);

    // Indexes for performance
    table.index(['role', 'is_active'], 'idx_users_role_active');
    table.index('created_at', 'idx_users_created');
  });

  // Add comment to table
  await knex.raw(`
    COMMENT ON TABLE users IS 'User authentication and authorization';
    COMMENT ON COLUMN users.role IS 'User role for access control';
    COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp';
  `);
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('users');
};
