import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('announcements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.string('priority').defaultTo('NORMAL'); // LOW, NORMAL, HIGH, URGENT
    table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.jsonb('target_roles'); // Array of roles: ["PRODUCTION", "WAREHOUSE", "QC"]
    table.boolean('is_active').defaultTo(true);
    table.timestamp('expires_at');
    table.timestamps(true, true);

    table.index(['is_active']);
    table.index(['priority']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('announcements');
}
