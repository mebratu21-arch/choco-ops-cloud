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
    console.log('Checking refresh_tokens...');
    const hasToken = await db.schema.hasColumn('refresh_tokens', 'token');
    if (!hasToken) {
        console.log('Adding token column...');
        await db.schema.alterTable('refresh_tokens', t => {
            t.text('token').notNullable().defaultTo('placeholder'); 
            // Default needed for existing rows, though we can make it nullable first or delete rows.
            // Safest: Delete rows first since tokens are transient.
        });
        console.log('Added token column.');
    } else {
        console.log('Token column matches.');
    }
  } catch (e: any) {
    if (e.message && e.message.includes('NOT NULL')) {
         console.log('Trying to clear table and add column...');
         await db('refresh_tokens').del();
         await db.schema.alterTable('refresh_tokens', t => {
            t.text('token').notNullable();
        });
    }
    console.error(e);
  } finally {
    db.destroy();
  }
}
fix();
