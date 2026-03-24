
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 5)
  const recipesData = [
    {
      name: "Chocolate Chip Cookie with Goodies",
      category: "bars", // Cookies/Bars
      description: "Rich chocolate chip cookies packed with walnuts, dried apricots, candied orange peels, and aromatic spices.",
      yield_quantity: 24, // Estimate based on dough volume
      yield_unit: "cookies",
      instructions: "1. Beat butter and brown sugar until airy. Add eggs and vanilla. 2. Sift flour, salt, soda, cinnamon, nutmeg, cloves. 3. Mix in nuts, apricots, orange peels, chocolate chips. 4. Chill dough 1 hr or freeze. 5. Bake at 180C for 9 mins.",
      ingredients: [
        { name: "Soft Butter", quantity: 200, unit: "g" },
        { name: "Brown Sugar", quantity: 1, unit: "cup" },
        { name: "Eggs", quantity: 2, unit: "units" },
        { name: "Vanilla Extract", quantity: 1, unit: "tsp" },
        { name: "Flour", quantity: 2, unit: "cups" },
        { name: "Salt", quantity: 1, unit: "tsp" },
        { name: "Baking Soda", quantity: 1, unit: "tsp" },
        { name: "Ground Cinnamon", quantity: 1, unit: "tsp" },
        { name: "Ground Nutmeg", quantity: 1, unit: "tsp" },
        { name: "Ground Cloves", quantity: 1, unit: "tsp" },
        { name: "Chopped Walnuts", quantity: 1, unit: "cup" },
        { name: "Dried Apricots", quantity: 1, unit: "cup" },
        { name: "Candied Orange Peels", quantity: 1, unit: "cup" },
        { name: "Milk Chocolate Chips", quantity: 80, unit: "g" },
        { name: "Dark Chocolate Chips", quantity: 80, unit: "g" }
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
          cost_per_unit: 6.00 // Spices and nuts are mid-range
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
      difficulty_level: 'easy', // Standard cookie method
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

  console.log('Batch 5 (Goodies Cookies) Seeded Successfully!');
}
