// ========================================================
// MIGRATION 005: RECIPE_INGREDIENTS TABLE
// Many-to-many relationship between recipes and ingredients
// ========================================================



exports.up = async function(knex) {
  await knex.schema.createTable('recipe_ingredients', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign Keys
    table
      .uuid('recipe_id')
      .notNullable()
      .references('id')
      .inTable('recipes')
      .onDelete('CASCADE');
    table
      .uuid('ingredient_id')
      .notNullable()
      .references('id')
      .inTable('ingredients')
      .onDelete('CASCADE');

    // Quantity Information
    table.decimal('quantity_per_batch', 12, 3).notNullable();
    table.enum('unit', ['kg', 'g', 'liter', 'ml', 'unit', 'pack']).notNullable();

    // Additional Information
    table.text('notes');

    // Unique Constraint (one ingredient per recipe)
    table.unique(['recipe_id', 'ingredient_id'], {
      indexName: 'uk_recipe_ingredient',
    });

    // Indexes for performance
    table.index('recipe_id', 'idx_recipe_ingredient_recipe');
    table.index('ingredient_id', 'idx_recipe_ingredient_ingredient');
  });

  // Add constraints
  await knex.raw(`
    ALTER TABLE recipe_ingredients
    ADD CONSTRAINT chk_recipe_ingredients_quantity_positive
    CHECK (quantity_per_batch > 0);
    
    COMMENT ON TABLE recipe_ingredients IS 'Recipe ingredient requirements (bill of materials)';
    COMMENT ON COLUMN recipe_ingredients.quantity_per_batch IS 'Amount needed per batch of recipe';
  `);
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('recipe_ingredients');
}
