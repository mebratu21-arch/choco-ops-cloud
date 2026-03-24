
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 8)
  const recipesData = [
    {
      name: "Bread-Chocolate Pudding",
      category: "bars", // Cakes/Baked Goods
      description: "Rich chocolate bread pudding made with brioche rolls and dark chocolate ganache, served with vanilla sauce.",
      yield_quantity: 2,
      yield_unit: "loaves",
      instructions: "1. Boil milk and cream. Pour over 1 1/3 cups dark chocolate to make ganache. 2. Whisk eggs, yolks, sugar. Slowly mix in ganache. 3. Pour over cubed brioche. Add remaining chocolate chunks. Soak 10 mins. 4. Bake in lined pans at 160C for 30 mins. 5. Serve with vanilla sauce.",
      ingredients: [
        { name: "Milk", quantity: 1, unit: "cup" }, // "glass of milk 1"
        { name: "Heavy Cream", quantity: 1.66, unit: "cups" }, // 1 2/3 cups
        { name: "Dark Chocolate", quantity: 300, unit: "g" }, // "2 cups (300 g)"
        { name: "Sugar", quantity: 1, unit: "cup" },
        { name: "Eggs", quantity: 3, unit: "units" },
        { name: "Egg Yolks", quantity: 3, unit: "units" },
        { name: "Brioche Rolls", quantity: 12, unit: "units" } // "12 brioche rolls or 5 thick slices"
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
          cost_per_unit: 2.00 // Bread is cheap
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

  console.log('Batch 8 (Bread Pudding) Seeded Successfully!');
}
