import { db } from '../config/database.js';

async function checkAllTables() {
  console.log('🔍 Checking for empty tables...');
  
  // List of tables known from seed
  const tables = [
    'users', 'inventory_items', 'machines', 'recipes', 
    'production_batches', 'qc_checks', 'sos_alerts', 'maintenance_logs',
    'tasks', 'announcements', 'audit_logs', 'orders'
  ];

  for (const table of tables) {
    try {
      const [res] = await db(table).count('id as count');
      const count = Number(res.count);
      console.log(`${count === 0 ? '❌' : '✅'} ${table}: ${count} rows`);
    } catch (e) {
      console.log(`⚠️ ${table}: Error checking (Table might not exist)`);
    }
  }
  process.exit(0);
}

checkAllTables();
