import { db } from './src/config/database.js';

async function runMaintenance() {
  try {
    console.log('Creating equipment table...');

    await db.schema.createTable('equipment', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('type').notNullable();
      table.string('location');
      table.string('status').defaultTo('operational');
      table.text('description');
      table.timestamp('last_maintenance');
      table.timestamp('next_maintenance');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());

      table.index('status');
      table.index('type');
    });

    console.log('Creating maintenance_logs table...');

    await db.schema.createTable('maintenance_logs', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.uuid('equipment_id').notNullable();
      table.uuid('mechanic_id').notNullable();
      table.string('type').notNullable();
      table.text('description').notNullable();
      table.string('status').defaultTo('pending');
      table.string('priority').defaultTo('medium');
      table.timestamp('scheduled_date');
      table.timestamp('completed_date');
      table.text('notes');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());

      table.foreign('equipment_id').references('id').inTable('equipment').onDelete('CASCADE');
      table.foreign('mechanic_id').references('id').inTable('users').onDelete('RESTRICT');

      table.index('equipment_id');
      table.index('mechanic_id');
      table.index('status');
    });

    console.log('✅ Maintenance tables created successfully!');

    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await db.destroy();
    process.exit(1);
  }
}

runMaintenance();
