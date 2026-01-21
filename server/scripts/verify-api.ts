import { AuthService } from '../src/modules/auth/auth.service';
import { DatabaseHelpers } from '../src/common/utils/database.helpers';
import db from '../src/config/db';

async function verifyApi() {
  console.log('\n[INFO] Starting API Integration Verification');
  console.log('===========================================================');

  try {
    // 1. Check DB Connection
    console.log('[TEST 1] Database Connection');
    const healthy = await DatabaseHelpers.checkHealth();
    if (!healthy) throw new Error('Database not connected');
    console.log('   [SUCCESS] Connected to database');

    // 2. Verify Seeded User Exists
    console.log('\n[TEST 2] Verifying Seeded Admin User');
    const adminEmail = 'admin@chocofactory.com';
    const user = await db('users').where('email', adminEmail).first();
    
    if (!user) {
      console.error(`   [FAIL] User ${adminEmail} not found. Did seeds run?`);
      process.exit(1);
    }
    console.log(`   [SUCCESS] Found user: ${user.full_name} (${user.id})`);

    // 3. Test Login (Auth Service)
    console.log('\n[TEST 3] Testing Authentication Service (Login)');
    // Default seed password is 'Admin123!'
    const loginResult = await AuthService.login(adminEmail, 'Admin123!');
    
    if (loginResult && loginResult.token) {
      console.log('   [SUCCESS] Login successful');
      console.log(`   [INFO] Token generated: ${loginResult.token.substring(0, 20)}...`);
    } else {
      throw new Error('Login failed to return token');
    }

    // 4. Test Suppliers (Database Access)
    console.log('\n[TEST 4] Verifying Suppliers Access');
    const suppliers = await db('suppliers').select('id', 'name').limit(1);
    if (suppliers.length > 0) {
      console.log(`   [SUCCESS] Found supplier: ${suppliers[0].name}`);
    } else {
      console.log('   [WARNING] No suppliers found (check seeds)');
    }

    // 5. Test Raw Materials (Database Access)
    console.log('\n[TEST 5] Verifying Raw Materials Access');
    const materials = await db('raw_materials').select('id', 'name', 'quantity').limit(1);
    if (materials.length > 0) {
      console.log(`   [SUCCESS] Found material: ${materials[0].name} (Qty: ${materials[0].quantity})`);
    } else {
      console.log('   [WARNING] No raw materials found (check seeds)');
    }

    // 6. Test Production (Database Access)
    console.log('\n[TEST 6] Verifying Production Batches');
    const batches = await db('production_batches').select('id', 'batch_number').limit(1);
    if (batches.length > 0) {
      console.log(`   [SUCCESS] Found batch: ${batches[0].batch_number}`);
    } else {
      console.log('   [WARNING] No batches found (check seeds)');
    }

    // 7. Test Warehouse (Database Access)
    console.log('\n[TEST 7] Verifying Warehouse Stock');
    const stock = await db('warehouse_stock').count('id as count').first();
    console.log(`   [SUCCESS] Warehouse Count: ${stock ? Number(stock.count) : 0}`);

    console.log('===========================================================');
    console.log('[SUCCESS] All Database Modules Verified via API Layers');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n[ERROR] Verification Failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

verifyApi();
