async function testApiLogin() {
  try {
    const credentials = {
      email: 'admin@cocoaflow.com',
      password: 'admin123'
    };
    
    console.log('Sending login request to http://127.0.0.1:5003/api/auth/login');
    const response = await fetch('http://127.0.0.1:5003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log('Status:', status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
  } catch (error: any) {
    console.error('API Test Error:', error.message);
  }
}

testApiLogin();
