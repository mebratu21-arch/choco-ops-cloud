import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('equipment', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('machine_code').notNullable().unique();
    table.string('type').notNullable(); // MIXER, MELTER, COOLER, TEMPERING, MOLD, PACKAGING
    table.string('location').notNullable();
    table.string('status').defaultTo('OPERATIONAL'); // OPERATIONAL, MAINTENANCE, BROKEN, OFFLINE
    table.text('specifications');
    table.date('last_maintenance');
    table.date('next_maintenance');
    table.integer('total_hours').defaultTo(0);
    table.uuid('assigned_mechanic').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);

    table.index(['machine_code']);
    table.index(['status']);
    table.index(['type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('equipment');
}
