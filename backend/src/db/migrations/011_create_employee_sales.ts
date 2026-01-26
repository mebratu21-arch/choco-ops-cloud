import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('employee_sales', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('seller_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.uuid('buyer_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.uuid('batch_id').notNullable().references('id').inTable('batches').onDelete('RESTRICT');
    table.decimal('quantity_sold', 12, 2).notNullable();
    table.string('unit', 50).notNullable();
    table.decimal('original_price', 12, 2).notNullable();
    table.decimal('discount_percentage', 5, 2).defaultTo(0);
    table.decimal('final_amount', 12, 2).notNullable();
    table.enum('payment_method', ['CASH', 'CARD', 'TRANSFER']).defaultTo('CASH');
    table.enum('status', ['PENDING', 'PAID', 'REFUNDED']).defaultTo('PAID');
    table.text('notes');
    table.timestamp('deleted_at');
    table.timestamps(true, true);
    
    table.index(['seller_id']);
    table.index(['buyer_id']);
    table.index(['batch_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('employee_sales');
}
