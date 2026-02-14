import { hash } from 'bcryptjs';
import knex from 'knex';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Handling __dirname in ESM if needed, or just use absolute path logic
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not Loaded');

// Import knex config manually to avoid import issues
const config = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'cocoaflow_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  pool: { min: 2, max: 10 },
  migrations: {
    extension: 'ts',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

const db = knex(config);

async function resetAdmin() {
  try {
    console.log('Resetting admin password to "password123"...');
    const hashedPassword = await hash('password123', 10);
    
    // Check if admin exists
    const admin = await db('users').where({ email: 'admin@cocoaflow.com' }).first();
    if (!admin) {
        console.log('Admin user not found. Creating...');
        await db('users').insert({
            id: '550e8400-e29b-41d4-a716-446655440000', // standard admin uuid if possible
            email: 'admin@cocoaflow.com',
            password: hashedPassword,
            full_name: 'System Admin',
            role: 'admin',
            status: 'active',
            is_active: true
        });
    } else {
        await db('users').where({ email: 'admin@cocoaflow.com' }).update({ 
            password: hashedPassword,
            status: 'active',
            is_active: true
        });
    }
    console.log('✅ Admin password reset successfully.');
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    await db.destroy();
  }
}

resetAdmin();
