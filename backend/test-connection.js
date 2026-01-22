// Quick database connection test
import { db } from './src/config/database.js';

async function quickTest() {
  try {
    console.log('🔌 Testing Neon PostgreSQL connection...');
    const result = await db.raw('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log('📊 PostgreSQL Version:', result.rows[0].pg_version.split(',')[0]);
    console.log('⏰ Server Time:', result.rows[0].current_time);
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

quickTest();
