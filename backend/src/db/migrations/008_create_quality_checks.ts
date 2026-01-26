import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('quality_checks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('batch_id').notNullable().references('id').inTable('batches').onDelete('CASCADE');
    table.uuid('checked_by').notNullable().references('id').inTable('users');
    table.enum('final_status', ['APPROVED', 'REJECTED', 'QUARANTINE', 'PENDING']).notNullable();
    table.integer('defect_count').defaultTo(0);
    table.text('notes');
    table.timestamp('checked_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('quality_checks');
}
