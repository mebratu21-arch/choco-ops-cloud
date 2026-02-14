
import { db } from './src/config/database';
import fs from 'fs';

async function dump() {
  const recipes = await db('recipes').select('*');
  let output = '--- RECIPES DUMP ---\n';

  for (const r of recipes) {
    output += `\nRECIPE: ${r.name} (ID: ${r.id})\nYield: ${r.yield_quantity} ${r.yield_unit}\n`;
    
    const ingredients = await db('recipe_ingredients')
      .leftJoin('inventory_items', 'recipe_ingredients.inventory_item_id', 'inventory_items.id')
      .where('recipe_id', r.id)
      .select(
        'recipe_ingredients.*',
        'inventory_items.name as inventory_name',
        'inventory_items.quantity as stock_qty',
        'inventory_items.unit as stock_unit'
      );
      
    ingredients.forEach(i => {
       const displayName = i.inventory_name || i.custom_name || 'Unknown';
       output += `  - Ing: "${displayName}" (Custom: "${i.custom_name}", InvID: ${i.inventory_item_id})\n`;
       output += `    Req: ${i.quantity} ${i.unit}, Stock: ${i.stock_qty} ${i.stock_unit}\n`;
    });
  }

  fs.writeFileSync('data-dump.txt', output);
  console.log('Dumped to data-dump.txt');
  process.exit(0);
}

dump().catch(console.error);
