
import { db } from './src/config/database';

async function diagnose() {
  console.log('--- DIAGNOSTIC SCRIPT: ALL INVENTORY & RECIPES ---');

  const inventory = await db('inventory_items').select('id', 'name', 'quantity', 'unit');
  console.log(`\nInventory Items (${inventory.length}):`);
  inventory.forEach(i => console.log(` - [${i.id}] ${i.name}: ${i.quantity} ${i.unit}`));

  const recipes = await db('recipes').select('id', 'name');
  console.log(`\nRecipes (${recipes.length}):`);
  recipes.forEach(r => console.log(` - [${r.id}] ${r.name}`));

  // Also check recipe_ingredients to see what they are linking to
  const ingredients = await db('recipe_ingredients')
    .leftJoin('inventory_items', 'recipe_ingredients.inventory_item_id', 'inventory_items.id')
    .select(
        'recipe_ingredients.recipe_id',
        'recipe_ingredients.custom_name',
        'inventory_items.name as linked_name'
    );
  
  console.log(`\nRecipe Ingredients Dump (${ingredients.length}):`);
  ingredients.forEach(i => {
      if (i.custom_name && i.custom_name.toLowerCase().includes('chocolate')) {
          console.log(` - Recipe ${i.recipe_id}: Custom Name '${i.custom_name}' (Linked: ${i.linked_name || 'NULL'})`);
      }
      if (i.linked_name && i.linked_name.toLowerCase().includes('chocolate')) {
         console.log(` - Recipe ${i.recipe_id}: Linked Item '${i.linked_name}'`);
      }
  });

  process.exit(0);
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
