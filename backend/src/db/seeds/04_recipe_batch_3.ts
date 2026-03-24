
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 3)
  const recipesData = [
    {
      name: "Pancakes with Milk Chocolate Maple",
      category: "bars", // Mapping baked goods/pancakes to 'bars' to fit existing enum
      description: "Fluffy pancakes served with a rich milk chocolate maple sauce and fresh berry salad.",
      yield_quantity: 4, // Estimate
      yield_unit: "servings",
      instructions: "1. Warm milk, dissolve yeast. 2. Whisk flour, salt, yolks into yeast mix. Rise 1 hr. 3. Beat whites, fold in. 4. Fry pancakes 1 min per side. 5. Heat maple syrup, whisk in chocolate and cream for sauce.",
      ingredients: [
        { name: "Milk", quantity: 200, unit: "ml" }, // "glass of milk 1" ~ 200ml
        { name: "Dry Yeast", quantity: 1, unit: "tsp" },
        { name: "Flour", quantity: 1, unit: "cup" },
        { name: "Salt", quantity: 1, unit: "tsp" },
        { name: "Eggs", quantity: 2, unit: "units" }, // Separated
        { name: "Maple Syrup", quantity: 1, unit: "cup" }, // High quality
        { name: "Milk Chocolate", quantity: 40, unit: "g" },
        { name: "Heavy Cream", quantity: 1, unit: "tsp" },
        { name: "Mixed Berries", quantity: 1, unit: "cup" }
      ]
    }
  ];

  // 2. Insert Missing Ingredients
  const supplier = await knex('suppliers').first();
  const supplierId = supplier?.id;

  const inventoryMap: Record<string, string> = {};

  for (const recipe of recipesData) {
    for (const ing of recipe.ingredients) {
      const existing = await knex('inventory_items').where('name', ing.name).first();
      if (existing) {
        inventoryMap[ing.name] = existing.id;
      } else {
        const [newItem] = await knex('inventory_items').insert({
          name: ing.name,
          code: `ING-${Math.floor(Math.random() * 10000)}`,
          category: 'ingredient',
          quantity: 50,
          unit: ing.unit,
          supplier_id: supplierId,
          cost_per_unit: 3.50
        }).returning('id');
        inventoryMap[ing.name] = newItem.id;
      }
    }
  }

  // 3. Insert Recipe
  for (const recipe of recipesData) {
    const [rec] = await knex('recipes').insert({
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      yield_quantity: recipe.yield_quantity,
      yield_unit: recipe.yield_unit,
      instructions: recipe.instructions,
      difficulty_level: 'medium',
      is_active: true
    }).returning('id');

    const recipeIngs = recipe.ingredients.map(ing => ({
      recipe_id: rec.id,
      inventory_item_id: inventoryMap[ing.name],
      quantity: ing.quantity,
      unit: ing.unit
    }));

    await knex('recipe_ingredients').insert(recipeIngs);
  }

  console.log('Batch 3 (Pancakes) Seeded Successfully!');
}
