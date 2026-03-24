import { db } from '../config/database.js';

async function checkDatabase() {
  console.log('🔍 Starting Database Audit...');

  try {
    // 1. Connection Check
    await db.raw('SELECT 1');
    console.log('✅ Database Connection: ACTIVE');

    // 2. Count Rows
    const [users] = await db('users').count('id as count');
    const [inventory] = await db('inventory_items').count('id as count');
    const [machines] = await db('machines').count('id as count');
    const [batches] = await db('production_batches').count('id as count');
    const [recipes] = await db('recipes').count('id as count');

    console.log('\n📊 Data Counts:');
    console.log(`- Users: ${users.count} (Expected: ~8)`);
    console.log(`- Inventory Items: ${inventory.count} (Expected: ~11)`);
    console.log(`- Machines: ${machines.count} (Expected: 3)`);
    console.log(`- Recipes: ${recipes.count} (Expected: 1)`);
    console.log(`- Production Batches: ${batches.count} (Expected: 1)`);

    // 3. Data Integrity Check
    if (Number(users.count) < 1) throw new Error('❌ Users table is empty!');
    if (Number(inventory.count) < 1) throw new Error('❌ Inventory table is empty!');

    console.log('\n✅ Database Layer: VERIFIED');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database Audit FAILED:', error);
    process.exit(1);
  }
}

checkDatabase();
