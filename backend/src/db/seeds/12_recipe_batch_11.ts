
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 11)
  const recipesData = [
    {
      name: "White Choc Lassie with Ricotta Barfi",
      category: "truffles", // Dessert/Drink
      description: "A spicy, cold Indian Lassie drink with white chocolate, ginger and mango, served with a side of chocolate ricotta 'Barrafi' (Barfi).",
      yield_quantity: 4,
      yield_unit: "glasses",
      instructions: "1. boil water with mint, ginger, cloves. Cool at least 1 hr. 2. Strain water into blender. Add yogurt, white chocolate chips, ice, honey, mangoes, lemon juice. Blend well. 3. (Inferred) Barrafi: Mix ricotta, sugar, and melted milk chocolate. Set in tray and cut into squares. Serve alongside Lassie.",
      ingredients: [
        // Lassie
        { name: "Water", quantity: 1, unit: "cup" },
        { name: "Mint Leaves", quantity: 10, unit: "leaves" },
        { name: "Fresh Ginger", quantity: 2, unit: "cm" }, // grated
        { name: "Whole Cloves", quantity: 5, unit: "units" },
        { name: "Yogurt", quantity: 10, unit: "tsp" },
        { name: "White Chocolate Chips", quantity: 40, unit: "g" },
        { name: "Ice Cubes", quantity: 20, unit: "cubes" },
        { name: "Honey", quantity: 8, unit: "tbsp" },
        { name: "Mangoes", quantity: 2, unit: "units" }, // Peeled
        { name: "Lemon Juice", quantity: 1, unit: "unit" },
        // Inferred Barrafi (from title)
        { name: "Ricotta Cheese", quantity: 250, unit: "g" },
        { name: "Milk Chocolate", quantity: 100, unit: "g" },
        { name: "Sugar", quantity: 0.5, unit: "cup" } // Standard binder
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
          cost_per_unit: 4.00
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
      difficulty_level: 'medium', // Spiced infusion takes time
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

  console.log('Batch 11 (Lassie & Barfi) Seeded Successfully!');
}
