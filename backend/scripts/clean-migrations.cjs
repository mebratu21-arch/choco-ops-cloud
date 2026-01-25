// Clean migration state and run fresh migrations
const { Client } = require('pg');
require('dotenv').config();

async function cleanAndMigrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon PostgreSQL');

    // Drop all tables in reverse dependency order
    console.log('🗑️  Dropping all existing tables...');
    
    const tables = [
      'online_orders',
      'employee_sales',
      'refresh_tokens',
      'audit_logs',
      'quality_checks',
      'batch_ingredients',
      'batches',
      'recipe_ingredients',
      'recipes',
      'ingredients',
      'suppliers',
      'users',
      'knex_migrations',
      'knex_migrations_lock'
    ];
    
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`  ✓ Dropped ${table}`);
      } catch (err) {
        // Ignore errors for non-existent tables
      }
    }
    
    console.log('✅ All tables dropped successfully');
    console.log('\n📊 Now run: npm run migrate:latest');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanAndMigrate();
