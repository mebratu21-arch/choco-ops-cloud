
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Raw Data from Vision Analysis (Batch 2)
  const recipesData = [
    {
      name: "Innocent Meringue Kisses",
      category: "bonbons", // Meringues
      description: "Meringue kisses dipped in dark chocolate and passionflower.",
      yield_quantity: 30, // Estimate based on typical batch
      yield_unit: "units",
      instructions: "1. Preheat 90C. 2. Whip egg whites and sugar to firm foam. 3. Pipe onto baking sheet. 4. Bake 2 hours, dry overnight. 5. Dip in melted dark chocolate.",
      ingredients: [
        { name: "Egg Whites", quantity: 4, unit: "units" },
        { name: "Sugar", quantity: 1, unit: "cup" },
        { name: "Powdered Sugar", quantity: 1, unit: "cup" },
        { name: "Salt", quantity: 1, unit: "tsp" },
        { name: "Almond Extract", quantity: 0.125, unit: "tsp" }, // 1/8 tsp
        { name: "Dark Chocolate", quantity: 190, unit: "g" },
        { name: "Passionflower Fruits", quantity: 10, unit: "units" }
      ]
    },
    {
      name: "Fig & Vodka Confectionery",
      category: "truffles", // Jam/Confectionery
      description: "A confectionery of figs, mint and vodka with roasted cocoa beans.",
      yield_quantity: 4,
      yield_unit: "jars",
      instructions: "1. Cook figs. 2. Add sugar, mint, cocoa. Cook to jam consistency. 3. Add vodka. 4. Jar and seal.",
      ingredients: [
        { name: "Ripe Figs", quantity: 700, unit: "g" },
        { name: "Sugar", quantity: 3.5, unit: "cups" }, // 3-4 cups
        { name: "Mint Leaves", quantity: 10, unit: "leaves" }, // Chopped
        { name: "Cacao Nibs", quantity: 1, unit: "cup" },
        { name: "Vodka", quantity: 1, unit: "glass" }
      ]
    },
    {
      name: "Pistachio Marzipan Balls",
      category: "pralines", // Pralines/Balls
      description: "Balls of pistachio marzipan with hazelnuts in the center and coated with dark chocolate.",
      yield_quantity: 25,
      yield_unit: "balls",
      instructions: "1. Make syrup (sugar+water). 2. Grind almonds, pistachios, sugar. 3. Mix syrup into nuts to form paste. 4. Refrigerate. 5. Form balls around hazelnuts. 6. Dip in dark chocolate.",
      ingredients: [
        { name: "Sugar", quantity: 2, unit: "cups" }, // Syrup + Marzipan
        { name: "Water", quantity: 1, unit: "cup" },
        { name: "Bleached Almonds", quantity: 1, unit: "cup" },
        { name: "Pistachios", quantity: 1, unit: "cup" },
        { name: "Grand Marnier", quantity: 2, unit: "tbsp" },
        { name: "Powdered Sugar", quantity: 1, unit: "cup" },
        { name: "Hazelnuts", quantity: 25, unit: "units" }, // Whole
        { name: "Dark Chocolate", quantity: 1, unit: "cup" }
      ]
    },
    {
      name: "Candied Orange Peels",
      category: "bars", // Candied peels
      description: "Orange peels candied in white chocolate and cardamom rolled in cornflakes fragments.",
      yield_quantity: 50,
      yield_unit: "peels",
      instructions: "1. Cut peels strips. 2. Boil 3 times to remove bitterness. 3. Cook in sugar syrup 2 hours. 4. Dry. 5. Roll in sugar. 6. Dip in white chocolate/cardamom mix. 7. Coat in cornflakes.",
      ingredients: [
        { name: "Oranges", quantity: 5, unit: "units" },
        { name: "Sugar", quantity: 2, unit: "cups" },
        { name: "Vanilla Extract", quantity: 3, unit: "tsp" },
        { name: "Lemon Juice", quantity: 2, unit: "tbsp" },
        { name: "White Chocolate", quantity: 150, unit: "g" },
        { name: "Ground Cardamom", quantity: 2, unit: "tsp" },
        { name: "Cornflakes", quantity: 2, unit: "cups" }
      ]
    }
  ];

  // 2. Insert Missing Ingredients (Idempotent check similar to batch 1)
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
          quantity: 50, // Default stock
          unit: ing.unit,
          supplier_id: supplierId,
          cost_per_unit: 4.50
        }).returning('id');
        inventoryMap[ing.name] = newItem.id;
      }
    }
  }

  // 3. Insert Recipes
  for (const recipe of recipesData) {
    const [rec] = await knex('recipes').insert({
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      yield_quantity: recipe.yield_quantity,
      yield_unit: recipe.yield_unit,
      instructions: recipe.instructions,
      difficulty_level: 'hard', // These look intricate
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

  console.log('Batch 2 (Vision) Recipes Seeded Successfully!');
}
