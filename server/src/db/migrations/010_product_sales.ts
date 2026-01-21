/**
 * ============================================
 * FILE: 010_product_sales.ts
 * ============================================
 * Purpose: Sales transaction tracking with Stripe
 * Revenue and customer management
 * ============================================
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE payment_status AS ENUM (
      'pending', 'completed', 'failed', 'refunded'
    );
  `);

  await knex.schema.createTable('product_sales', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique sale record ID');
    
    table.uuid('stock_id').notNullable()
      .references('id').inTable('warehouse_stock').onDelete('RESTRICT')
      .comment('Stock item sold');
    
    table.string('stripe_payment_id', 255)
      .comment('Stripe payment intent ID (e.g., pi_xxxxx)');
    
    table.string('customer_name', 255).notNullable()
      .comment('Customer full name');
    
    table.string('customer_email', 255).notNullable()
      .comment('Customer email address');
    
    table.decimal('quantity', 10, 2).notNullable()
      .comment('Quantity sold');
    
    table.decimal('unit_price', 10, 2).notNullable()
      .comment('Price per unit');
    
    table.decimal('total_amount', 10, 2).notNullable()
      .comment('Total sale amount (quantity × unit_price)');
    
    table.specificType('payment_status', 'payment_status').notNullable().defaultTo('pending')
      .comment('Stripe payment status');
    
    table.timestamp('sold_at').defaultTo(knex.fn.now())
      .comment('Sale timestamp');
    
    table.timestamps(true, true);
  });

  await knex.schema.raw(`
    CREATE INDEX idx_product_sales_stock_id ON product_sales(stock_id);
    CREATE INDEX idx_product_sales_payment_status ON product_sales(payment_status);
    CREATE INDEX idx_product_sales_stripe_payment_id ON product_sales(stripe_payment_id);
    CREATE INDEX idx_product_sales_sold_at ON product_sales(sold_at DESC);
    CREATE INDEX idx_product_sales_revenue ON product_sales(total_amount, payment_status)
      WHERE payment_status = 'completed';
    
    COMMENT ON TABLE product_sales IS 'Sales transactions with Stripe payment integration';
    COMMENT ON INDEX idx_product_sales_revenue IS 'Fast revenue reporting (completed sales only)';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('product_sales');
  await knex.raw('DROP TYPE IF EXISTS payment_status CASCADE');
}
