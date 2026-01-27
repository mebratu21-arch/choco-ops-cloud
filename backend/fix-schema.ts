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

    console.log('Schema fixed successfully.');

  } catch (e) {
    console.error(e);
  } finally {
    db.destroy();
  }
}
fixSchema();
