
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 16)
  const recipesData = [
    {
      name: "Valentine's Luxury Heart Collection",
      category: "gift_boxes",
      description: "A romantic assortment of 24 hand-picked pralines in a red velvet heart box. Includes hazelnut clusters, coffee truffles, and strawberry creams.",
      yield_quantity: 1,
      yield_unit: "box",
      instructions: "1. Prepare assortment: Temper milk, dark, and white chocolate. 2. Fill shells with fillings (Strawberry ganache for pink foil, Hazelnut praline for nuts, Coffee ganache for dark). 3. Hand-decorate swirls. 4. Assemble 24 assorted units into Velvet Heart Box. 5. Attach 'With Love' tag.",
      ingredients: [
        // Packaging
        { name: "Red Velvet Heart Box", quantity: 1, unit: "unit" },
        { name: "Gift Tag", quantity: 1, unit: "unit" },
        // Assortment Ingredients (Inferred from visual praline diversity)
        { name: "Milk Chocolate", quantity: 150, unit: "g" },
        { name: "Dark Chocolate", quantity: 150, unit: "g" },
        { name: "White Chocolate", quantity: 100, unit: "g" },
        { name: "Hazelnuts", quantity: 50, unit: "g" }, // Topped/filled
        { name: "Coffee Beans", quantity: 20, unit: "units" }, // Garnish
        { name: "Strawberry Puree", quantity: 2, unit: "tbsp" }, // Pink foil filling
        { name: "Gold Foil", quantity: 2, unit: "sheets" }, // Wrappers
        { name: "Pink Foil", quantity: 2, unit: "sheets" }
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
          category: 'packaging', // Many items here are packaging
          quantity: 50,
          unit: ing.unit,
          supplier_id: supplierId,
          cost_per_unit: 2.50
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
      difficulty_level: 'easy', // Assembly focus
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

  console.log('Batch 16 (Valentine Box) Seeded Successfully!');
}
