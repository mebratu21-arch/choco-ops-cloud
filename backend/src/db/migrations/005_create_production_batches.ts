import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Production Batches Table
  await knex.schema.createTable('production_batches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('batch_number', 50).notNullable().unique();
    table.uuid('recipe_id').references('id').inTable('recipes').onDelete('RESTRICT');
    table.enum('status', [
      'pending', 
      'mixing', 
      'cooking', 
      'cooling', 
      'packaging', 
      'completed', 
      'failed'
    ]).defaultTo('pending');
    table.decimal('target_quantity', 12, 2);
    table.decimal('actual_quantity', 12, 2);
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.uuid('started_by').references('id').inTable('users').onDelete('SET NULL');
    table.text('notes');
    table.timestamps(true, true);

    table.index(['batch_number']);
    table.index(['status']);
    table.index(['created_at']);
  });

  // Batch Materials Table
  await knex.schema.createTable('batch_materials', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('batch_id').references('id').inTable('production_batches').onDelete('CASCADE');
    table.uuid('inventory_item_id').references('id').inTable('inventory_items').onDelete('RESTRICT');
    table.decimal('quantity_used', 12, 2).notNullable();
    table.string('unit', 50).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('batch_materials');
  await knex.schema.dropTableIfExists('production_batches');
}
