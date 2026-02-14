import { db } from './src/config/database.js';
import bcrypt from 'bcrypt';

async function testAuth() {
  try {
    const admin = await db('users').where({ email: 'admin@cocoaflow.com' }).first();
    if (!admin) {
        console.log('Admin not found!');
        return;
    }
    
    console.log('Found Admin. Email:', admin.email);
    console.log('Stored Hash:', admin.password_hash);
    
    const passwordToTest = 'admin123';
    console.log('Testing password:', passwordToTest);
    
    const isMatch = await bcrypt.compare(passwordToTest, admin.password_hash);
    console.log('Match result:', isMatch);
    
    if (!isMatch) {
       // Also try with bcryptjs just in case
       try {
           const bcryptjs = (await import('bcryptjs')).default;
           const isMatchJS = await bcryptjs.compare(passwordToTest, admin.password_hash);
           console.log('Match result (bcryptjs):', isMatchJS);
       } catch (e) {
           console.log('bcryptjs not testable');
       }
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await db.destroy();
  }
}

testAuth();
