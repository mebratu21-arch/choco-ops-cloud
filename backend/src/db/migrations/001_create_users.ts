import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('full_name', 255).notNullable();
    table.enum('role', [
      'admin',
      'manager',
      'production_worker',
      'warehouse_worker',
      'quality_controller',
      'mechanic'
    ]).notNullable();
    table.string('language_preference', 10).defaultTo('en');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index(['email']);
    table.index(['role']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
