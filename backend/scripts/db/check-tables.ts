
import knex from 'knex';
import config from '../knexfile';

const db = knex(config.development);

async function checkTables() {
  console.log('Checking tables...');
  try {
    const result = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', result.rows.map((r: any) => r.table_name));
  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

checkTables();
