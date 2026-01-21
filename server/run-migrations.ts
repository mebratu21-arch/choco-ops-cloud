/**
 * Custom migration runner to bypass Knex CLI issues
 */
import knex from 'knex';
import config from './knexfile';

const db = knex(config.development);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    const [batchNo, migrationsList] = await db.migrate.latest();
    
    if (migrationsList.length === 0) {
      console.log('Already up to date!');
    } else {
      console.log(`Batch ${batchNo} run: ${migrationsList.length} migrations`);
      migrationsList.forEach((file) => console.log(`   - ${file}`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();
