import { db } from './src/config/database.js';
import bcrypt from 'bcryptjs';

async function setAdminPassword() {
  try {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update admin user password
    const updated = await db('users')
      .where('email', 'admin@chocoops.com')
      .update({
        password: hashedPassword,
        updated_at: new Date()
      });

    if (updated) {
      console.log('\n✅ Admin password updated successfully!\n');
      console.log('Login credentials:');
      console.log('  Email: admin@chocoops.com');
      console.log('  Password: admin123\n');
    } else {
      console.log('\n❌ User not found\n');
    }

    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await db.destroy();
    process.exit(1);
  }
}

setAdminPassword();
