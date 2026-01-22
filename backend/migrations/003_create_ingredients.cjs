// ========================================================
// MIGRATION 003: INGREDIENTS TABLE
// Raw materials inventory with location tracking
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('ingredients', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Ingredient Information
    table.string('name', 255).unique().notNullable();
    table.string('code', 100).unique().nullable();

    // Stock Management
    table
      .decimal('current_stock', 12, 3)
      .notNullable()
      .defaultTo(0);
    table.decimal('minimum_stock', 12, 3).notNullable().defaultTo(0);
    table.decimal('optimal_stock', 12, 3).notNullable().defaultTo(0);
    table.enum('unit', ['kg', 'g', 'liter', 'ml', 'unit', 'pack']).notNullable();

    // Physical Location
    table.string('aisle', 10);
    table.string('shelf', 10);
    table.string('bin', 10);

    // Financial
    table.decimal('cost_per_unit', 12, 3).notNullable().defaultTo(0);

    // Quality Control
    table.date('expiry_date');

    // Relationships
    table
      .uuid('supplier_id')
      .references('id')
      .inTable('suppliers')
      .onDelete('SET NULL');
    table
      .uuid('created_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    // Status
    table.boolean('is_active').notNullable().defaultTo(true);

    // Soft Delete
    table.timestamp('deleted_at').nullable().index();

    // Timestamps
    table.timestamps(true, true);

    // Composite Indexes
    table.index(['aisle', 'shelf', 'bin'], 'idx_ingredient_location');
    table.index('current_stock', 'idx_ingredient_stock');
    table.index('expiry_date', 'idx_ingredient_expiry');
    table.index('supplier_id', 'idx_ingredient_supplier');
    table.index('name', 'idx_ingredient_name');
  });

  // Add constraints and computed indexes
  await knex.raw(`
    ALTER TABLE ingredients
    ADD CONSTRAINT chk_ingredients_stock_positive
    CHECK (current_stock >= 0);
    
    ALTER TABLE ingredients
    ADD CONSTRAINT chk_ingredients_stock_levels
    CHECK (optimal_stock >= minimum_stock);
    
    ALTER TABLE ingredients
    ADD CONSTRAINT chk_ingredients_cost_positive
    CHECK (cost_per_unit >= 0);
    
    -- Partial index for low stock alerts
    CREATE INDEX idx_ingredient_low_stock
    ON ingredients (id, name, current_stock, minimum_stock)
    WHERE current_stock < minimum_stock AND deleted_at IS NULL;
    
    COMMENT ON TABLE ingredients IS 'Raw materials inventory with location tracking';
    COMMENT ON COLUMN ingredients.code IS 'Internal SKU or barcode';
    COMMENT ON COLUMN ingredients.current_stock IS 'Current available quantity';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('ingredients');
}
