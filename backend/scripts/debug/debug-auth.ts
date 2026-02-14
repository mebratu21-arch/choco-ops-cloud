import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_URL = 'http://localhost:5002/api';

async function debugAuth() {
  try {
    console.log('0. Checking Server Health...');
    try {
        const health = await axios.get('http://localhost:5002/api/health', { timeout: 2000 });
        console.log('✅ Server is healthy:', health.data);
    } catch (e: any) {
        console.error('❌ Server health check failed:', e.message);
        console.log('⚠️  The backend server might be down or hanging. Please restart it.');
        return;
    }

    console.log('1. Attempting Login (Legacy Endpoint)...');
    // Using the admin user we verified earlier
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@cocoaflow.com',
      password: 'password123' 
    }, { timeout: 5000 });

    console.log('✅ Login successful:', loginRes.status);
    const token = loginRes.data.data.token;
    console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');

    // Decode token locally to see payload
    const decoded = jwt.decode(token);
    console.log('Helper: Decoded Token Payload:', JSON.stringify(decoded, null, 2));

    console.log('\n2. Attempting Access to /api/admin/stats...');
    try {
        const adminRes = await axios.get(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
        });
        console.log('✅ Admin access successful:', adminRes.status);
        console.log('Data:', adminRes.data);
    } catch (err: any) {
        console.error('❌ Admin access failed:', err.response?.status, err.response?.statusText);
        console.error('Response data:', err.response?.data);
    }
    
    console.log('\n3. Checking /api/machines...');
    try {
        const machineRes = await axios.get(`${API_URL}/machines`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
        });
        console.log('✅ Machines access successful:', machineRes.status);
        console.log(`Found ${machineRes.data.data?.length || 0} machines via API.`);
    } catch (err: any) {
        console.error('❌ Machines access failed:', err.response?.status, err.response?.statusText);
    }

    // --- Admin Actions Verification ---
    console.log('\n4. Verifying Admin User Management...');
    let createdUserId = '';
    const newUser = {
        name: 'Test Check User',
        email: `test.check.${Date.now()}@example.com`,
        role: 'OPERATOR',
        status: 'ACTIVE',
        password: 'password123'
    };

    try {
        // Create
        const createRes = await axios.post(`${API_URL}/admin/users`, newUser, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ User created:', createRes.data.data.email);
        createdUserId = createRes.data.data.id;

        // Update
        const updateRes = await axios.put(`${API_URL}/admin/users/${createdUserId}`, {
            name: 'Updated Check User'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ User updated:', updateRes.data.data.name);

        // Toggle
        const toggleRes = await axios.patch(`${API_URL}/admin/users/${createdUserId}/toggle-active`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Status toggled to:', toggleRes.data.data.status);

        // Delete
        const deleteRes = await axios.delete(`${API_URL}/admin/users/${createdUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ User deleted:', deleteRes.data.message);

    } catch (err: any) {
        console.error('❌ Admin Action failed:', err.response?.status, err.response?.data);
    }

  } catch (err: any) {
    console.error('❌ Critical Failure in Debug Script:', err.message);
    if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
    }
  }
}

debugAuth();
