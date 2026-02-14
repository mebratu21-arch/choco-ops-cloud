
import { db } from './src/config/database';

async function diagnose() {
  console.log('--- DIAGNOSTIC SCRIPT: INGREDIENT CHECK ---');

  // 1. Find recipes or ingredients matching "Dark Chocolate"
  const recipes = await db('recipes').where('name', 'ilike', '%Dark Chocolate%').select('id', 'name', 'yield_quantity');
  console.log(`\nFound ${recipes.length} recipes matching "Dark Chocolate":`);
  recipes.forEach(r => console.log(` - [${r.id}] ${r.name} (Yield: ${r.yield_quantity})`));

  // 2. Find inventory items matching "Dark Chocolate"
  const items = await db('inventory_items').where('name', 'ilike', '%Dark Chocolate%').select('id', 'name', 'quantity', 'unit');
  console.log(`\nFound ${items.length} inventory items matching "Dark Chocolate":`);
  items.forEach(i => console.log(` - [${i.id}] ${i.name}: ${i.quantity} ${i.unit}`));

  // 3. For each recipe found, list its ingredients and availability
  for (const recipe of recipes) {
    console.log(`\nChecking ingredients for Recipe: ${recipe.name} (${recipe.id})`);
    
    const ingredients = await db('recipe_ingredients')
      .leftJoin('inventory_items', 'recipe_ingredients.inventory_item_id', 'inventory_items.id')
      .where('recipe_id', recipe.id)
      .select(
        'recipe_ingredients.inventory_item_id',
        'recipe_ingredients.quantity as required_qty',
        'recipe_ingredients.unit as required_unit',
        'recipe_ingredients.custom_name',
        'inventory_items.name as item_name',
        'inventory_items.quantity as stock_qty',
        'inventory_items.unit as stock_unit'
      );

    if (ingredients.length === 0) {
      console.log('  (No ingredients defined)');
    }

    ingredients.forEach(ing => {
      const name = ing.item_name || ing.custom_name || 'Unknown';
      const status = (Number(ing.stock_qty || 0) < Number(ing.required_qty)) ? '❌ INSUFFICIENT' : '✅ OK';
      console.log(`  - ${name}: Required ${ing.required_qty} ${ing.required_unit}, Stock ${ing.stock_qty || 0} ${ing.stock_unit || '?'} [${status}]`);
      if (ing.inventory_item_id) {
          console.log(`    (Linked to Inventory Item ID: ${ing.inventory_item_id})`);
      } else {
          console.log(`    (Manual Ingredient - No Inventory Link)`);
      }
    });
  }

  process.exit(0);
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
