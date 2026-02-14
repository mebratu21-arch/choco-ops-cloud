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

const recipesData = [
  {
    "id": "REC-2026-001",
    "name": "Midnight Eclipse 85%",
    "description": "An intense, single-origin dark chocolate with notes of roasted coffee and dark berries.",
    "code": "ME-85",
    "ingredients": [
      { "name": "Ecuadorian Cocoa Mass", "amount": 850, "unit": "g" },
      { "name": "Raw Cane Sugar", "amount": 100, "unit": "g" },
      { "name": "Cocoa Butter", "amount": 50, "unit": "g" },
      { "name": "Sea Salt", "amount": 2, "unit": "g" }
    ],
    "category": "Dark Chocolate",
    "prep_time": 4320
  },
  {
    "id": "REC-2026-002",
    "name": "Velvet Cloud Milk",
    "description": "A revolutionary milk chocolate using oat milk technology for a creamy texture without dairy.",
    "code": "VC-MILK",
    "ingredients": [
      { "name": "Cocoa Mass", "amount": 450, "unit": "g" },
      { "name": "Oat Milk Powder", "amount": 250, "unit": "g" },
      { "name": "Refined Sugar", "amount": 200, "unit": "g" },
      { "name": "Vanilla Pod", "amount": 1, "unit": "pc" }
    ],
    "category": "Milk Chocolate",
    "prep_time": 1440
  },
  {
    "id": "REC-2026-003",
    "name": "Ivory Silk Vanilla",
    "description": "Pristine white chocolate infused with Madagascan vanilla bean specks.",
    "code": "IS-VAN",
    "ingredients": [
      { "name": "Deodorized Cocoa Butter", "amount": 350, "unit": "g" },
      { "name": "Whole Milk Powder", "amount": 400, "unit": "g" },
      { "name": "White Sugar", "amount": 250, "unit": "g" },
      { "name": "Vanilla Bean Paste", "amount": 5, "unit": "g" }
    ],
    "category": "White Chocolate",
    "prep_time": 600
  },
  {
    "id": "REC-2026-004",
    "name": "Forest Crunch Hazelnut",
    "description": "Milk chocolate studded with whole roasted Piedmont hazelnuts.",
    "code": "FC-HAZ",
    "ingredients": [
      { "name": "Milk Chocolate Base", "amount": 800, "unit": "g" },
      { "name": "Whole Hazelnuts", "amount": 200, "unit": "g" },
      { "name": "Hazelnut Praline", "amount": 50, "unit": "g" }
    ],
    "category": "Chocolate with Nuts",
    "prep_time": 60
  },
  {
    "id": "REC-2026-005",
    "name": "Solar Flare Orange",
    "description": "Dark chocolate infused with blood orange oil and crystallized ginger.",
    "code": "SF-ORG",
    "ingredients": [
      { "name": "Dark Chocolate 70%", "amount": 900, "unit": "g" },
      { "name": "Blood Orange Oil", "amount": 5, "unit": "ml" },
      { "name": "Crystallized Ginger", "amount": 80, "unit": "g" },
      { "name": "Gold Dust", "amount": 0.5, "unit": "g" }
    ],
    "category": "Chocolate with Fruits",
    "prep_time": 90
  }
];

async function inject() {
  try {
    console.log('🚀 INJECTING ISRAEL 2026 STRATEGIC DATA...');

    // 1. Clean Slate (Use Truncate Cascade to handle all FKs)
    console.log('🧹 Clearing old demo data...');
    await db.raw('TRUNCATE TABLE production_batches, recipes, ingredients RESTART IDENTITY CASCADE');

    // 2. Insert Ingredients
    console.log('📦 Injecting Premium Ingredients...');
    const allIngredients = new Map(); // name -> id
    
    for (const r of recipesData) {
        for (const i of r.ingredients) {
            if (!allIngredients.has(i.name)) {
                const id = uuidv4();
                // Random stock between min and max
                const stock = Math.floor(Math.random() * 5000) + 500;
                await db('ingredients').insert({
                    id,
                    name: i.name,
                    code: `ING-${Math.floor(Math.random()*1000)}`,
                    current_stock: stock,
                    minimum_stock: 200,
                    optimal_stock: 5000,
                    unit: i.unit,
                    cost_per_unit: Math.floor(Math.random() * 50) + 1,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                allIngredients.set(i.name, id);
            }
        }
    }

    // 3. Insert Recipes
    console.log('📜 Injecting Future Recipes...');
    for (const r of recipesData) {
        // We reuse the ID from JSON or generate new UUID if that ID format (REC-2026...) fits schema (string).
        // It fits.
        await db('recipes').insert({
            id: uuidv4(), // Use standard UUID to be safe with any validation regex
            name: r.name,
            code: r.code,
            description: r.description,
            batch_size: 100, // Standardize
            batch_unit: 'kg',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    // 4. Create Active Batches to populate Dashboard
    console.log('🏭 Starting Production Lines...');
    const insertedRecipes = await db('recipes').select('id', 'name');
    
    if (insertedRecipes.length > 0) {
        const statuses = ['COMPLETED', 'IN_PROGRESS', 'PENDING'];
        let batchCount = 1;
        
        for (const recipe of insertedRecipes) {
            // Create 1 batch per recipe for variety
            await db('production_batches').insert({
                id: uuidv4(),
                batch_number: `B-2026-${String(batchCount++).padStart(3, '0')}`,
                recipe_id: recipe.id,
                quantity: 500,
                status: statuses[batchCount % 3], // Rotate statuses
                started_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    }

    console.log('✅ INJECTION COMPLETE. The Factory is upgraded.');

  } catch (e) {
    console.error('❌ Injection Failed:', e);
  } finally {
    db.destroy();
  }
}

inject();
