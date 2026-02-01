
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 1. Defind Raw Data from Vision Analysis
  const recipesData = [
    {
      name: "Peanut Toffee Candies",
      category: "bonbons", // mapping 'dessert'/'candy' to enum
      description: "Artisan peanut toffee candies cut into cubes, topped with melted milk chocolate and coarse sea salt.",
      yield_quantity: 20,
      yield_unit: "servings",
      instructions: "1. Line baking dish. 2. Melt butter and sugar to 150C. 3. Add peanuts, pour and flatten. 4. Top with melted chocolate. 5. Sprinkle salt/peanuts, cool, and cut.",
      ingredients: [
        { name: "Toffee Base", quantity: 1.3, unit: "kg" }, // "kg toffee 1.3" -> Assumed base or bulk toffee
        { name: "Salted Butter", quantity: 200, unit: "g" },
        { name: "Sugar", quantity: 2, unit: "tablespoons" },
        { name: "Roasted Salted Peanuts", quantity: 2, unit: "cups" },
        { name: "Milk Chocolate", quantity: 150, unit: "g" },
        { name: "Sea Salt", quantity: 5, unit: "g" } // "to taste" approx
      ]
    },
    {
      name: "Yogurt White Choc Strawberry Milkshake",
      category: "pralines", // approximate category mapping
      description: "Refreshing milkshake with white chocolate, yogurt, and fresh strawberries.",
      yield_quantity: 4,
      yield_unit: "glasses",
      instructions: "1. Boil milk and mint. 2. Melt white chocolate in hot milk. 3. Blend strawberries, yogurt, ice, and choc-milk base.",
      ingredients: [
        { name: "Mint Leaves", quantity: 10, unit: "leaves" },
        { name: "Milk", quantity: 250, unit: "ml" }, // "Glass of" approx 250ml
        { name: "White Chocolate", quantity: 40, unit: "g" },
        { name: "Strawberries", quantity: 3, unit: "cups" },
        { name: "Yogurt", quantity: 1, unit: "cup" },
        { name: "Ice Cubes", quantity: 30, unit: "cubes" },
        { name: "Vanilla Ice Cream", quantity: 5, unit: "tsp" }
      ]
    },
    {
      name: "Cat Tongues with Pistachio",
      category: "bars", // Cookies/Bars
      description: "Classic cat tongue cookies dipped in chocolate, toasted coconut and pistachio.",
      yield_quantity: 36,
      yield_unit: "cookies",
      instructions: "1. Preheat 180C. 2. Beat whites. 3. Beat yolks+sugar. 4. Fold flour. 5. Pipe strips. 6. Bake 10m. 7. Dip in chocolate.",
      ingredients: [
        { name: "Flour", quantity: 3, unit: "tbsp" },
        { name: "Eggs", quantity: 6, unit: "units" }, // Whites+Yolks split
        { name: "Sugar", quantity: 2, unit: "cups" }, // 1 tbsp + 1 cup + another cup... simplifying sum
        { name: "Lemon Juice", quantity: 1, unit: "unit" },
        { name: "Vanilla Extract", quantity: 1, unit: "tsp" },
        { name: "Milk Chocolate", quantity: 1, unit: "cup" },
        { name: "Pistachios", quantity: 1, unit: "cup" },
        { name: "Coconut Flakes", quantity: 200, unit: "g" }
      ]
    },
    {
      name: "Wannabe French Hot Chocolate",
      category: "truffles", // Beverage... mapping to closest
      description: "Very thick hot chocolate with sweet whipped cream.",
      yield_quantity: 4,
      yield_unit: "mugs",
      instructions: "1. Whisk cornstarch, milk, sugar, yolks. 2. Boil. 3. Melt dark chocolate. 4. Whip cream and top.",
      ingredients: [
        { name: "Cornstarch", quantity: 2, unit: "tbsp" },
        { name: "Milk", quantity: 1000, unit: "ml" }, // 3 cups + 1 glass... approx
        { name: "Dark Chocolate", quantity: 115, unit: "g" },
        { name: "Heavy Cream", quantity: 250, unit: "ml" },
        { name: "Cornstarch", quantity: 2, unit: "tbsp" }
      ]
    },
    {
      name: "Cosmopolitan White Choc Cocktail",
      category: "gift_boxes", // Cocktail
      description: "Cosmopolitan White Chocolate with Peanuts in Wasabi Dark Chocolate twist.",
      yield_quantity: 2,
      yield_unit: "glasses",
      instructions: "1. Boil milk, melt white chocolate. 2. Cool. 3. Shake with vodka, liquer, juices.",
      ingredients: [
        { name: "Milk", quantity: 250, unit: "ml" },
        { name: "White Chocolate", quantity: 150, unit: "g" },
        { name: "Vodka", quantity: 1, unit: "glass" },
        { name: "Cointreau", quantity: 0.875, unit: "cup" }, // 7/8 cup
        { name: "Cranberry Juice", quantity: 0.875, unit: "cup" },
        { name: "Lemon", quantity: 1, unit: "unit" }
      ]
    }
  ];

  // 2. Insert Missing Ingredients (Idempotent-ish check)
  // We first fetch existing supplier to link
  const supplier = await knex('suppliers').first();
  const supplierId = supplier?.id;

  const inventoryMap: Record<string, string> = {};

  for (const recipe of recipesData) {
    for (const ing of recipe.ingredients) {
      // Check if exists
      const existing = await knex('inventory_items').where('name', ing.name).first();
      if (existing) {
        inventoryMap[ing.name] = existing.id;
      } else {
        // Create
        const [newItem] = await knex('inventory_items').insert({
          name: ing.name,
          code: `ING-${Math.floor(Math.random() * 10000)}`, // Auto-sku
          category: 'ingredient',
          quantity: 100, // Seed initial stock
          unit: ing.unit,
          supplier_id: supplierId,
          cost_per_unit: 5.00
        }).returning('id');
        inventoryMap[ing.name] = newItem.id;
      }
    }
  }

  // 3. Insert Recipes & Links
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

    // Link ingredients
    const recipeIngs = recipe.ingredients.map(ing => ({
      recipe_id: rec.id,
      inventory_item_id: inventoryMap[ing.name],
      quantity: ing.quantity,
      unit: ing.unit
    }));

    await knex('recipe_ingredients').insert(recipeIngs);
  }

  console.log('Vision API Recipes Seeded Successfully!');
}
