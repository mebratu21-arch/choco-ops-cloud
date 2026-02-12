import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('📉 Seeding Inventory Movements for Analysis...');

  // 1. Get all inventory items
  const items = await knex('inventory_items').select('id', 'name');
  
  // 2. Get some users to attribute movements to
  const users = await knex('users').select('id').limit(3);
  const userIds = users.map(u => u.id);

  if (items.length === 0 || userIds.length === 0) {
    console.log('⚠️ No items or users found. Skipping movement seeding.');
    return;
  }

  const movements = [];
  const now = new Date();

  for (const item of items) {
    // Generate 5-10 movements per item for the last 30 days
    const movementCount = Math.floor(Math.random() * 6) + 5;
    
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

  // Insert in chunks to avoid overwhelming the DB
  const chunkSize = 100;
  for (let i = 0; i < movements.length; i += chunkSize) {
    await knex('inventory_movements').insert(movements.slice(i, i + chunkSize));
  }

  console.log(`✅ Successfully seeded ${movements.length} stock movement records.`);
}
