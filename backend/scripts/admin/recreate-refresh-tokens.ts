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
    console.log('Dropping refresh_tokens table...');
    await db.schema.dropTableIfExists('refresh_tokens');
    
    console.log('Re-creating refresh_tokens table...');
    await db.schema.createTable('refresh_tokens', (table) => {
        table.uuid('id').primary();
        table.text('token').notNullable().index(); // use text for long tokens
        table.uuid('user_id').index();
        table.timestamp('expires_at').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Done.');
  } catch (e) {
    console.error(e);
  } finally {
    db.destroy();
  }
}
fix();
