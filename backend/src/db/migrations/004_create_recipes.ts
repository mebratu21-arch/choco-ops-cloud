import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Recipes Table
  await knex.schema.createTable('recipes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.enum('category', ['bars', 'truffles', 'bonbons', 'gift_boxes', 'pralines']).notNullable();
    table.decimal('yield_quantity', 12, 2).notNullable();
    table.string('yield_unit', 50).notNullable();
    table.integer('duration_minutes');
    table.text('instructions'); // step-by-step instructions
    table.enum('difficulty_level', ['easy', 'medium', 'hard']).defaultTo('medium');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index(['name']);
  });

  // Recipe Ingredients Table
  await knex.schema.createTable('recipe_ingredients', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
    table.uuid('inventory_item_id').references('id').inTable('inventory_items').onDelete('RESTRICT');
    table.decimal('quantity', 12, 2).notNullable();
    table.string('unit', 50).notNullable();
    table.text('notes');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('recipe_ingredients');
  await knex.schema.dropTableIfExists('recipes');
}
