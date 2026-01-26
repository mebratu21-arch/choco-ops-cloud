import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('suppliers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('contact_person', 255);
    table.string('email', 255);
    table.string('phone', 50);
    table.text('address');
    table.string('city', 100);
    table.string('country', 100);
    table.string('postal_code', 20);
    table.string('website', 255);
    table.text('notes');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('deleted_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('suppliers');
}
