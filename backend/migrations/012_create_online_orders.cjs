// ========================================================
// MIGRATION 012: ONLINE_ORDERS TABLE
// External customer orders tracking
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('online_orders', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Customer Information
    table.string('customer_email', 255).notNullable();
    table.string('customer_name', 100);

    // Product Reference
    table
      .uuid('batch_id')
      .references('id')
      .inTable('batches')
      .onDelete('SET NULL');

    // Quantity
    table.decimal('quantity', 12, 3).notNullable();
    table
      .enum('unit', ['kg', 'g', 'liter', 'unit', 'pack', 'bar'])
      .notNullable();

    // Pricing
    table.decimal('total_amount', 12, 2).notNullable();

    // Order Status
    table
      .enum('status', [
        'PENDING',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ])
      .notNullable()
      .defaultTo('PENDING');

    // Timing
    table.timestamp('order_date').notNullable().defaultTo(knex.fn.now());
    table.timestamp('processed_date');

    // Notes
    table.text('notes');

    // Soft Delete
    table.timestamp('deleted_at').nullable().index();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('customer_email', 'idx_online_orders_customer');
    table.index('status', 'idx_online_orders_status');
    table.index('order_date', 'idx_online_orders_date');
    table.index(['customer_email', 'order_date'], 'idx_online_orders_customer_date');
    table.index(['status', 'order_date'], 'idx_online_orders_status_date');
  });

  // Add constraints
  await knex.raw(`
    ALTER TABLE online_orders
    ADD CONSTRAINT chk_online_orders_quantity_positive
    CHECK (quantity > 0);
    
    ALTER TABLE online_orders
    ADD CONSTRAINT chk_online_orders_amount_positive
    CHECK (total_amount >= 0);
    
    ALTER TABLE online_orders
    ADD CONSTRAINT chk_online_orders_email_format
    CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
    
    ALTER TABLE online_orders
    ADD CONSTRAINT chk_online_orders_processed_date
    CHECK (processed_date IS NULL OR processed_date >= order_date);
    
    -- Partial index for active orders
    CREATE INDEX idx_online_orders_active
    ON online_orders (id, status, order_date)
    WHERE status IN ('PENDING', 'PROCESSING', 'SHIPPED') AND deleted_at IS NULL;
    
    COMMENT ON TABLE online_orders IS 'External customer orders';
    COMMENT ON COLUMN online_orders.processed_date IS 'When order was processed by warehouse';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('online_orders');
}
