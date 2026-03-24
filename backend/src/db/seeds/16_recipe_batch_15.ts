
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 15)
  const recipesData = [
    {
      name: "Choco Soufflé with Marshmallow Heart",
      category: "truffles", // Dessert/Souffle
      description: "Decadent dark chocolate soufflé with a molten white chocolate marshmallow ganache center.",
      yield_quantity: 15, // 15 cups
      yield_unit: "soufflés",
      instructions: "1. Ganache: Boil cream and 200g marshmallows. Pour over white chocolate. Stir smooth. Freeze in molds with chopped marshmallows (4hr). 2. Soufflé: Melt dark chocolate, butter, sugar. Whisk in eggs. Mix in sifted dry ingredients (flour, BP, cocoa). 3. Fill cups partially. Insert frozen ganache puck. Bake 200C for 9m.",
      ingredients: [
        // Marshmallow Ganache
        { name: "White Chocolate", quantity: 190, unit: "g" },
        { name: "Marshmallows", quantity: 250, unit: "g" }, // 200g whole + 10 units chopped
        { name: "Heavy Cream", quantity: 1, unit: "cup" },
        // Soufflé Base
        { name: "Dark Chocolate", quantity: 300, unit: "g" }, // 56% solids
        { name: "Butter", quantity: 300, unit: "g" },
        { name: "Sugar", quantity: 1, unit: "cup" },
        { name: "Eggs", quantity: 8, unit: "units" },
        { name: "Flour", quantity: 2, unit: "cups" },
        { name: "Baking Powder", quantity: 1, unit: "tsp" },
        { name: "Cocoa Powder", quantity: 3, unit: "tsp" }
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
          cost_per_unit: 5.50
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
      difficulty_level: 'hard', // Timing is critical for soufflé
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

  console.log('Batch 15 (Marshmallow Soufflé) Seeded Successfully!');
}
