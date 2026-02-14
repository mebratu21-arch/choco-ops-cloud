
import { db } from './src/config/database.js';

async function enrich() {
  console.log('📦 Starting Standalone Inventory Enrichment...');

  const items = await db('inventory_items')
    .whereNull('location')
    .orWhereNull('expiry_date')
    .select('id', 'name', 'category');

  console.log(`🔍 Found ${items.length} items requiring data enrichment.`);

  const zones = ['A', 'B', 'C', 'D', 'E'];
  const shelves = ['1', '2', '3', '4', '5'];
  const slots = ['101', '102', '103', '104', '201', '202', '301'];

  let updatedCount = 0;
  for (const item of items) {
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    const randomShelf = shelves[Math.floor(Math.random() * shelves.length)];
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
    const location = `Zone-${randomZone} | ${randomZone}-${randomShelf}${randomSlot}`;

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 21) + 3);

    await db('inventory_items')
      .where('id', item.id)
      .update({
        location: location,
        expiry_date: expiryDate,
        updated_at: new Date()
      });
    
    updatedCount++;
  }

  console.log(`✅ Successfully enriched ${updatedCount} inventory items.`);
  process.exit(0);
}

enrich().catch(err => {
  console.error(err);
  process.exit(1);
});
