import { db } from './src/config/database.js';
import bcrypt from 'bcryptjs';

async function checkAndCreateUser() {
  try {
    // Check existing users
    const users = await db('users').select('*');
    console.log(`\n📊 Found ${users.length} users in database\n`);

    if (users.length > 0) {
      console.log('Existing users:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });
    }

    // Create a test admin user if no users exist
    if (users.length === 0) {
      console.log('\n🔧 Creating test admin user...\n');

      const hashedPassword = await bcrypt.hash('admin123', 10);

      await db('users').insert({
        email: 'admin@chocoops.com',
        password: hashedPassword,
        full_name: 'Admin User',
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      });

      console.log('✅ Test admin user created!');
      console.log('\nLogin credentials:');
      console.log('  Email: admin@chocoops.com');
      console.log('  Password: admin123\n');
    } else {
      console.log('\n💡 Use one of the existing accounts to login\n');
    }

    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await db.destroy();
    process.exit(1);
  }
}

checkAndCreateUser();
