import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

async function debugBatchCreation() {
  try {
    // 1. Login
    console.log('🔹 1. Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@cocoaflow.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log('✅ Login successful.');

    // 2. Fetch Recipes
    console.log('\n🔹 2. Fetching Recipes...');
    const recipesRes = await axios.get(`${API_URL}/recipes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Handle different response structures
    const recipes = recipesRes.data.data?.recipes || recipesRes.data.data || [];
    
    if (!recipes || recipes.length === 0) {
        console.error('❌ No recipes found! Cannot test batch creation.');
        console.log('Recipe Response:', JSON.stringify(recipesRes.data, null, 2));
        return;
    }
    const targetRecipe = recipes[0];
    console.log(`✅ Found recipe: ${targetRecipe.name} (ID: ${targetRecipe.id})`);

    // 3. Create Batch
    console.log('\n🔹 3. Creating Batch...');
    const payload = {
        recipeId: targetRecipe.id,
        targetQuantity: 50,
        notes: 'Debug Batch Test'
    };
    console.log('Payload:', payload);

    try {
        const batchRes = await axios.post(`${API_URL}/batches`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Batch Created Successfully!');
        console.log('Batch ID:', batchRes.data.data.id);
        console.log('Batch Number:', batchRes.data.data.batch_number);
    } catch (createErr: any) {
        console.error('❌ Batch Creation Failed!');
        console.error('Status:', createErr.response?.status);
        console.error('Data:', JSON.stringify(createErr.response?.data, null, 2));
    }

  } catch (err: any) {
    console.error('❌ Script Failed:', err.message);
    if (err.response) console.error('Response:', err.response.data);
  }
}

debugBatchCreation();
