import { productionService } from './src/services/productionService.js';
import { db } from './src/config/database.js';

async function run() {
  try {
    console.log('--- SERVICE LEVEL DIAGNOSTIC ---');
    
    const recipe = await db('recipes').where('is_active', true).first();
    const user = await db('users').first();
    
    if (!recipe || !user) {
        console.log('Missing test data');
        process.exit();
    }

    console.log(`Testing with Recipe: ${recipe.name}, User: ${user.email}`);

    try {
        const result = await productionService.createBatch(recipe.id, Number(recipe.yield_quantity) || 1, user.id);
        console.log('SUCCESS: createBatch result ID:', result.id);
        
        // Clean up
        await db('production_batches').where({ id: result.id }).del();
        console.log('Cleaned up test batch.');
    } catch (err) {
        console.error('FAILED createBatch:', err.message);
    }

  } catch (err) {
    console.error('DIAGNOSTIC CRASH:', err);
  } finally {
    process.exit();
  }
}
run();
