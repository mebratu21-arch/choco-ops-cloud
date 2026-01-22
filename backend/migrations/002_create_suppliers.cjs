// ========================================================
// MIGRATION 002: SUPPLIERS TABLE
// Vendor management and reliability tracking
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('suppliers', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Supplier Information
    table.string('name', 255).notNullable();
    table.string('contact_email', 255);
    table.string('contact_phone', 50);

    // Performance Metrics
    table
      .enum('reliability_rating', ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'])
      .defaultTo('GOOD');
    table.integer('total_deliveries').notNullable().defaultTo(0);
    table.integer('on_time_deliveries').notNullable().defaultTo(0);

    // Status
    table.boolean('is_active').notNullable().defaultTo(true);

    // Audit Trail
    table
      .uuid('created_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    // Soft Delete
    table.timestamp('deleted_at').nullable().index();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('name', 'idx_suppliers_name');
    table.index('reliability_rating', 'idx_suppliers_rating');
    table.index(['is_active', 'reliability_rating'], 'idx_suppliers_active_rating');
  });

  // Add constraints
  await knex.raw(`
    ALTER TABLE suppliers
    ADD CONSTRAINT chk_suppliers_deliveries
    CHECK (on_time_deliveries <= total_deliveries);
    
    COMMENT ON TABLE suppliers IS 'Supplier vendor management';
    COMMENT ON COLUMN suppliers.reliability_rating IS 'Calculated based on delivery performance';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('suppliers');
}
