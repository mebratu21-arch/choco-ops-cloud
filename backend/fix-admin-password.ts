import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables robustly
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 1, max: 1 }
});

async function fixPassword() {
  try {
    const email = 'admin@chocoops.com';
    const newPassword = 'password';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`Fixing password for: ${email}`);

    // Check columns first
    const user = await db('users').where({ email }).first();
    if (!user) {
        console.error('User not found. Creating user...');
        // Insert if missing
        await db('users').insert({
            id: crypto.randomUUID(),
            email,
            password: hashedPassword,
            role: 'ADMIN',
            name: 'Admin User',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        });
        console.log('User created with password column.');
        return;
    }

    console.log('Current user keys:', Object.keys(user));

    if ('password' in user) {
        await db('users').where({ email }).update({ password: hashedPassword });
        console.log('Updated "password" column.');
    } else if ('password_hash' in user) {
        await db('users').where({ email }).update({ password_hash: hashedPassword });
        console.log('Updated "password_hash" column.');
    } else {
        console.error('No password column found!');
    }

  } catch (error) {
    console.error('DB Error:', error);
  } finally {
    await db.destroy();
  }
}

fixPassword();
