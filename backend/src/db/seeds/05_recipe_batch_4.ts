
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 4)
  const recipesData = [
    {
      name: "White Chocolate & Jasmine Crème Brûlée",
      category: "truffles", // Mapping custard/creamy dessert to truffles category
      description: "Sophisticated jasmine-infused crème brûlée with cherries soaked in Kirsch liqueur.",
      yield_quantity: 6,
      yield_unit: "servings",
      instructions: "1. Soak cherries in Kirsch (1hr). 2. Infuse cream with jasmine tea and vanilla (boil then sit 20-30m). 3. Whisk yolks, 1 egg, and sugar over double boiler until thick. 4. Whisk chocolate into hot cream, then temper into egg mix. 5. Pour into dishes with cherries. 6. Bake in water bath 30m at 160C. 7. Chill.",
      ingredients: [
        { name: "Cherries", quantity: 10, unit: "units" }, // Ripe and hard, pitted
        { name: "Kirsch Liqueur", quantity: 1, unit: "cup" },
        { name: "Heavy Cream", quantity: 1, unit: "cup" },
        { name: "Jasmine Tea Bags", quantity: 2, unit: "units" },
        { name: "Vanilla Extract", quantity: 1, unit: "tsp" },
        { name: "Egg Yolks", quantity: 7, unit: "units" },
        { name: "Whole Egg", quantity: 1, unit: "unit" },
        { name: "Sugar", quantity: 1, unit: "cup" }, // Plus more for topping
        { name: "White Chocolate Chips", quantity: 40, unit: "g" } // Literal from text "cup (40 g)"
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
          quantity: 20, // Lower stock for specialty items
          unit: ing.unit,
          supplier_id: supplierId,
          cost_per_unit: 8.00 // Pricier ingredients
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
      difficulty_level: 'hard', // Tempering eggs and water bath
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

  console.log('Batch 4 (Crème Brûlée) Seeded Successfully!');
}
