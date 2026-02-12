import { authService } from './src/services/authService.js';
async function testLogin() {
  try {
    const result = await authService.login({
      email: 'admin@cocoaflow.com',
      password: 'admin123'
    });
    console.log('Login successful! Welcome', result.user.full_name);
    process.exit(0);
  } catch (err: any) {
    console.error('Login failed:', err.message);
    process.exit(1);
  }
}
testLogin();
