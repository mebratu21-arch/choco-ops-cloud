import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create Equipment table
  await knex.schema.createTable('equipment', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('equipment_id').unique().notNullable(); // Human readable ID
    table.string('name').notNullable();
    table.string('type').notNullable();
    table.enum('status', ['OPERATIONAL', 'MAINTENANCE', 'BROKEN', 'RETIRED']).defaultTo('OPERATIONAL');
    table.date('purchase_date');
    table.date('last_maintenance');
    table.date('next_maintenance');
    table.timestamps(true, true);
  });

  // Create Maintenance Logs table
  await knex.schema.createTable('maintenance_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('equipment_id').references('id').inTable('equipment').onDelete('CASCADE').notNullable();
    table.string('description').notNullable();
    table.uuid('performed_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('scheduled_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at');
    table.text('notes');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('maintenance_logs');
  await knex.schema.dropTable('equipment');
}
