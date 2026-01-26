import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ingredients', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('sku', 100).notNullable().unique();
    table.decimal('current_stock', 12, 2).notNullable().defaultTo(0);
    table.decimal('minimum_stock', 12, 2).notNullable();
    table.string('unit', 50).notNullable();
    table.date('expiry_date').nullable();
    table.timestamp('deleted_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('ingredients');
}
