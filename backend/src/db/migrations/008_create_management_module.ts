import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Announcements Table
  await knex.schema.createTable('announcements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.enum('priority', ['low', 'normal', 'high', 'urgent']).defaultTo('normal');
    table.specificType('target_roles', 'text[]'); // Array of UserRole strings
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('expires_at');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['is_active']);
  });

  // Tasks Table
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description');
    table.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('assigned_by').references('id').inTable('users').onDelete('SET NULL');
    table.enum('status', ['pending', 'in_progress', 'completed', 'cancelled']).defaultTo('pending');
    table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium');
    table.timestamp('due_date');
    table.timestamp('completed_at');
    table.timestamps(true, true);

    table.index(['assigned_to']);
    table.index(['status']);
  });

  // Supplier Orders Table
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('order_number', 50).notNullable().unique();
    table.uuid('supplier_id').references('id').inTable('suppliers').onDelete('RESTRICT');
    table.enum('status', ['pending', 'approved', 'ordered', 'received', 'cancelled']).defaultTo('pending');
    table.decimal('total_amount', 12, 2).defaultTo(0);
    table.uuid('ordered_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('ordered_at');
    table.date('expected_delivery_date');
    table.timestamp('received_at');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['status']);
  });

  // Order Items Table
  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('inventory_item_id').references('id').inTable('inventory_items').onDelete('RESTRICT');
    table.decimal('quantity', 12, 2).notNullable();
    table.string('unit', 50).notNullable();
    table.decimal('unit_price', 12, 2);
    table.decimal('total_price', 12, 2);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('announcements');
}
