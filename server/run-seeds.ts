/**
 * Custom seed runner
 */
import knex from 'knex';
import config from './knexfile';

const db = knex(config.development);

async function runSeeds() {
  try {
    console.log('Running seeds...');
    
    const seedsList = await db.seed.run();
    
    console.log(`Executed ${seedsList[0].length} seed files`);
    seedsList[0].forEach((file) => console.log(`   - ${file}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runSeeds();
