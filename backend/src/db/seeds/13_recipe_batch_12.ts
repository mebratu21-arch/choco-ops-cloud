
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 12)
  const recipesData = [
    {
      name: "Brandied Rice Pudding & Dark Choc Sauce",
      category: "truffles", // Dessert
      description: "Baked jasmine rice pudding enriched with dates, apricots, cranberries and brandy, served with a decadent dark chocolate-brandy sauce.",
      yield_quantity: 8,
      yield_unit: "ramekins",
      instructions: "1. Boil milk, cook rice until tender (40m). 2. Mix in cream, milk, brandy, sugar, dried fruits. 3. Temper egg yolks with hot rice, then mix all together. 4. Bake in water bath at 160C for 25m until set. 5. Sauce: Boil cream and butter, pour over dark chocolate and brandy. Whisk to smooth ganache.",
      ingredients: [
        // Pudding
        { name: "Milk", quantity: 5, unit: "cups" }, // "4 plus 1 cup"
        { name: "Jasmine Rice", quantity: 1, unit: "cup" },
        { name: "Salt", quantity: 1, unit: "pinch" },
        { name: "Heavy Cream", quantity: 1, unit: "cup" },
        { name: "Brandy", quantity: 1, unit: "cup" },
        { name: "Sugar", quantity: 1, unit: "cup" },
        { name: "Dried Dates", quantity: 1, unit: "cup" }, // Finely chopped
        { name: "Dried Apricots", quantity: 1, unit: "cup" }, // Finely chopped
        { name: "Dried Cranberries", quantity: 1, unit: "cup" }, // Finely chopped
        { name: "Egg Yolks", quantity: 6, unit: "units" },
        // Sauce
        { name: "Heavy Cream", quantity: 1, unit: "cup" }, // For sauce
        { name: "Butter", quantity: 1, unit: "tbsp" },
        { name: "Brandy", quantity: 1, unit: "tbsp" }, // Additional for sauce
        { name: "Dark Chocolate", quantity: 200, unit: "g" } // Inferred from "Dark Chocolate Sauce" title and ganache method
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
          cost_per_unit: 8.50 // Brandy and dried fruits are pricey
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
      difficulty_level: 'hard', // Water bath baking, tempering
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

  console.log('Batch 12 (Rice Pudding) Seeded Successfully!');
}
