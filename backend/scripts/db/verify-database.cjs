// Database verification script
const { Client } = require('pg');
require('dotenv').config();

async function verifyDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon PostgreSQL\n');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 Database Tables:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    // Get row counts
    console.log('\n📈 Row Counts:');
    for (const row of tablesResult.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      console.log(`   ${row.table_name}: ${countResult.rows[0].count} rows`);
    }

    // Test sample queries
    console.log('\n🔍 Sample Data Verification:');
    
    const users = await client.query('SELECT email, role FROM users ORDER BY email');
    console.log(`\n   Users (${users.rows.length}):`);
    users.rows.forEach(u => console.log(`     - ${u.email} (${u.role})`));

    const batches = await client.query('SELECT status, COUNT(*) as count FROM batches GROUP BY status');
    console.log(`\n   Batches by Status:`);
    batches.rows.forEach(b => console.log(`     - ${b.status}: ${b.count}`));

    const ingredients = await client.query('SELECT name, current_stock, unit FROM ingredients ORDER BY name');
    console.log(`\n   Ingredients (${ingredients.rows.length}):`);
    ingredients.rows.forEach(i => console.log(`     - ${i.name}: ${i.current_stock} ${i.unit}`));

    console.log('\n✅ Database verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyDatabase();
