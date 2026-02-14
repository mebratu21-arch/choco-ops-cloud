import dotenv from 'dotenv';
import knex from 'knex';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin exists
    const existing = await db('users').where({ email: 'admin@chocoops.com' }).first();
    if (existing) {
      console.log('Admin user already exists');
      await db.destroy();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Create admin user
    await db('users').insert({
      id: uuidv4(),
      email: 'admin@chocoops.com',
      password_hash: hashedPassword,
      role: 'admin',
      full_name: 'System Administrator',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@choco.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await db.destroy();
  }
}

createAdminUser();
