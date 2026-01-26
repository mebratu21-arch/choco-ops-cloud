import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('name', 100).notNullable();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['WAREHOUSE', 'PRODUCTION', 'MECHANIC', 'CONTROLLER', 'MANAGER', 'ADMIN']).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.string('preferred_language', 10).defaultTo('en');
    table.timestamp('deleted_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
