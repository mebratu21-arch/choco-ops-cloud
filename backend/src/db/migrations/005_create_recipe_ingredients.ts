import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('recipe_ingredients', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('recipe_id').notNullable().references('id').inTable('recipes').onDelete('CASCADE');
    table.uuid('ingredient_id').notNullable().references('id').inTable('ingredients').onDelete('CASCADE');
    table.decimal('quantity_required', 12, 2).notNullable();
    table.unique(['recipe_id', 'ingredient_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('recipe_ingredients');
}
