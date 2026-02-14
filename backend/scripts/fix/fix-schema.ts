import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

async function fixSchema() {
  try {
    console.log('Fixing schema...');

    // Recipes
    const hasRecipes = await db.schema.hasTable('recipes');
    if (hasRecipes) {
        console.log('Checking recipes columns...');
        const cols = ['status', 'image_url', 'difficulty', 'prep_time'];
        for (const col of cols) {
            if (!(await db.schema.hasColumn('recipes', col))) {
                console.log(`Adding ${col} to recipes...`);
                await db.schema.alterTable('recipes', t => t.string(col).nullable());
            }
        }
    }

    // Suppliers
    const hasSuppliers = await db.schema.hasTable('suppliers');
    if (hasSuppliers) {
        console.log('Checking suppliers columns...');
        const cols = ['contact_name', 'contact_email', 'phone', 'address', 'status'];
        for (const col of cols) {
            if (!(await db.schema.hasColumn('suppliers', col))) {
                console.log(`Adding ${col} to suppliers...`);
                await db.schema.alterTable('suppliers', t => t.string(col).nullable());
            }
        }
    }

    // Ingredients
    const hasIngredients = await db.schema.hasTable('ingredients');
    if (hasIngredients) {
        console.log('Checking ingredients columns...');
        const cols = ['category', 'unit', 'cost_per_unit', 'stock_quantity', 'current_stock', 'minimum_stock', 'optimal_stock', 'supplier_id', 'sku'];
        for (const col of cols) {
            if (!(await db.schema.hasColumn('ingredients', col))) {
                console.log(`Adding ${col} to ingredients...`);
                if (col === 'cost_per_unit') {
                    await db.schema.alterTable('ingredients', t => t.decimal(col, 10, 2).nullable());
                } else if (col === 'stock_quantity' || col === 'current_stock' || col === 'minimum_stock' || col === 'optimal_stock') {
                    await db.schema.alterTable('ingredients', t => t.integer(col).nullable());
                } else if (col === 'supplier_id') {
                    await db.schema.alterTable('ingredients', t => t.uuid(col).nullable());
                } else {
                    await db.schema.alterTable('ingredients', t => t.string(col).nullable());
                }
            }
        }
    }

    // Refresh Tokens
    const hasRefresh = await db.schema.hasTable('refresh_tokens');
    if (!hasRefresh) {
        console.log('Creating refresh_tokens table...');
        await db.schema.createTable('refresh_tokens', (table) => {
            table.uuid('id').primary();
            table.string('token').notNullable().index();
            table.uuid('user_id').index(); // Foreign key to users
            table.timestamp('expires_at').notNullable();
            table.timestamp('created_at').defaultTo(db.fn.now());
        });
    } else {
        console.log('refresh_tokens table exists.');
    }

    // Audit Logs
    const hasAudit = await db.schema.hasTable('audit_logs');
    if (!hasAudit) {
        console.log('Creating audit_logs table...');
        await db.schema.createTable('audit_logs', (table) => {
            table.uuid('id').primary();
            table.uuid('user_id').nullable().index();
            table.string('action').notNullable().index();
            table.string('resource').notNullable(); // Matches Audit.ts
            table.string('entity_type').nullable(); // Matches AuditRepository usage (legacy?)
            table.uuid('resource_id').nullable();
            table.string('entity_id').nullable();
            table.jsonb('details').nullable();
            table.timestamp('created_at').defaultTo(db.fn.now());
        });
    } else {
        console.log('audit_logs table exists.');
        // Check columns
        const hasResource = await db.schema.hasColumn('audit_logs', 'resource');
        if (!hasResource) {
             console.log('Adding resource column to audit_logs...');
             await db.schema.alterTable('audit_logs', t => t.string('resource').nullable());
        }
    }

    // Batches
    const hasBatches = await db.schema.hasTable('batches');
    if (hasBatches) {
        console.log('Checking batches columns...');
        const hasTQ = await db.schema.hasColumn('batches', 'target_quantity');
        if (!hasTQ) {
            console.log('Adding target_quantity to batches...');
            await db.schema.alterTable('batches', t => t.integer('target_quantity').nullable());
        }
        const hasAQ = await db.schema.hasColumn('batches', 'actual_quantity');
        if (!hasAQ) {
            console.log('Adding actual_quantity to batches...');
            await db.schema.alterTable('batches', t => t.integer('actual_quantity').nullable());
        }
    }

    console.log('Schema fixed successfully.');

  } catch (e) {
    console.error(e);
  } finally {
    db.destroy();
  }
}
fixSchema();
