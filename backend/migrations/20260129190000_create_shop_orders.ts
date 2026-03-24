import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create shop_orders table
  await knex.schema.createTable('shop_orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('customer_name');
    table.string('customer_email');
    table.string('customer_phone');
    table.string('payment_method').notNullable(); // cash, card, mobile
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('tax', 10, 2).defaultTo(0);
    table.decimal('total', 10, 2).notNullable();
    table.string('status').defaultTo('pending'); // pending, completed, cancelled
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('created_at');
    table.index('status');
  });

  // Create shop_order_items table
  await knex.schema.createTable('shop_order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').notNullable();
    table.uuid('product_id').notNullable();
    table.string('sku', 50).notNullable();
    table.string('name').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('quantity').notNullable();
    table.decimal('subtotal', 10, 2).notNullable();

    table.foreign('order_id').references('id').inTable('shop_orders').onDelete('CASCADE');
    table.foreign('product_id').references('id').inTable('products').onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('shop_order_items');
  await knex.schema.dropTableIfExists('shop_orders');
}
