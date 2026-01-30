import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sos_alerts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('equipment_id').references('id').inTable('equipment').onDelete('CASCADE');
    table.uuid('reported_by').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL');
    table.string('priority').notNullable(); // LOW, MEDIUM, HIGH, CRITICAL
    table.string('status').defaultTo('OPEN'); // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    table.text('problem_description').notNullable();
    table.text('solution_description');
    table.timestamp('reported_at').defaultTo(knex.fn.now());
    table.timestamp('resolved_at');
    table.integer('response_time_minutes');
    table.text('mechanic_notes');
    table.timestamps(true, true);

    table.index(['status']);
    table.index(['priority']);
    table.index(['equipment_id']);
    table.index(['reported_by']);
    table.index(['assigned_to']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('sos_alerts');
}
