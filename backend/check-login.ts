import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 1, max: 1 }
});

async function checkLogin() {
  console.log('--- LOGIN DEBUG START ---');
  try {
    const email = 'admin@chocoops.com';
    const password = 'password';

    console.log(`Finding user: ${email}`);
    const user = await db('users').where({ email }).first();

    if (!user) {
      console.log('User NOT FOUND');
      return;
    }
    console.log('User found:', user.id, user.role);
    console.log('Has password_hash:', user.password_hash !== undefined);
    
    if (!user.password_hash) {
        console.error('User has NO password_hash');
        return;
    }

    console.log('Verifying password...');
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValid);

    if (!isValid) return;

    console.log('Generating tokens...');
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    console.log('Access token generated');

    // Simulate Audit Log (potential failure point)
    console.log('Simulating Audit Log...');
    try {
        await db('audit_logs').insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            action: 'USER_LOGIN',
            entity_type: 'auth',
            details: JSON.stringify({ ip: '127.0.0.1' }),
            created_at: new Date()
        });
        console.log('Audit log inserted');
    } catch (auditErr: any) {
        console.error('Audit Log FAILED:', auditErr.message);
        // AuthController usually catches this? No, AuthController.login catches and logs "Login error".
    }

    console.log('Login logic completed successfully');

  } catch (error: any) {
    console.error('CRITICAL ERROR:', error);
  } finally {
    await db.destroy();
    console.log('--- LOGIN DEBUG END ---');
  }
}

checkLogin();
