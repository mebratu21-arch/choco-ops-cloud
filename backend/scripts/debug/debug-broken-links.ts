
import { db } from './src/config/database';

async function diagnose() {
  console.log('--- DIAGNOSTIC SCRIPT: BROKEN LINKS ---');

  const brokenIngredients = await db('recipe_ingredients')
    .leftJoin('inventory_items', 'recipe_ingredients.inventory_item_id', 'inventory_items.id')
    .select(
      'recipe_ingredients.recipe_id',
      'recipe_ingredients.custom_name',
      'recipe_ingredients.inventory_item_id',
      'inventory_items.id as joined_id',
      'inventory_items.name as joined_name'
    )
    .whereNotNull('recipe_ingredients.inventory_item_id')
    .whereNull('inventory_items.id');

  console.log(`\nFound ${brokenIngredients.length} ingredients with BROKEN inventory links:`);
  
  for (const ing of brokenIngredients) {
    const recipe = await db('recipes').where('id', ing.recipe_id).first();
    console.log(` - Recipe '${recipe?.name}' (${ing.recipe_id}):`);
    console.log(`   Ingredient Custom Name: '${ing.custom_name}'`);
    console.log(`   Linked to ID: ${ing.inventory_item_id} (Missing in inventory_items table)`);
  }

  // Also search for "Dark Chocolate" in custom_name just to be sure
  const darkChocIngredients = await db('recipe_ingredients')
    .where('custom_name', 'ilike', '%Dark Chocolate%')
    .select('*');
    
  console.log(`\nIngredients with custom_name like 'Dark Chocolate' (${darkChocIngredients.length}):`);
  darkChocIngredients.forEach(i => {
      console.log(` - Recipe ${i.recipe_id}: Custom '${i.custom_name}', InvID: ${i.inventory_item_id}`);
  });

  process.exit(0);
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
