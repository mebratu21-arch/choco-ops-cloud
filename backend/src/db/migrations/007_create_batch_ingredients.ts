import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('batch_ingredients', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('batch_id').notNullable().references('id').inTable('batches').onDelete('CASCADE');
    table.uuid('ingredient_id').notNullable().references('id').inTable('ingredients').onDelete('CASCADE');
    table.decimal('quantity_used', 12, 2).notNullable();
    table.unique(['batch_id', 'ingredient_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('batch_ingredients');
}
