import { db } from './src/config/database.js';
import bcrypt from 'bcryptjs';

async function resetAdmin() {
  try {
    const email = 'admin@cocoaflow.com';
    console.log(`Resetting password for ${email}...`);
    
    const user = await db('users').where({ email }).first();
    if (!user) {
        console.error('❌ User not found!');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db('users').where({ email }).update({ password: hashedPassword });
    
    console.log('✅ Password reset to: admin123');
    await db.destroy();
  } catch (err) {
    console.error(err);
    await db.destroy();
  }
}

resetAdmin();
