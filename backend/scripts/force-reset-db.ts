
import knex from 'knex';
import config from '../knexfile';

const db = knex(config.development);

async function forceReset() {
  console.log('Force resetting database...');
  
  try {
    // Dynamic drop of all tables in public schema
    const result = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    const tables = result.rows.map((row: any) => row.table_name);
    
    if (tables.length > 0) {
      console.log(`Found ${tables.length} tables to drop:`, tables.join(', '));
      // Disable constraints temporarily or just use CASCADE
      for (const table of tables) {
        await db.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      }
    } else {
      console.log('No tables found to drop.');
    }

    console.log('All tables dropped successfully.');
  } catch (error) {
    console.error('Error dropping tables:', error);
  } finally {
    await db.destroy();
  }
}

forceReset();
