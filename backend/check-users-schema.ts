import { db } from './src/config/database.js';

async function checkSchema() {
  try {
    // Get table columns
    const columns = await db.raw(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Users table schema:\n');
    columns.rows.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Get a sample user to see actual fields
    const sampleUser = await db('users').first();
    console.log('\n📄 Sample user object:\n');
    console.log(sampleUser);

    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await db.destroy();
    process.exit(1);
  }
}

checkSchema();
