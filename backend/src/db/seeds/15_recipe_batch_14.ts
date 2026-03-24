
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 14)
  const recipesData = [
    {
      name: "Irish White Chocolate Tiramisu",
      category: "truffles", // Dessert/Cake
      description: "Luxurious tiramisu layered with Irish cream-infused white chocolate mousse and espresso-soaked biscotti.",
      yield_quantity: 9, // 20x20 cm dish
      yield_unit: "servings",
      instructions: "1. Make ganache: Boil 1/2 cream, pour over white chocolate. 2. Mix espresso with Irish cream liqueuer. 3. Beat whites with salt and 3 tbsp sugar to meringue. 4. Beat yolks with remaining sugar vs stiff ribbons. 5. Fold yolks into ganache, then fold in mascarpone. 6. Whip remaining cream, fold in. Fold in whites. 7. Dip biscotti in coffee, layer, top with cream. Repeat. 8. Chill overnight. Dust with cocoa.",
      ingredients: [
        { name: "Heavy Cream", quantity: 1, unit: "cup" }, // Divided usage
        { name: "White Chocolate", quantity: 190, unit: "g" }, // "cups (190 g)"
        { name: "Espresso", quantity: 1, unit: "cup" }, // "Miracle strong coffee"
        { name: "Irish Cream Liqueur", quantity: 1, unit: "glass" },
        { name: "Eggs", quantity: 3, unit: "units" }, // Separated
        { name: "Salt", quantity: 0.125, unit: "tsp" }, // 1/8 tsp
        { name: "Sugar", quantity: 6, unit: "tbsp" },
        { name: "Mascarpone Cheese", quantity: 1, unit: "cups" },
        { name: "Biscotti", quantity: 18, unit: "units" }, // Large or 40 small
        { name: "Cocoa Powder", quantity: 2, unit: "tbsp" } // For garnishing
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
          cost_per_unit: 10.00 // Biscotti and Mascarpone
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
      difficulty_level: 'hard', // Tempering, meringue, and assembly
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

  console.log('Batch 14 (White Tiramisu) Seeded Successfully!');
}
