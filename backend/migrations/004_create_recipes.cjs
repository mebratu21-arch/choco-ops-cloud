// ========================================================
// MIGRATION 004: RECIPES TABLE
// Product formulations and instructions
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('recipes', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Recipe Information
    table.string('name', 255).unique().notNullable();
    table.text('description');

    // Yield Information
    table.decimal('yield_quantity', 12, 3).notNullable();
    table
      .enum('yield_unit', ['kg', 'g', 'liter', 'unit', 'pack', 'bar'])
      .notNullable();

    // Cost Estimation
    table.decimal('estimated_cost_per_batch', 12, 3).defaultTo(0);

    // Instructions (stored as JSONB for flexibility)
    table.jsonb('instructions');

    // Audit Trail
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

    // Indexes
    table.index('name', 'idx_recipes_name');
    table.index('is_active', 'idx_recipes_active');
  });

  // Add GIN index for JSONB instructions (for fast searching)
  await knex.raw(`
    CREATE INDEX idx_recipes_instructions_gin
    ON recipes USING GIN (instructions);
    
    ALTER TABLE recipes
    ADD CONSTRAINT chk_recipes_yield_positive
    CHECK (yield_quantity > 0);
    
    ALTER TABLE recipes
    ADD CONSTRAINT chk_recipes_cost_positive
    CHECK (estimated_cost_per_batch >= 0);
    
    COMMENT ON TABLE recipes IS 'Product recipes and formulations';
    COMMENT ON COLUMN recipes.instructions IS 'Step-by-step instructions in JSON format';
    COMMENT ON COLUMN recipes.estimated_cost_per_batch IS 'Calculated from ingredient costs';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('recipes');
}
