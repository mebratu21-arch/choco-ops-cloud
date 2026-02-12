import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // QC Checks Table
  await knex.schema.createTable('qc_checks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('batch_id').references('id').inTable('production_batches').onDelete('CASCADE');
    table.uuid('inspector_id').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('inspection_date').defaultTo(knex.fn.now());
    table.integer('appearance_score'); // 1-5
    table.integer('texture_score');    // 1-5
    table.integer('taste_score');      // 1-5
    table.decimal('temperature', 5, 2);
    table.decimal('humidity', 5, 2);
    table.integer('defect_count').defaultTo(0);
    table.specificType('defect_types', 'text[]');
    table.enum('result', ['approved', 'rejected', 'quarantine']).notNullable();
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['batch_id']);
    table.index(['result']);
    table.index(['created_at']);
  });

  // QC Defects Table
  await knex.schema.createTable('qc_defects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('qc_check_id').references('id').inTable('qc_checks').onDelete('CASCADE');
    table.string('defect_type', 100).notNullable();
    table.enum('severity', ['minor', 'major', 'critical']).notNullable();
    table.integer('quantity').notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('qc_defects');
  await knex.schema.dropTableIfExists('qc_checks');
}
