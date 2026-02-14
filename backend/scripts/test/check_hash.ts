import { db } from './src/config/database.js';
import bcrypt from 'bcrypt';

async function checkHash() {
  try {
    const user = await db('users').where({ email: 'admin@cocoaflow.com' }).first();
    if (user) {
      console.log('User found:', user.email);
      const isMatch = await bcrypt.compare('admin123', user.password_hash);
      console.log('Password "admin123" matches hash?', isMatch);
      console.log('Hash:', user.password_hash);
    } else {
      console.log('User NOT found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkHash();
