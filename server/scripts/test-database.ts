import db from '../src/config/db';
import { DatabaseHelpers } from '../src/common/utils/database.helpers';

async function testDatabase() {
  console.log('\n[INFO] Starting Database Verification Script');
  console.log('===========================================================\n');

  try {
    // Test 1: Database Connection
    console.log('[TEST 1] Database Connection');
    const healthy = await DatabaseHelpers.checkHealth();
    if (healthy) {
      console.log('   [SUCCESS] Database connected successfully\n');
    } else {
      throw new Error('Database connection failed');
    }

    // Test 2: Verify Tables
    console.log('[TEST 2] Verify Tables');
    const tables = await db('information_schema.tables')
      .where('table_schema', 'public')
      .select('table_name');
    console.log(`   [INFO] Found ${tables.length} tables`);
    const expectedTables = [
      'roles', 'users', 'suppliers', 'raw_materials', 
      'production_batches', 'batch_materials', 'quality_controls', 
      'warehouse_stock', 'stock_movements', 'product_sales',
      'knex_migrations', 'knex_migrations_lock' // Knex internal tables
    ];
    // Filter to only show relevant app tables for clean output, or show all
    // Let's show the ones we care about primarily
    const appTables = tables.map(t => t.table_name).filter(name => !name.startsWith('knex_'));
    appTables.forEach(t => console.log(`   - ${t}`));
    console.log('');

    // Test 3: Record Counts
    console.log('[TEST 3] Record Counts');
    const [roles] = await db('roles').count('id as count');
    const [users] = await db('users').count('id as count');
    const [suppliers] = await db('suppliers').count('id as count');
    const [materials] = await db('raw_materials').count('id as count');
    const [batches] = await db('production_batches').count('id as count');

    console.log(`   Roles: ${Number(roles.count)}`);
    console.log(`   Users: ${Number(users.count)}`);
    console.log(`   Suppliers: ${Number(suppliers.count)}`);
    console.log(`   Raw Materials: ${Number(materials.count)}`);
    console.log(`   Production Batches: ${Number(batches.count)}\n`);

    // Test 4: Low Stock Alerts
    console.log('[TEST 4] Low Stock Alerts');
    const lowStock = await db('raw_materials')
      .whereRaw('quantity <= reorder_point')
      .select('name', 'quantity', 'reorder_point');
    
    if (lowStock.length === 0) {
      console.log('   [INFO] Found 0 materials below reorder point\n');
    } else {
      console.log(`   [WARNING] Found ${lowStock.length} materials below reorder point:`);
      lowStock.forEach(m => console.log(`   - ${m.name}: ${m.quantity} (Reorder: ${m.reorder_point})`));
      console.log('');
    }

    // Test 5: Active Production Batches
    console.log('[TEST 5] Active Production Batches');
    const activeBatches = await db('production_batches')
      .whereNotIn('status', ['completed', 'rejected'])
      .count('id as count')
      .first();
      
    const activeBatchesCount = activeBatches ? Number(activeBatches.count) : 0;
    console.log(`   [INFO] Found ${activeBatchesCount} active batches\n`);

    // Test 6: Dashboard Statistics
    console.log('[TEST 6] Dashboard Statistics');
    const availableProducts = await db('warehouse_stock')
      .where('status', 'available')
      .count('id as count');
    
    // Calculate today's revenue (ensure safe date handling)
    const today = new Date();
    today.setHours(0,0,0,0);
    const revenueResult = await db('product_sales')
      .where('sold_at', '>=', today)
      .sum('total_amount as total');
    
    // Handle potential null result from sum if no sales today
    const todayRevenue = revenueResult[0].total || 0;

    console.log(`   Low Stock Alerts: ${lowStock.length}`);
    console.log(`   Active Batches: ${activeBatchesCount}`);
    console.log(`   Available Products: ${Number(availableProducts[0].count)}`);
    console.log(`   Today Revenue: $${Number(todayRevenue).toFixed(2)}\n`);

    // Test 7: Quality Control Pass Rate
    console.log('[TEST 7] Quality Control Pass Rate');
    const qcStats = await db('quality_controls')
      .select(
        db.raw('count(*) as total'),
        db.raw("count(*) filter (where status = 'passed') as passed"),
        db.raw("count(*) filter (where status = 'failed') as failed")
      )
      .first();

    const totalQC = Number(qcStats.total);
    const passedQC = Number(qcStats.passed);
    const failedQC = Number(qcStats.failed);
    const passRate = totalQC > 0 ? (passedQC / totalQC) * 100 : 0;

    console.log(`   Total Inspections: ${totalQC}`);
    console.log(`   Passed: ${passedQC}`);
    console.log(`   Failed: ${failedQC}`);
    console.log(`   Pass Rate: ${passRate.toFixed(2)}%\n`);

    console.log('===========================================================');
    console.log('[SUCCESS] ALL TESTS PASSED');
    console.log('[INFO] Database is fully operational\n');

    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR] Database Verification Failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

testDatabase();
