import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

async function run() {
  try {
    console.log('--- FINAL DIAGNOSTIC ---');
    
    const recipes = await db('recipes').select('*').limit(1);
    console.log('Recipe count:', recipes.length);
    if (recipes.length > 0) {
        console.log('First Recipe:', recipes[0].name, 'Yield:', recipes[0].yield_quantity);
    }

    const inventory = await db('inventory_items').select('*').limit(1);
    console.log('Inventory count:', inventory.length);
    if (inventory.length > 0) {
        console.log('First Item:', inventory[0].name, 'Qty:', inventory[0].quantity);
    }

    const users = await db('users').select('*').limit(1);
    console.log('Users count:', users.length);

    console.log('--- TEST TRANSACTION ---');
    if (recipes.length > 0 && users.length > 0) {
        await db.transaction(async (trx) => {
            const batchNum = 'DIAG-BATCH-' + Date.now();
            const [batch] = await trx('production_batches').insert({
                batch_number: batchNum,
                recipe_id: recipes[0].id,
                status: 'pending',
                target_quantity: recipes[0].yield_quantity || 1,
                started_by: users[0].id,
                started_at: new Date()
            }).returning('*');
            console.log('SUCCESS: Insert works. ID:', batch.id);
            throw new Error('ROLLBACK');
        });
    }

  } catch (err) {
    if (err.message === 'ROLLBACK') {
        console.log('Transaction verified.');
    } else {
        console.error('DIAGNOSTIC FAILED:', err);
    }
  } finally {
    process.exit();
  }
}
run();
