import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Machines Table
  await knex.schema.createTable('machines', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('machine_code', 100).notNullable().unique();
    table.string('type', 100).notNullable(); // mixer, cooler, packaging_machine, grinder
    table.string('location', 255);
    table.enum('status', ['operational', 'maintenance', 'broken', 'sos']).defaultTo('operational');
    table.date('last_maintenance_date');
    table.date('next_maintenance_date');
    table.text('notes');
    table.timestamps(true, true);
  });

  // SOS Alerts Table
  await knex.schema.createTable('sos_alerts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('machine_id').references('id').inTable('machines').onDelete('SET NULL');
    table.uuid('reported_by').references('id').inTable('users').onDelete('SET NULL');
    table.enum('priority', ['low', 'medium', 'high', 'critical']).notNullable();
    table.enum('status', ['open', 'in_progress', 'resolved', 'cancelled']).defaultTo('open');
    table.text('problem_description').notNullable();
    table.text('resolution_notes');
    table.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('reported_at').defaultTo(knex.fn.now());
    table.timestamp('resolved_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['machine_id']);
    table.index(['status']);
  });

  // Maintenance Logs Table
  await knex.schema.createTable('maintenance_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('machine_id').references('id').inTable('machines').onDelete('CASCADE');
    table.uuid('mechanic_id').references('id').inTable('users').onDelete('SET NULL');
    table.enum('maintenance_type', ['preventive', 'corrective', 'emergency']).notNullable();
    table.text('description').notNullable();
    table.text('parts_used');
    table.integer('duration_minutes');
    table.decimal('cost', 12, 2);
    table.timestamp('performed_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Machine Manuals Table
  await knex.schema.createTable('machine_manuals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('machine_id').references('id').inTable('machines').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('content');
    table.string('file_url', 500);
    table.enum('manual_type', ['operation', 'troubleshooting', 'maintenance']).notNullable();
    table.string('language', 10).defaultTo('en');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('machine_manuals');
  await knex.schema.dropTableIfExists('maintenance_logs');
  await knex.schema.dropTableIfExists('sos_alerts');
  await knex.schema.dropTableIfExists('machines');
}
