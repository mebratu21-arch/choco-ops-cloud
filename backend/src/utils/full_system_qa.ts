// import { fetch } from 'node:fetch';

const API_URL = 'http://localhost:5002/api';

const USERS = [
    { role: 'admin', email: 'admin@cocoaflow.com', pass: 'admin123' },
    { role: 'manager', email: 'manager@cocoaflow.com', pass: 'manager123' },
    { role: 'production_worker', email: 'worker@cocoaflow.com', pass: 'worker123' },
    { role: 'quality_controller', email: 'qc@cocoaflow.com', pass: 'qc123' },
    { role: 'mechanic', email: 'mechanic@cocoaflow.com', pass: 'mechanic123' }
];

async function runQATest() {
    console.log('🧪 Starting Full System QA Test...\n');

    for (const user of USERS) {
        console.log(`👤 Testing Role: ${user.role.toUpperCase()}`);
        try {
            // 1. Login
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, password: user.pass })
            });

            if (!loginRes.ok) throw new Error(`Login Failed: ${loginRes.status}`);
            const loginData = await loginRes.json();
            const token = loginData.data?.tokens?.accessToken || loginData.data?.token;

            if (!token) throw new Error('No Token Received');
            console.log('   ✅ Login Success');

            const headers = { 'Authorization': `Bearer ${token}` };

            // 2. Role-Specific Tests
            if (user.role === 'admin' || user.role === 'manager') {
                await checkEndpoint(headers, '/dashboard', 'Dashboard Stats');
                await checkEndpoint(headers, '/manager/tasks', 'Task List');
                await checkEndpoint(headers, '/manager/announcements', 'Announcements');
            }

            if (user.role === 'production_worker') {
                await checkEndpoint(headers, '/production/kpis', 'Production KPIs');
                // await checkEndpoint(headers, '/production/active-batches', 'Active Batches');
                await checkEndpoint(headers, '/inventory', 'Inventory Access');
            }

            if (user.role === 'quality_controller') {
                await checkEndpoint(headers, '/qc/stats', 'QC Stats');
                await checkEndpoint(headers, '/qc/pending', 'Pending QC Checks');
            }

            if (user.role === 'mechanic') {
                await checkEndpoint(headers, '/maintenance/stats', 'Maintenance Stats');
                await checkEndpoint(headers, '/maintenance/schedule', 'Maintenance Schedule');
            }

        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}`);
        }
        console.log(''); // Newline
    }
}

async function checkEndpoint(headers, path, name) {
    const res = await fetch(`${API_URL}${path}`, { headers });
    if (res.ok) {
        console.log(`   ✅ ${name}: OK (200)`);
    } else {
        console.log(`   ❌ ${name}: FAILED (${res.status})`);
    }
}

runQATest();
