import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('online_orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('customer_email', 255).notNullable();
    table.string('customer_name', 255);
    table.uuid('batch_id').references('id').inTable('batches').onDelete('SET NULL');
    table.decimal('quantity', 12, 2).notNullable();
    table.string('unit', 50).notNullable();
    table.decimal('total_amount', 12, 2).notNullable();
    table.enum('status', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).defaultTo('PENDING');
    table.text('notes');
    table.timestamp('order_date').defaultTo(knex.fn.now());
    table.timestamp('processed_date');
    table.timestamp('deleted_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('online_orders');
}
