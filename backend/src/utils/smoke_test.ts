// import { fetch } from 'node:fetch'; // Native fetch is global in Node 18+

const API_URL = 'http://localhost:5002/api';

async function runSmokeTest() {
  console.log('🚀 Starting Smoke Test on ' + API_URL);

  try {
    // 1. Login
    console.log('1. Testing Login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cocoaflow.com',
        password: 'admin123'
      })
    });

    if (!loginRes.ok) {
        const text = await loginRes.text();
        throw new Error(`Login failed: ${loginRes.status} ${text}`);
    }

    const loginData = await loginRes.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));
    // Validating structure before accessing
    const token = loginData.data?.tokens?.accessToken || loginData.data?.token || loginData.token;
    if (!token) throw new Error('No access token received');

    // 2. Inventory
    console.log('2. Testing Inventory...');
    const invRes = await fetch(`${API_URL}/inventory`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!invRes.ok) {
        const text = await invRes.text();
        throw new Error(`Inventory failed: ${invRes.status} ${text}`);
    }
    const invData = await invRes.json();
    console.log('Inventory Response:', JSON.stringify(invData, null, 2));
    
    // Handle potential structures: data.items, or just data array
    const items = invData.data?.items || invData.data || [];
    console.log(`✅ Inventory Loaded: ${items.length} items found`);

    // 3. Dashboard
    console.log('3. Testing Dashboard...');
    const dashRes = await fetch(`${API_URL}/dashboard`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
     if (!dashRes.ok) {
        const text = await dashRes.text();
        throw new Error(`Dashboard failed: ${dashRes.status} ${text}`);
    }
    
    // 4. Recipes
    console.log('4. Testing Recipes...');
    const recipeRes = await fetch(`${API_URL}/recipes`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!recipeRes.ok) {
        const text = await recipeRes.text();
        throw new Error(`Recipes failed: ${recipeRes.status} ${text}`);
    }
    const recipeData = await recipeRes.json();
    console.log('Recipe Response:', JSON.stringify(recipeData, null, 2));
    const recipes = recipeData.data || [];
    console.log(`✅ Recipes Loaded: ${recipes.length} recipes found`);


    console.log('\n🎉 ALL SMOKE TESTS PASSED!');

  } catch (error) {
    console.error('\n❌ SMOKE TEST FAILED:', error);
    process.exit(1);
  }
}

runSmokeTest();
