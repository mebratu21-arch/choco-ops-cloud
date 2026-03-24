import { Client } from 'pg';
import { hash } from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function resetAdmin() {
    console.log('Connecting to DB...');
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Neon sometimes if CA is not set
    });

    try {
        await client.connect();
        console.log('✅ Connected.');

        const hashedPassword = await hash('password123', 10);
        
        // Update password
        const res = await client.query(
            `UPDATE users SET password = $1, status = 'active', is_active = true WHERE email = $2 RETURNING id`,
            [hashedPassword, 'admin@cocoaflow.com']
        );

        if (res.rowCount === 0) {
            console.log('⚠️ Admin user not found. Inserting...');
            // Insert logic if needed, but admin should exist.
            await client.query(
                `INSERT INTO users (id, email, password, full_name, role, status, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                ['550e8400-e29b-41d4-a716-446655440000', 'admin@cocoaflow.com', hashedPassword, 'System Admin', 'admin', 'active', true]
            );
            console.log('✅ Admin user created.');
        } else {
            console.log('✅ Admin password updated.');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

resetAdmin();
