import { db } from './src/config/database.js';
async function check() {
  try {
    const user = await db('users').where({ email: 'admin@cocoaflow.com' }).first();
    if (user) {
      console.log('User found:', user.email);
    } else {
      console.log('User NOT found: admin@cocoaflow.com');
      const allUsers = await db('users').select('email');
      console.log('Available users:', allUsers.map(u => u.email));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
