
import { db } from './src/config/database';

async function diagnose() {
  console.log('--- DIAGNOSTIC SCRIPT: INVENTORY LOCATIONS ---');

  const inventory = await db('inventory_items').select('id', 'name', 'location');
  console.log(`\nInventory Items (${inventory.length}):`);
  inventory.forEach(i => console.log(` - [${i.id}] ${i.name}: ${i.location || 'NULL'}`));

  process.exit(0);
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
