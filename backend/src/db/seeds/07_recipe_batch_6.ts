
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 6)
  const recipesData = [
    {
      name: "Chocolate Burekas & Mascarpone Cream",
      category: "bars", // Pastry/Baked goods
      description: "Decadent chocolate burekas served with a rich mascarpone cheese cream and wine-poached pears.",
      yield_quantity: 15,
      yield_unit: "dishes",
      instructions: "1. Boil sugar/water, add pears and wine, refrigerate 12h. 2. Mix flour, salt, egg, yolk, yeast, warm milk. 3. Beat butter/sugar, mix into dough. Chill 2h. 4. Roll dough, cut rectangles. 5. Fill with chocolate (implied), fold. 6. Bake at 180C. 7. Serve with mascarpone cream.",
      ingredients: [
        // Pears in Wine
        { name: "Hard Pears", quantity: 4, unit: "units" }, // Peeled/chopped
        { name: "Sugar", quantity: 2.33, unit: "cups" }, // 2 cups (pears) + 1/3 cup (dough)
        { name: "Water", quantity: 2, unit: "cups" },
        { name: "White Wine", quantity: 1, unit: "glass" }, // "Fine white wine"
        // Dough
        { name: "Flour", quantity: 5, unit: "cups" },
        { name: "Salt", quantity: 1, unit: "tsp" },
        { name: "Eggs", quantity: 2, unit: "units" }, // 1 egg + 1 yolk
        { name: "Dry Yeast", quantity: 1, unit: "tsp" },
        { name: "Warm Milk", quantity: 3, unit: "tbsp" },
        { name: "Soft Butter", quantity: 250, unit: "g" },
        // Implied Filling/Topping (Title: Chocolate & Mascarpone)
        { name: "Dark Chocolate", quantity: 200, unit: "g" }, // Filling assumption
        { name: "Mascarpone Cheese", quantity: 250, unit: "g" }, // Cream assumption
        { name: "Powdered Sugar", quantity: 0.5, unit: "cup" }, // For cream
        { name: "Heavy Cream", quantity: 100, unit: "ml" } // For cream
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
          cost_per_unit: 7.50 // Mascarpone/Wine are premium
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
      difficulty_level: 'hard', // Yeast dough + poaching + cream
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

  console.log('Batch 6 (Burekas) Seeded Successfully!');
}
