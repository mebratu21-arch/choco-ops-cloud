import knex from 'knex';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

async function run() {
  try {
    const batches = await db('production_batches')
      .orderBy('created_at', 'desc')
      .limit(10)
      .select('id', 'batch_number', 'recipe_id', 'status', 'created_at');
    
    fs.writeFileSync('batches_probe.json', JSON.stringify(batches, null, 2));
    console.log('Written batches_probe.json');
  } catch (err) {
    fs.writeFileSync('batches_probe_error.txt', err.stack);
  } finally {
    process.exit();
  }
}
run();
