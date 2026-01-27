import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

async function seed() {
  try {
    console.log('Seeding demo data...');

    // 1. Ingredients
    console.log('Inserting Ingredients...');
    const ingredients = [
        { id: uuidv4(), name: 'Cocoa Beans (Ecuador)', code: 'ING-001', current_stock: 5000, minimum_stock: 1000, optimal_stock: 10000, unit: 'kg', cost_per_unit: 12.5, is_active: true, created_at: new Date(), updated_at: new Date() },
        { id: uuidv4(), name: 'Cocoa Butter', code: 'ING-002', current_stock: 200, minimum_stock: 500, optimal_stock: 2000, unit: 'kg', cost_per_unit: 18.0, is_active: true, created_at: new Date(), updated_at: new Date() }, // Low Stock
        { id: uuidv4(), name: 'Cane Sugar', code: 'ING-003', current_stock: 8000, minimum_stock: 2000, optimal_stock: 15000, unit: 'kg', cost_per_unit: 1.2, is_active: true, created_at: new Date(), updated_at: new Date() },
        { id: uuidv4(), name: 'Milk Powder', code: 'ING-004', current_stock: 1500, minimum_stock: 1000, optimal_stock: 5000, unit: 'kg', cost_per_unit: 4.5, is_active: true, created_at: new Date(), updated_at: new Date() },
        { id: uuidv4(), name: 'Vanilla Extract', code: 'ING-005', current_stock: 50, minimum_stock: 20, optimal_stock: 100, unit: 'L', cost_per_unit: 45.0, is_active: true, created_at: new Date(), updated_at: new Date() },
    ];
    
    // Check existing
    const existingIng = await db('ingredients').count('* as count').first();
    if (Number(existingIng?.count) === 0) {
         await db('ingredients').insert(ingredients);
    }

    // 2. Recipes
    console.log('Inserting Recipes...');
    const recipes = [
        { id: uuidv4(), name: 'Dark Chocolate 70%', code: 'REC-001', description: 'Premium dark chocolate with 70% cocoa content from Ecuador beans.', batch_size: 1000, batch_unit: 'kg', is_active: true, created_at: new Date(), updated_at: new Date() },
        { id: uuidv4(), name: 'Milk Chocolate 45%', code: 'REC-002', description: 'Creamy milk chocolate with high milk solids.', batch_size: 1000, batch_unit: 'kg', is_active: true, created_at: new Date(), updated_at: new Date() },
        { id: uuidv4(), name: 'White Chocolate Vanilla', code: 'REC-003', description: 'Sweet white chocolate infused with real vanilla.', batch_size: 500, batch_unit: 'kg', is_active: true, created_at: new Date(), updated_at: new Date() },
    ];

    const existingRec = await db('recipes').count('* as count').first();
    if (Number(existingRec?.count) === 0) {
         await db('recipes').insert(recipes);
    }
    
    // 3. Batches
    console.log('Inserting Batches...');
    // Fetch recipe IDs for reference
    const dbRecipes = await db('recipes').select('id', 'name');
    
    if (dbRecipes.length > 0) {
        const batches = [
            { id: uuidv4(), batch_number: 'B-2026-001', recipe_id: dbRecipes[0].id, quantity: 1000, status: 'COMPLETED', started_at: new Date(Date.now() - 86400000 * 2), completed_at: new Date(Date.now() - 86400000), created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), batch_number: 'B-2026-002', recipe_id: dbRecipes[1].id, quantity: 500, status: 'IN_PROGRESS', started_at: new Date(), created_at: new Date(), updated_at: new Date() },
             { id: uuidv4(), batch_number: 'B-2026-003', recipe_id: dbRecipes[0].id, quantity: 1000, status: 'PENDING', created_at: new Date(), updated_at: new Date() },
        ];
        
        const existingBatch = await db('production_batches').count('* as count').first();
        if (Number(existingBatch?.count) === 0) {
             await db('production_batches').insert(batches);
        }
    }

    console.log('Seeding complete.');

  } catch (e) {
    console.error(e);
  } finally {
    db.destroy();
  }
}
seed();
