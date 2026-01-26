import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('batches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('recipe_id').notNullable().references('id').inTable('recipes').onDelete('RESTRICT');
    table.decimal('quantity_produced', 12, 2).notNullable();
    table.enum('status', ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).defaultTo('PLANNED');
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.uuid('produced_by').references('id').inTable('users');
    table.timestamp('deleted_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('batches');
}
