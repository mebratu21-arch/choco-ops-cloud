const { Client } = require('pg');
require('dotenv').config();

async function checkSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const result = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position
  `);
  console.log('Users table columns:');
  result.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
  await client.end();
}

checkSchema();
