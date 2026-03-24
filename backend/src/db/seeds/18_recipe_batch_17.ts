
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 17)
  const recipesData = [
    {
      name: "Valentine's Premium Rose Heart",
      category: "gift_boxes",
      description: "Our most exclusive Valentine's gift: A giant red velvet heart box adorned with artificial red roses, filled with 36 premium dark and milk chocolate pralines.",
      yield_quantity: 1,
      yield_unit: "box",
      instructions: "1. Prepare assortment: Dark Chocolate Truffles, Milk Chocolate Caramels, White Chocolate Squares. 2. Assemble lower layer. 3. Place separator. 4. Assemble upper layer. 5. Seal in Velvet Heart Box with Rose Attachment.",
      ingredients: [
        // Packaging
        { name: "Large Velvet Heart Box", quantity: 1, unit: "unit" },
        { name: "Artificial Red Roses", quantity: 2, unit: "units" }, // Decoration on box
        // Assortment
        { name: "Dark Chocolate", quantity: 250, unit: "g" },
        { name: "Milk Chocolate", quantity: 250, unit: "g" },
        { name: "Caramel Filling", quantity: 100, unit: "g" },
        { name: "Pecan Nuts", quantity: 50, unit: "g" }, // Visible nut topping
        { name: "Sea Salt", quantity: 1, unit: "tsp" },
        { name: "Cocoa Nibs", quantity: 1, unit: "tbsp" } // Garnish
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
          category: 'packaging', 
          quantity: 25,
          unit: ing.unit,
          supplier_id: supplierId,
          cost_per_unit: 5.00 // Premium box cost
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
      difficulty_level: 'easy', 
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

  console.log('Batch 17 (Rose Heart Box) Seeded Successfully!');
}
