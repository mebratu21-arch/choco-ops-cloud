import { db } from './src/config/database.js';

async function seedAllData() {
  try {
    console.log('🌱 Starting comprehensive data seeding...\n');

    // 0. CLEANUP (Individual Truncates with CASCADE where needed)
    console.log('🧹 Cleaning up old data...');
    const tablesToClear = [
        'order_items', 'orders', 'employee_sales', 
        'maintenance_logs', 'qc_checks', 'recipe_ingredients', 
        'production_batches', 'inventory_items', 'suppliers', 'recipes', 'machines'
    ];
    
    for (const table of tablesToClear) {
        try {
            if (await db.schema.hasTable(table)) {
                // Use TRUNCATE CASCADE for critical tables
                if (['recipes', 'inventory_items', 'production_batches', 'machines', 'orders'].includes(table)) {
                    await db.raw(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
                    console.log(`✅ Cleared ${table} with CASCADE`);
                } else {
                    await db(table).del();
                    console.log(`✅ Cleared ${table}`);
                }
            }
        } catch (e) {
            console.log(`⚠️ Could not clear ${table}, skipping...`);
        }
    }
    console.log('✅ Cleanup phase complete\n');

    // 1. SUPPLIERS
    console.log('📦 Seeding suppliers...');
    const suppliers = await db('suppliers').insert([
      { name: 'Swiss Cocoa Co.', contact_name: 'Hans Mueller', contact_email: 'hans@swisscocoa.ch', phone: '+41-44-123-4567', address: 'Zurich, Switzerland', status: 'ACTIVE' },
      { name: 'Ecuador Cacao Direct', contact_name: 'Maria Garcia', contact_email: 'maria@ecuadorcacao.ec', phone: '+593-2-234-5678', status: 'ACTIVE' },
      { name: 'Vanilla Beans Ltd', contact_name: 'Pierre Dubois', contact_email: 'pierre@vanilla.fr', phone: '+33-1-234-5678', status: 'ACTIVE' },
      { name: 'Sugar Refineries Inc', contact_name: 'John Smith', contact_email: 'john@sugarref.com', phone: '+1-555-0123', status: 'ACTIVE' },
      { name: 'Dairy Products Co', contact_name: 'Emma Wilson', contact_email: 'emma@dairy.com', phone: '+1-555-0124', status: 'ACTIVE' }
    ]).returning('*');
    console.log(`✅ Added ${suppliers.length} suppliers\n`);

    // 2. INVENTORY ITEMS (Replaces Ingredients for recipes)
    console.log('🧪 Seeding inventory items...');
    const inventoryItems = await db('inventory_items').insert([
      { name: 'Dark Cocoa Powder', category: 'COCOA', unit: 'kg', cost_per_unit: 25.50, quantity: 500, reorder_level: 100, supplier_id: suppliers[0].id, code: 'ING-DCP-001' },
      { name: 'Milk Cocoa Powder', category: 'COCOA', unit: 'kg', cost_per_unit: 22.00, quantity: 400, reorder_level: 80, supplier_id: suppliers[0].id, code: 'ING-MCP-001' },
      { name: 'Cocoa Butter', category: 'COCOA', unit: 'kg', cost_per_unit: 35.00, quantity: 300, reorder_level: 50, supplier_id: suppliers[1].id, code: 'ING-CB-001' },
      { name: 'Cane Sugar', category: 'SWEETENERS', unit: 'kg', cost_per_unit: 1.50, quantity: 2000, reorder_level: 500, supplier_id: suppliers[3].id, code: 'ING-SUG-001' },
      { name: 'Vanilla Extract', category: 'FLAVORING', unit: 'L', cost_per_unit: 45.00, quantity: 50, reorder_level: 10, supplier_id: suppliers[2].id, code: 'ING-VAN-001' },
      { name: 'Whole Milk Powder', category: 'DAIRY', unit: 'kg', cost_per_unit: 8.00, quantity: 800, reorder_level: 200, supplier_id: suppliers[4].id, code: 'ING-WMP-001' }
    ]).returning('*');
    console.log(`✅ Added ${inventoryItems.length} inventory items\n`);

    // 3. RECIPES
    console.log('📝 Seeding recipes...');
    const recipes = await db('recipes').insert([
      { name: 'Dark Chocolate 70%', description: 'Premium dark chocolate bar', yield_quantity: 100, yield_unit: 'bars', instructions: '1. Melt cocoa butter\n2. Mix with cocoa powder\n3. Add sugar\n4. Temper', status: 'ACTIVE', category: 'bars', difficulty_level: 'medium' },
      { name: 'Milk Chocolate Classic', description: 'Creamy milk chocolate', yield_quantity: 100, yield_unit: 'bars', instructions: '1. Melt ingredients\n2. Add milk powder\n3. Conch\n4. Temper', status: 'ACTIVE', category: 'bars', difficulty_level: 'medium' },
      { name: 'Hazelnut Praline', description: 'Chocolate with hazelnut praline', yield_quantity: 50, yield_unit: 'boxes', instructions: '1. Roast hazelnuts\n2. Make praline\n3. Mix with chocolate', status: 'ACTIVE', category: 'pralines', difficulty_level: 'hard' },
      { name: 'Sea Salt Caramel Truffle', description: 'Salted caramel truffles', yield_quantity: 200, yield_unit: 'pieces', instructions: '1. Make caramel\n2. Add sea salt\n3. Coat with chocolate', status: 'ACTIVE', category: 'truffles', difficulty_level: 'medium' },
      { name: 'Strawberry Cream Bonbon', description: 'Strawberry-filled bonbons', yield_quantity: 150, yield_unit: 'pieces', instructions: '1. Make ganache\n2. Add strawberry\n3. Seal shells', status: 'ACTIVE', category: 'bonbons', difficulty_level: 'medium' }
    ]).returning('*');
    console.log(`✅ Added ${recipes.length} recipes\n`);

    // 4. RECIPE INGREDIENTS
    console.log('🔗 Linking recipes to inventory items...');
    const recipeIngredients = [
      { recipe_id: recipes[0].id, inventory_item_id: inventoryItems[0].id, quantity: 50, unit: 'kg' },
      { recipe_id: recipes[0].id, inventory_item_id: inventoryItems[2].id, quantity: 30, unit: 'kg' },
      { recipe_id: recipes[1].id, inventory_item_id: inventoryItems[1].id, quantity: 30, unit: 'kg' },
      { recipe_id: recipes[1].id, inventory_item_id: inventoryItems[5].id, quantity: 25, unit: 'kg' }
    ];
    await db('recipe_ingredients').insert(recipeIngredients);
    console.log(`✅ Added ${recipeIngredients.length} recipe-ingredient links\n`);

    // 5. PRODUCTION BATCHES
    console.log('🏭 Seeding production batches...');
    const batches = await db('production_batches').insert([
      { batch_number: 'BATCH-2026-001', recipe_id: recipes[0].id, target_quantity: 100, actual_quantity: 98, status: 'completed', started_at: new Date('2026-02-10T08:00:00'), completed_at: new Date('2026-02-10T14:00:00') },
      { batch_number: 'BATCH-2026-002', recipe_id: recipes[1].id, target_quantity: 100, actual_quantity: 0, status: 'mixing', started_at: new Date('2026-02-11T09:00:00') },
      { batch_number: 'BATCH-2026-003', recipe_id: recipes[2].id, target_quantity: 50, actual_quantity: 0, status: 'pending' }
    ]).returning('*');
    console.log(`✅ Added ${batches.length} production batches\n`);

    // 6. MACHINES
    console.log('⚙️ Seeding machines...');
    const machines = await db('machines').insert([
      { name: 'Melanger #1', type: 'MELANGER', status: 'operational', location: 'Floor A', machine_code: 'MEL-01', installation_date: new Date('2025-01-01') },
      { name: 'Tempering Unit Alpha', type: 'TEMPEROR', status: 'operational', location: 'Floor B', machine_code: 'TMP-01', installation_date: new Date('2025-02-01') },
      { name: 'Flow-Wrap System', type: 'PACKAGING', status: 'maintenance', location: 'Floor C', machine_code: 'PKG-01', installation_date: new Date('2025-03-01') }
    ]).returning('*');
    console.log(`✅ Added ${machines.length} machines\n`);

    // 7. QC CHECKS
    console.log('✅ Seeding QC checks...');
    const qcChecks = await db('qc_checks').insert([
      { batch_id: batches[0].id, appearance_score: 9, texture_score: 8, taste_score: 9, temperature: 18.5, humidity: 45, defect_count: 0, result: 'approved', inspection_date: new Date('2026-02-10T14:30:00') }
    ]).returning('*');
    console.log(`✅ Added ${qcChecks.length} QC checks\n`);

    // 8. MAINTENANCE LOGS
    console.log('🔧 Seeding maintenance logs...');
    // We'll use a hardcoded user ID for mechanic if none found
    const mechanicUsers = await db('users').where('role', 'MECHANIC').orWhere('role', 'worker').select('id').limit(1);
    const mechanicId = mechanicUsers[0]?.id;
    
    if (mechanicId) {
        const maintenanceLogs = await db('maintenance_logs').insert([
          { machine_id: machines[2].id, mechanic_id: mechanicId, maintenance_type: 'corrective', description: 'Motor bearing replacement', performed_at: new Date('2026-02-11T10:00:00'), duration_minutes: 120, cost: 250.00 }
        ]).returning('*');
        console.log(`✅ Added ${maintenanceLogs.length} maintenance logs\n`);
    }

    // 9. SUPPLIER ORDERS
    console.log('🛒 Seeding supplier orders...');
    const procurementUsers = await db('users').where('role', 'admin').orWhere('role', 'manager').select('id').limit(1);
    const buyerId = procurementUsers[0]?.id;

    if (buyerId && await db.schema.hasTable('orders')) {
        const orders = await db('orders').insert([
          { order_number: 'PO-2026-001', supplier_id: suppliers[0].id, ordered_by: buyerId, total_amount: 1500.00, status: 'PENDING', ordered_at: new Date('2026-02-10') },
          { order_number: 'PO-2026-002', supplier_id: suppliers[1].id, ordered_by: buyerId, total_amount: 450.00, status: 'COMPLETED', ordered_at: new Date('2026-02-05'), received_at: new Date('2026-02-08') }
        ]).returning('*');
        console.log(`✅ Added ${orders.length} supplier orders\n`);
    }

    // 10. ONLINE ORDERS (Customer Sales)
    console.log('📦 Seeding online customer orders...');
    if (await db.schema.hasTable('online_orders')) {
        const onlineOrders = await db('online_orders').insert([
            { customer_name: 'Alice Wonderland', customer_email: 'alice@example.com', batch_id: batches[0].id, quantity: 10, unit: 'bars', total_amount: 120.00, status: 'SHIPPED', order_date: new Date('2026-02-10') },
            { customer_name: 'Bob Builder', customer_email: 'bob@example.com', batch_id: batches[1].id, quantity: 50, unit: 'bars', total_amount: 500.00, status: 'PROCESSING', order_date: new Date('2026-02-11') }
        ]).returning('*');
        console.log(`✅ Added ${onlineOrders.length} online orders\n`);
    }

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedAllData();
