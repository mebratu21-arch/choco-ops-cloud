import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

async function verify() {
  console.log('\n=== 🔍 CROSS-CHECK RESULTS ===\n');

  const tables = ['ingredients', 'recipes', 'production_batches', 'users'];

  for (const table of tables) {
    try {
        const rows = await db(table).select('*');
        console.log(`\n📋 TABLE: ${table.toUpperCase()} (${rows.length} rows)`);
        if (rows.length > 0) {
            // Print only first 3 rows to avoid clutter, and selected columns if possible
            const displayRows = rows.slice(0, 5).map(r => {
                // Simplify for table view
                const simple = { ...r };
                delete simple.created_at;
                delete simple.updated_at;
                delete simple.password_hash;
                return simple;
            });
            console.table(displayRows);
        } else {
            console.log('   (Empty)');
        }
    } catch (e: any) {
        console.log(`❌ ERROR querying ${table}:`, e.message);
    }
  }
  console.log('\n==============================\n');
  db.destroy();
}
verify();
