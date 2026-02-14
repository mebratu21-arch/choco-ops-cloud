import { db } from './src/config/database.js';

async function checkUsers() {
  try {
    const users = await db('users').select('id', 'email', 'role', 'is_active');
    console.log('--- Registered Users ---');
    console.table(users);
    
    const admin = await db('users').where({ email: 'admin@cocoaflow.com' }).first();
    if (admin) {
        console.log('\nAdmin user found!');
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('Is Active:', admin.is_active);
        console.log('Hash exists:', !!admin.password_hash);
    } else {
        console.log('\nAdmin user NOT found!');
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await db.destroy();
  }
}

checkUsers();
