
import { db } from './src/config/database.js';

async function seedMovements() {
  console.log('📉 Starting Standalone Movement Seeding...');

  // 1. Get all inventory items
  const items = await db('inventory_items').select('id', 'name');
  
  // 2. Get some users
  const users = await db('users').select('id').limit(3);
  const userIds = users.map(u => u.id);

  if (items.length === 0 || userIds.length === 0) {
    console.log('⚠️ No items or users found.');
    process.exit(0);
  }

  const movements = [];
  const now = new Date();

  console.log(`🔍 Seeding movements for ${items.length} items...`);

  for (const item of items) {
    // Generate 5-10 movements per item for the last 30 days
    const movementCount = Math.floor(Math.random() * 6) + 10; // More data for richer charts
    
    for (let i = 0; i < movementCount; i++) {
      const type = ['in', 'out', 'adjustment'][Math.floor(Math.random() * 3)];
      const qty = Math.floor(Math.random() * 50) + 1;
      const daysAgo = Math.floor(Math.random() * 30);
      const moveDate = new Date(now);
      moveDate.setDate(now.getDate() - daysAgo);

      movements.push({
        item_id: item.id,
        movement_type: type,
        quantity: qty,
        reference_type: type === 'in' ? 'order' : (type === 'out' ? 'batch' : 'adjustment'),
        performed_by: userIds[Math.floor(Math.random() * userIds.length)],
        notes: `Sample ${type} movement for ${item.name}`,
        created_at: moveDate
      });
    }
  }

  // Insert in chunks
  const chunkSize = 100;
  for (let i = 0; i < movements.length; i += chunkSize) {
    await db('inventory_movements').insert(movements.slice(i, i + chunkSize));
  }

  console.log(`✅ Successfully seeded ${movements.length} stock movement records.`);
  process.exit(0);
}

seedMovements().catch(err => {
  console.error(err);
  process.exit(1);
});
