import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('recipe_ingredients', (table) => {
    // Make inventory_item_id nullable to support manual entries
    table.uuid('inventory_item_id').nullable().alter();
    
    // Add custom_name for manual entries
    table.string('custom_name', 255).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('recipe_ingredients', (table) => {
    table.dropColumn('custom_name');
    table.uuid('inventory_item_id').notNullable().alter();
  });
}
