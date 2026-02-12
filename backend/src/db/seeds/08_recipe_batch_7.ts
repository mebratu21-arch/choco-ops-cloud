
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 7)
  const recipesData = [
    {
      name: "Sweet Tortilla (Chocolate & Brazil Nuts)",
      category: "bars", // Treat/Pastry
      description: "Sweet tortilla/crepes filled with Nutella, bananas, Brazil nuts, and crunchy cornflakes, served with chocolate and coconut dipping sauces.",
      yield_quantity: 5,
      yield_unit: "tortillas",
      instructions: "1. Spread crepe with Nutella, add bananas, nuts, cornflakes, coconut. Roll up. 2. Chocolate Sauce: Boil milk, melt chocolate into it. 3. Coconut Sauce: Mix cornstarch with splash of coconut milk. Boil rest with sugar. Thicken with cornstarch mix, add extract. 4. Cut rolls and serve with dips.",
      ingredients: [
        // Base
        { name: "Crepes", quantity: 5, unit: "units" }, // Pre-made or use previous batter recipe? Treating as raw item for now.
        { name: "Chocolate Nut Spread", quantity: 1, unit: "cup" }, // Nutella
        { name: "Bananas", quantity: 5, unit: "units" },
        { name: "Brazil Nuts", quantity: 2, unit: "cups" }, // Chopped
        { name: "Cornflakes", quantity: 3, unit: "cups" },
        { name: "Toasted Coconut", quantity: 2, unit: "cups" },
        // Chocolate Sauce
        { name: "Milk Chocolate", quantity: 1.33, unit: "cups" },
        { name: "Milk", quantity: 0.66, unit: "cup" },
        // Coconut Sauce
        { name: "Coconut Milk", quantity: 1, unit: "can" }, // "Box" usually ~400ml
        { name: "Cornstarch", quantity: 1, unit: "tbsp" },
        { name: "Sugar", quantity: 0.33, unit: "cup" },
        { name: "Coconut Extract", quantity: 1, unit: "tbsp" }
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
          quantity: 20,
          unit: ing.unit,
          supplier_id: supplierId,
          cost_per_unit: 12.00 // Brazil nuts are expensive
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

  console.log('Batch 7 (Sweet Tortillas) Seeded Successfully!');
}
