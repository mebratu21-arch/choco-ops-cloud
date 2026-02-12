import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Inventory Items
  await knex.schema.createTable('inventory_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('code', 100).notNullable().unique();
    table.string('category', 100).notNullable(); // raw_material, packaging, ingredient
    table.decimal('quantity', 12, 2).defaultTo(0);
    table.string('unit', 50).notNullable(); // kg, liters, pieces
    table.string('location', 255); // e.g., "Aisle A, Shelf 3, Box 12"
    table.uuid('supplier_id').references('id').inTable('suppliers').onDelete('SET NULL');
    table.decimal('reorder_level', 12, 2).defaultTo(10);
    table.date('expiry_date');
    table.decimal('cost_per_unit', 12, 2);
    table.text('notes');
    table.timestamps(true, true);

    table.index(['code']);
    table.index(['category']);
  });

  // Inventory Movements
  await knex.schema.createTable('inventory_movements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('item_id').references('id').inTable('inventory_items').onDelete('CASCADE');
    table.enum('movement_type', ['in', 'out', 'adjustment', 'expired']).notNullable();
    table.decimal('quantity', 12, 2).notNullable();
    table.string('reference_type', 50); // batch, order, adjustment
    table.uuid('reference_id');
    table.uuid('performed_by').references('id').inTable('users').onDelete('SET NULL');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['item_id']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('inventory_movements');
  await knex.schema.dropTableIfExists('inventory_items');
}
