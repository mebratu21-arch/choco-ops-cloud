import { db } from './src/config/database.js';

async function checkTables() {
  try {
    const tablesToCheck = [
      'products',
      'shop_orders',
      'shop_order_items',
      'equipment',
      'maintenance_logs',
      'alerts',
      'chat_history'
    ];

    console.log('Checking tables in database...\n');

    for (const table of tablesToCheck) {
      const exists = await db.schema.hasTable(table);
      console.log(`${table}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }

    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTables();
