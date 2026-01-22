// ========================================================
// MIGRATION 007: BATCH_INGREDIENTS TABLE
// Actual ingredients used in production batches
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('batch_ingredients', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign Keys
    table
      .uuid('batch_id')
      .notNullable()
      .references('id')
      .inTable('batches')
      .onDelete('CASCADE');
    table
      .uuid('ingredient_id')
      .notNullable()
      .references('id')
      .inTable('ingredients')
      .onDelete('RESTRICT'); // Prevent deletion of ingredients used in batches

    // Usage Information
    table.decimal('quantity_used', 12, 3).notNullable();
    table.enum('unit', ['kg', 'g', 'liter', 'ml', 'unit', 'pack']).notNullable();

    // Traceability
    table.string('lot_number', 100);
    table.decimal('cost_at_time', 12, 3); // Snapshot of cost at time of use

    // Soft Delete
    table.timestamp('deleted_at').nullable().index();

    // Timestamps
    table.timestamps(true, true);

    // Unique Constraint
    table.unique(['batch_id', 'ingredient_id'], {
      indexName: 'uk_batch_ingredient',
    });

    // Indexes
    table.index('batch_id', 'idx_batch_ingredient_batch');
    table.index('ingredient_id', 'idx_batch_ingredient_ingredient');
    table.index('lot_number', 'idx_batch_ingredient_lot');
  });

  // Add constraints
  await knex.raw(`
    ALTER TABLE batch_ingredients
    ADD CONSTRAINT chk_batch_ingredients_quantity_positive
    CHECK (quantity_used > 0);
    
    ALTER TABLE batch_ingredients
    ADD CONSTRAINT chk_batch_ingredients_cost_positive
    CHECK (cost_at_time IS NULL OR cost_at_time >= 0);
    
    COMMENT ON TABLE batch_ingredients IS 'Actual ingredients consumed in production';
    COMMENT ON COLUMN batch_ingredients.lot_number IS 'Lot/batch number for traceability';
    COMMENT ON COLUMN batch_ingredients.cost_at_time IS 'Cost snapshot for accurate batch costing';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('batch_ingredients');
}
