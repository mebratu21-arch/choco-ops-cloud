import axios from 'axios';
import { db } from './src/config/database.js';

const API_URL = 'http://localhost:5002/api';
let adminToken = '';
let createdUserId = '';

async function verifyAdminActions() {
  try {
    console.log('🔹 1. Login as Admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@cocoaflow.com',
      password: 'password123'
    });
    adminToken = loginRes.data.data.token;
    console.log('✅ Login successful.');

    console.log('\n🔹 2. Create User...');
    const newUser = {
        name: 'Test User',
        email: `test.${Date.now()}@example.com`,
        role: 'OPERATOR',
        status: 'ACTIVE',
        password: 'password123'
    };
    try {
        const createRes = await axios.post(`${API_URL}/admin/users`, newUser, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ User created:', createRes.data.data.email);
        createdUserId = createRes.data.data.id;
    } catch (e: any) {
        console.error('❌ Create failed:', e.response?.data || e.message);
        throw e;
    }

    console.log('\n🔹 3. Update User...');
    try {
        const updateRes = await axios.put(`${API_URL}/admin/users/${createdUserId}`, {
            name: 'Updated Test User'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ User updated:', updateRes.data.data.name);
    } catch (e: any) {
        console.error('❌ Update failed:', e.response?.data || e.message);
    }

    console.log('\n🔹 4. Toggle Status...');
    try {
        const toggleRes = await axios.patch(`${API_URL}/admin/users/${createdUserId}/toggle-active`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Status toggled to:', toggleRes.data.data.status);
    } catch (e: any) {
        console.error('❌ Toggle failed:', e.response?.data || e.message);
    }

    console.log('\n🔹 5. Delete User...');
    try {
        const deleteRes = await axios.delete(`${API_URL}/admin/users/${createdUserId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ User deleted:', deleteRes.data.message);
    } catch (e: any) {
        console.error('❌ Delete failed:', e.response?.data || e.message);
    }

    // Verify deletion in DB
    const userInDb = await db('users').where({ id: createdUserId }).first();
    if (!userInDb) {
        console.log('✅ Database confirmed user is gone (Hard Delete).');
    } else {
        console.log('⚠️ User still in database (Soft Delete?).');
    }

  } catch (error: any) {
    console.error('❌ Verification Scenario Failed:', error.message);
    if (error.response) console.error('Response:', error.response.data);
  } finally {
      await db.destroy();
  }
}

verifyAdminActions();
