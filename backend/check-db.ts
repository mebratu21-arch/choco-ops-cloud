import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables robustly
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log(`[DEBUG] Loading .env from: ${envPath}`);
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing');
  process.exit(1);
}

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 1, max: 1 }
});

async function check() {
  try {
    console.log('Connecting to DB...');
    const tables = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Tables found:', tables.rows.map((r: any) => r.table_name));

    if (tables.rows.find((r: any) => r.table_name === 'users')) {
      const tablesToCheck = ['users', 'recipes', 'ingredients', 'production_batches', 'audit_logs'];

      for (const table of tablesToCheck) {
        try {
          const count = await db(table).count('* as count').first();
          console.log(`${table}: ${count?.count}`);
        } catch (e) {
          console.log(`${table}: NOT FOUND or ERROR`);
        }
      }
    }
  } catch (error) {
    console.error('DB Error:', error);
  } finally {
    await db.destroy();
  }
}

check();
