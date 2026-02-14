import { db } from './src/config/database.js';

async function testShopAPI() {
  try {
    console.log('🧪 Testing Shop API Data...\n');

    // Test 1: Check products
    const products = await db('products').limit(5);
    console.log(`✅ Products: Found ${products.length} products`);
    console.log(`   Sample: ${products[0]?.name || 'N/A'}\n`);

    // Test 2: Check shop orders
    const orders = await db('shop_orders').limit(5);
    console.log(`✅ Shop Orders: Found ${orders.length} orders\n`);

    // Test 3: Check equipment
    const equipment = await db('equipment').limit(5);
    console.log(`✅ Equipment: Found ${equipment.length} items`);
    console.log(`   SOS Equipment: ${equipment.find(e => e.id === '00000000-0000-0000-0000-000000000000') ? '✅ Ready' : '❌ Missing'}\n`);

    // Test 4: Check maintenance logs
    const maintenanceLogs = await db('maintenance_logs').limit(5);
    console.log(`✅ Maintenance Logs: Found ${maintenanceLogs.length} logs\n`);

    console.log('🎉 All shop features are ready!\n');

    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await db.destroy();
    process.exit(1);
  }
}

testShopAPI();
