import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

async function fix() {
  try {
    console.log('Altering refresh_tokens.token to TEXT...');
    await db.schema.alterTable('refresh_tokens', t => {
        t.text('token').alter();
    });
    console.log('Done.');
    
    // Also check audit logs details column type (should be jsonb or text)
    // ensure audit logs exists
  } catch (e) {
    console.error(e);
  } finally {
    db.destroy();
  }
}
fix();
