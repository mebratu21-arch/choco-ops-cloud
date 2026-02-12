
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 10)
  const recipesData = [
    {
      name: "Tempura Amaretto Truffles",
      category: "truffles",
      description: "Crispy fried chocolate truffles flavored with Amaretto, with a melting warm ganache center.",
      yield_quantity: 30,
      yield_unit: "balls",
      instructions: "1. Boil cream. Pour over dark chocolate and almond liqueur. Mix to smooth ganache. 2. Beat butter and sugar (inferred) until fluffy. Fold into ganache. Chill 2+ hrs. 3. Scoop balls, roll in flour/powdered sugar. Freeze. 4. Coat in egg, flour, breadcrumbs (double dip). Freeze again. 5. Deep fry at 190C for 2 mins.",
      ingredients: [
        { name: "Dark Chocolate", quantity: 420, unit: "g" }, // "2 cups (420 g)"
        { name: "Soft Butter", quantity: 100, unit: "g" },
        { name: "Heavy Cream", quantity: 1, unit: "cup" },
        { name: "Almond Liqueur", quantity: 3, unit: "tbsp" }, // Amaretto
        { name: "Sugar", quantity: 0.5, unit: "cup" }, // Inferred from "beat butter and sugar" instruction (missing from list)
        { name: "Eggs", quantity: 1, unit: "unit" }, // For coating
        { name: "Flour", quantity: 1, unit: "cup" }, // For coating
        { name: "Bread Crumbs", quantity: 2, unit: "cups" }, // Estimate for coating 30 balls
        { name: "Frying Oil", quantity: 1, unit: "liter" } // Generic frying oil
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
          cost_per_unit: 9.00 // Alcohol and chocolate
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
      difficulty_level: 'hard', // Frying truffles is delicate
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

  console.log('Batch 10 (Tempura Truffles) Seeded Successfully!');
}
