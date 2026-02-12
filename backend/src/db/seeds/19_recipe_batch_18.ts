
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 18)
  const recipesData = [
    {
      name: "Signature Praline Collection",
      category: "gift_boxes",
      description: "Our definitive centerpiece collection featuring 30 distinct handcrafted chocolates. Highlights include the 'Zebra' white truffle, 'Pink Heart' raspberry cream, and 'Golden Crown' hazelnut dome.",
      yield_quantity: 1,
      yield_unit: "box",
      instructions: "1. Shelling: Prepare molds for 5 distinct shapes (Round, Square, Heart, Swirl, Dome). 2. Fillings: Ganache (Coffee, Raspberry, Caramel), Praline Paste (Hazelnut, Almond). 3. Enrobing: Dip centers in tempered chocolate. 4. Decorating: Apply stripes, foils (Red, Pink, Gold), and toppings (Nuts, Coffee Beans). 5. Arrange in grid tray.",
      ingredients: [
        // Packaging
        { name: "Grid Tray Box", quantity: 1, unit: "unit" },
        // Chocolate Base
        { name: "Dark Chocolate", quantity: 300, unit: "g" },
        { name: "Milk Chocolate", quantity: 300, unit: "g" },
        { name: "White Chocolate", quantity: 200, unit: "g" },
        // Fillings & Inclusions
        { name: "Hazelnut Praline Paste", quantity: 100, unit: "g" },
        { name: "Raspberry Puree", quantity: 50, unit: "ml" }, // Pink foil
        { name: "Caramel", quantity: 100, unit: "g" },
        { name: "Coffee Beans", quantity: 10, unit: "units" }, // Garnish
        { name: "Walnuts", quantity: 50, unit: "g" }, // Topping
        { name: "Gold Foil", quantity: 4, unit: "sheets" },
        { name: "Red Foil", quantity: 2, unit: "sheets" },
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
          category: 'ingredient', // Mixed category
          quantity: 50,
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
      difficulty_level: 'hard', // Massively complex assembly
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

  console.log('Batch 18 (Signature Assortment) Seeded Successfully!');
}
