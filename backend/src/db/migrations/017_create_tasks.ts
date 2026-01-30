import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.uuid('assigned_to').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.uuid('assigned_by').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.string('status').defaultTo('PENDING'); // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    table.string('priority').defaultTo('MEDIUM'); // LOW, MEDIUM, HIGH, URGENT
    table.timestamp('due_date');
    table.timestamp('completed_at');
    table.text('completion_notes');
    table.timestamps(true, true);

    table.index(['assigned_to']);
    table.index(['assigned_by']);
    table.index(['status']);
    table.index(['priority']);
    table.index(['due_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tasks');
}
