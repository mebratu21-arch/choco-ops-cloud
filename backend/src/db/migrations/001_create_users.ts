import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('full_name', 255).notNullable();
    table.enum('role', [
      'ADMIN',
      'MANAGER',
      'PRODUCTION',
      'WAREHOUSE',
      'QC',
      'MECHANIC',
      'CONTROLLER',
      'SALES_REPRESENTATIVE'
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
