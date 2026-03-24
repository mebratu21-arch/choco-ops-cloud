
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 9)
  const recipesData = [
    {
      name: "Toffee Semolina Porridge",
      category: "truffles", // Milky/spoon dessert
      description: "Warm semolina porridge served with a rich homemade toffee sauce and a melting heart of milk chocolate.",
      yield_quantity: 4,
      yield_unit: "bowls",
      instructions: "1. Boil milk, whisk in semolina and salt until thickened (approx 1 min). 2. Toffee: Boil sugar and water to golden caramel (8 mins). Stop cooking by adding cream. Whisk until smooth. 3. Serve porridge, top with toffee sauce and a block of milk chocolate to melt.",
      ingredients: [
        // Porridge
        { name: "Milk", quantity: 2, unit: "cups" },
        { name: "Salt", quantity: 1, unit: "tsp" },
        { name: "Semolina Flour", quantity: 1, unit: "cup" },
        // Toffee (Letofi)
        { name: "Sugar", quantity: 1, unit: "cup" },
        { name: "Water", quantity: 3, unit: "tbsp" },
        { name: "Heavy Cream", quantity: 1, unit: "cup" },
        // Decoration
        { name: "Milk Chocolate Bar", quantity: 100, unit: "g" } // "broken into quarters" -> approx 1 bar
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
          quantity: 30,
          unit: ing.unit,
          supplier_id: supplierId,
          cost_per_unit: 1.50
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
      difficulty_level: 'easy', // Porridge and simple caramel
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

  console.log('Batch 9 (Toffee Porridge) Seeded Successfully!');
}
