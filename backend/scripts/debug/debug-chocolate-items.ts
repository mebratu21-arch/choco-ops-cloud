
import { db } from './src/config/database';

async function diagnose() {
  console.log('--- DIAGNOSTIC SCRIPT: CHOCOLATE SEARCH ---');

  const items = await db('inventory_items')
    .where('name', 'ilike', '%Chocolate%')
    .select('id', 'name', 'quantity', 'unit');

  console.log(`\nFound ${items.length} inventory items containing "Chocolate":`);
  items.forEach(i => console.log(` - [${i.id}] "${i.name}": ${i.quantity} ${i.unit}`));

  // Also check recipes that use these items
  if (items.length > 0) {
      const ids = items.map(i => i.id);
      const usages = await db('recipe_ingredients')
        .whereIn('inventory_item_id', ids)
        .join('recipes', 'recipe_ingredients.recipe_id', 'recipes.id')
        .select('recipes.name as recipe_name', 'recipe_ingredients.quantity', 'recipe_ingredients.inventory_item_id');

      console.log(`\nUsage in recipes:`);
      usages.forEach(u => {
          const item = items.find(i => i.id === u.inventory_item_id);
          console.log(` - Recipe "${u.recipe_name}" uses ${u.quantity} of "${item?.name}"`);
      });
  }

  process.exit(0);
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
