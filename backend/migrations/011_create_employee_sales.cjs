// ========================================================
// MIGRATION 011: EMPLOYEE_SALES TABLE
// Internal employee purchases with discounts
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('employee_sales', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Personnel
    table
      .uuid('seller_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL'); // Warehouse person
    table
      .uuid('buyer_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL'); // Employee buyer

    // Product Reference
    table
      .uuid('batch_id')
      .references('id')
      .inTable('batches')
      .onDelete('SET NULL');

    // Quantity
    table.decimal('quantity_sold', 12, 3).notNullable();
    table
      .enum('unit', ['kg', 'g', 'liter', 'unit', 'pack', 'bar'])
      .notNullable();

    // Pricing
    table.decimal('original_price', 12, 2).notNullable();
    table.decimal('discount_percentage', 5, 2).notNullable().defaultTo(0);
    table.decimal('final_amount', 12, 2).notNullable();

    // Payment
    table
      .enum('payment_method', [
        'CASH',
        'CREDIT_CARD',
        'BANK_TRANSFER',
        'EMPLOYEE_DEDUCTION',
      ])
      .notNullable();
    table
      .enum('status', ['PENDING', 'PAID', 'CANCELLED'])
      .notNullable()
      .defaultTo('PENDING');

    // Timing
    table.timestamp('sale_date').notNullable().defaultTo(knex.fn.now());

    // Notes
    table.text('notes');

    // Soft Delete
    table.timestamp('deleted_at').nullable().index();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('seller_id', 'idx_employee_sales_seller');
    table.index('buyer_id', 'idx_employee_sales_buyer');
    table.index('status', 'idx_employee_sales_status');
    table.index('sale_date', 'idx_employee_sales_date');
    table.index(['buyer_id', 'sale_date'], 'idx_employee_sales_buyer_date');
  });

  // Add constraints
  await knex.raw(`
    ALTER TABLE employee_sales
    ADD CONSTRAINT chk_employee_sales_quantity_positive
    CHECK (quantity_sold > 0);
    
    ALTER TABLE employee_sales
    ADD CONSTRAINT chk_employee_sales_price_positive
    CHECK (original_price >= 0 AND final_amount >= 0);
    
    ALTER TABLE employee_sales
    ADD CONSTRAINT chk_employee_sales_discount_range
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
    
    ALTER TABLE employee_sales
    ADD CONSTRAINT chk_employee_sales_final_amount
    CHECK (final_amount <= original_price);
    
    -- Partial index for pending sales
    CREATE INDEX idx_employee_sales_pending
    ON employee_sales (id, buyer_id, final_amount)
    WHERE status = 'PENDING' AND deleted_at IS NULL;
    
    COMMENT ON TABLE employee_sales IS 'Internal employee purchases';
    COMMENT ON COLUMN employee_sales.discount_percentage IS 'Employee discount (0-100%)';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('employee_sales');
}
