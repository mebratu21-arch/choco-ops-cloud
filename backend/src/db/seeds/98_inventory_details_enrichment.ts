import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('📦 Starting Comprehensive Inventory Enrichment...');

  // 1. Get all items that are missing location or expiry
  const items = await knex('inventory_items')
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

    // Expiry date between 3 months and 2 years from now
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 21) + 3);

    await knex('inventory_items')
      .where('id', item.id)
      .update({
        location: location,
        expiry_date: expiryDate,
        updated_at: new Date()
      });
    
    updatedCount++;
  }

  // 2. Also ensure items with "loc" but null "exp" get an expiry (like Gold Foil)
  // (Handled by the OR in the query above, but let's be double sure)

  console.log(`✅ Successfully enriched ${updatedCount} inventory items with Sector and Lifecycle data.`);
}
