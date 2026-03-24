import { authService } from './src/services/authService.js';
import { db } from './src/config/database.js';

async function testLogin() {
  try {
    console.log('--- Testing AuthService.login ---');
    const credentials = {
        email: 'admin@cocoaflow.com',
        password: 'admin123'
    };
    
    console.log('Attempting login for:', credentials.email);
    const result = await authService.login(credentials);
    console.log('Login Result: SUCCESS');
    console.log('User Role:', result.user.role);
    console.log('Token generated:', !!result.token);
    
  } catch (error: any) {
    console.log('Login Result: FAILED');
    console.log('Error Message:', error.message);
  } finally {
    await db.destroy();
  }
}

testLogin();
