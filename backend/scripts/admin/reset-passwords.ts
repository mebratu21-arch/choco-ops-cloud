import { db } from './src/config/database.js';
import bcrypt from 'bcryptjs';

async function resetPasswords() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    console.log('New hash:', hash);
    
    const updated = await db('users')
      .update({ password_hash: hash })
      .whereIn('email', [
        'admin@chocoops.com',
        'manager@chocoops.com',
        'worker@chocoops.com',
        'warehouse@chocoops.com',
        'mechanic@chocoops.com',
        'qc@chocoops.com'
      ]);
    
    console.log(`Updated ${updated} users with new password hash`);
    console.log('All users can now login with: password123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetPasswords();
