
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 13)
  const recipesData = [
    {
      name: "Choco-Banana Cupcakes with Pineapple Glaze",
      category: "bars", // Cupcakes/Cakes
      description: "Moist chocolate-banana cupcakes topped with a tropical pineapple-rum buttercream and toasted coconut.",
      yield_quantity: 18, // "pan and a half" of 12-socket mold
      yield_unit: "cupcakes",
      instructions: "1. Preheat 180C. 2. Cream butter and sugar. Add eggs, vanilla, crushed bananas. 3. Alternate adding sifted dry ingredients and sour cream (labeled 'saturation'). Fold in chocolate chunks. 4. Bake 30 mins. 5. Glaze: Beat butter, pineapple juice, rum. Whisk in powdered sugar. Frost and sprinkle with coconut.",
      ingredients: [
        // Cakes
        { name: "Butter", quantity: 300, unit: "g" },
        { name: "Sugar", quantity: 2, unit: "cups" },
        { name: "Eggs", quantity: 6, unit: "units" },
        { name: "Vanilla Extract", quantity: 1, unit: "tbsp" },
        { name: "Ripe Bananas", quantity: 3, unit: "units" }, // Crushed
        { name: "Flour", quantity: 3, unit: "cups" },
        { name: "Baking Powder", quantity: 1, unit: "tsp" },
        { name: "Baking Soda", quantity: 1, unit: "tsp" },
        { name: "Salt", quantity: 1, unit: "tsp" },
        { name: "Sour Cream", quantity: 1, unit: "cup" }, // inferred from "cup saturated 1"
        { name: "Dark Chocolate Chunks", quantity: 150, unit: "g" },
        // Glaze
        { name: "Unsalted Butter", quantity: 200, unit: "g" },
        { name: "Pineapple Juice", quantity: 1, unit: "tbsp" },
        { name: "Rum", quantity: 1, unit: "tbsp" },
        { name: "Powdered Sugar", quantity: 3, unit: "cups" },
        { name: "Ground Coconut", quantity: 200, unit: "g" }
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
          quantity: 40,
          unit: ing.unit,
          supplier_id: supplierId,
          cost_per_unit: 3.50 // Standard baking cost
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

  console.log('Batch 13 (Banana Cupcakes) Seeded Successfully!');
}
