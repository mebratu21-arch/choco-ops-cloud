
import { db } from './src/config/database';

async function fixStock() {
  console.log('--- REPLENISHING STOCK LEVELS ---');

  const updates = [
    { name: 'Dark Chocolate', quantity: 50000, unit: 'g' }, // 50kg
    { name: 'Milk Chocolate', quantity: 50000, unit: 'g' },
    { name: 'White Chocolate', quantity: 50000, unit: 'g' },
    { name: 'Butter', quantity: 20000, unit: 'g' },
    { name: 'Heavy Cream', quantity: 20000, unit: 'ml' },
    { name: 'Soft Butter', quantity: 10000, unit: 'g' },
    { name: 'Unsalted Butter', quantity: 10000, unit: 'g' },
    { name: 'Coconut Flakes', quantity: 50000, unit: 'g' }
  ];

  for (const update of updates) {
    const item = await db('inventory_items').where('name', 'ilike', update.name).first();
    if (item) {
      console.log(`Updating ${item.name}: ${item.quantity} -> ${update.quantity} ${update.unit}`);
      await db('inventory_items')
        .where('id', item.id)
        .update({ quantity: update.quantity });
    } else {
        console.warn(`Item not found: ${update.name}`);
    }
  }

  // Also verify "Dark Chocolate Chunks" vs "Dark Chocolate"
  // The user error was "Insufficient ingredients: Dark Chocolate"
  // My dump showed "Dark Chocolate" (InvID: 465af0ca...) had 100g.
  
  console.log('\nVerification of Dark Chocolate:');
  const darkChoc = await db('inventory_items').where('name', 'ilike', 'Dark Chocolate').first();
  if (darkChoc) {
      console.log(`Current Dark Chocolate Stock: ${darkChoc.quantity} ${darkChoc.unit}`);
  }

  process.exit(0);
}

fixStock().catch(err => {
  console.error(err);
  process.exit(1);
});
