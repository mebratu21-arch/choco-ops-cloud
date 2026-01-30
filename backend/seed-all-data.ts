import { db } from './src/config/database.js';
import bcrypt from 'bcryptjs';

async function seedAllData() {
  try {
    console.log('🌱 Starting comprehensive data seeding...\n');

    // 1. SUPPLIERS
    console.log('📦 Seeding suppliers...');
    const suppliers = await db('suppliers').insert([
      { name: 'Swiss Cocoa Co.', contact_name: 'Hans Mueller', contact_email: 'hans@swisscocoa.ch', phone: '+41-44-123-4567', address: 'Zurich, Switzerland', status: 'ACTIVE' },
      { name: 'Ecuador Cacao Direct', contact_name: 'Maria Garcia', contact_email: 'maria@ecuadorcacao.ec', phone: '+593-2-234-5678', status: 'ACTIVE' },
      { name: 'Vanilla Beans Ltd', contact_name: 'Pierre Dubois', contact_email: 'pierre@vanilla.fr', phone: '+33-1-234-5678', status: 'ACTIVE' },
      { name: 'Sugar Refineries Inc', contact_name: 'John Smith', contact_email: 'john@sugarref.com', phone: '+1-555-0123', status: 'ACTIVE' },
      { name: 'Dairy Products Co', contact_name: 'Emma Wilson', contact_email: 'emma@dairy.com', phone: '+1-555-0124', status: 'ACTIVE' },
      { name: 'Nuts & More Suppliers', contact_name: 'Ahmed Hassan', contact_email: 'ahmed@nuts.com', phone: '+20-2-345-6789', status: 'ACTIVE' },
      { name: 'Premium Butter Supply', contact_name: 'Sophie Laurent', contact_email: 'sophie@butter.fr', phone: '+33-1-345-6789', status: 'ACTIVE' },
      { name: 'Organic Ingredients Hub', contact_name: 'Lisa Chen', contact_email: 'lisa@organic.cn', phone: '+86-10-8765-4321', status: 'ACTIVE' },
      { name: 'Flavor Essences Pro', contact_name: 'Roberto Rossi', contact_email: 'roberto@flavors.it', phone: '+39-06-1234-5678', status: 'ACTIVE' },
      { name: 'Packaging Solutions Ltd', contact_name: 'David Brown', contact_email: 'david@packaging.uk', phone: '+44-20-7123-4567', status: 'ACTIVE' }
    ]).returning('*');
    console.log(`✅ Added ${suppliers.length} suppliers\n`);

    // 2. INGREDIENTS
    console.log('🧪 Seeding ingredients...');
    const ingredients = await db('ingredients').insert([
      { name: 'Dark Cocoa Powder', category: 'Cocoa', unit: 'kg', cost_per_unit: 25.50, stock_quantity: 500, reorder_level: 100, supplier_id: suppliers[0].id },
      { name: 'Milk Cocoa Powder', category: 'Cocoa', unit: 'kg', cost_per_unit: 22.00, stock_quantity: 400, reorder_level: 80, supplier_id: suppliers[0].id },
      { name: 'Cocoa Butter', category: 'Cocoa', unit: 'kg', cost_per_unit: 35.00, stock_quantity: 300, reorder_level: 50, supplier_id: suppliers[1].id },
      { name: 'Cane Sugar', category: 'Sweeteners', unit: 'kg', cost_per_unit: 1.50, stock_quantity: 2000, reorder_level: 500, supplier_id: suppliers[3].id },
      { name: 'Vanilla Extract', category: 'Flavoring', unit: 'L', cost_per_unit: 45.00, stock_quantity: 50, reorder_level: 10, supplier_id: suppliers[2].id },
      { name: 'Whole Milk Powder', category: 'Dairy', unit: 'kg', cost_per_unit: 8.00, stock_quantity: 800, reorder_level: 200, supplier_id: suppliers[4].id },
      { name: 'Heavy Cream', category: 'Dairy', unit: 'L', cost_per_unit: 5.50, stock_quantity: 200, reorder_level: 50, supplier_id: suppliers[4].id },
      { name: 'Butter (Unsalted)', category: 'Dairy', unit: 'kg', cost_per_unit: 12.00, stock_quantity: 150, reorder_level: 40, supplier_id: suppliers[6].id },
      { name: 'Hazelnuts (Roasted)', category: 'Nuts', unit: 'kg', cost_per_unit: 18.00, stock_quantity: 200, reorder_level: 50, supplier_id: suppliers[5].id },
      { name: 'Almonds (Sliced)', category: 'Nuts', unit: 'kg', cost_per_unit: 16.00, stock_quantity: 180, reorder_level: 40, supplier_id: suppliers[5].id },
      { name: 'Sea Salt', category: 'Seasoning', unit: 'kg', cost_per_unit: 3.00, stock_quantity: 100, reorder_level: 20, supplier_id: suppliers[7].id },
      { name: 'Strawberry Powder', category: 'Flavoring', unit: 'kg', cost_per_unit: 28.00, stock_quantity: 80, reorder_level: 20, supplier_id: suppliers[7].id }
    ]).returning('*');
    console.log(`✅ Added ${ingredients.length} ingredients\n`);

    // 3. RECIPES
    console.log('📝 Seeding recipes...');
    const recipes = await db('recipes').insert([
      { name: 'Dark Chocolate 70%', description: 'Premium dark chocolate bar', yield_quantity: 100, yield_unit: 'bars', instructions: '1. Melt cocoa butter\n2. Mix with cocoa powder\n3. Add sugar\n4. Temper\n5. Pour into molds', status: 'ACTIVE' },
      { name: 'Milk Chocolate Classic', description: 'Creamy milk chocolate', yield_quantity: 100, yield_unit: 'bars', instructions: '1. Melt ingredients\n2. Add milk powder\n3. Conch for 8 hours\n4. Temper\n5. Mold', status: 'ACTIVE' },
      { name: 'Hazelnut Praline', description: 'Chocolate with hazelnut praline', yield_quantity: 50, yield_unit: 'boxes', instructions: '1. Roast hazelnuts\n2. Make praline\n3. Mix with chocolate\n4. Fill molds', status: 'ACTIVE' },
      { name: 'Sea Salt Caramel Truffle', description: 'Salted caramel chocolate truffle', yield_quantity: 200, yield_unit: 'pieces', instructions: '1. Make caramel\n2. Add sea salt\n3. Cool\n4. Coat with chocolate', status: 'ACTIVE' },
      { name: 'Strawberry Cream Bonbon', description: 'Strawberry-filled chocolate', yield_quantity: 150, yield_unit: 'pieces', instructions: '1. Make ganache\n2. Add strawberry\n3. Pipe into shells\n4. Seal with chocolate', status: 'ACTIVE' },
      { name: 'White Chocolate Bar', description: 'Pure white chocolate', yield_quantity: 80, yield_unit: 'bars', instructions: '1. Melt cocoa butter\n2. Add milk powder and sugar\n3. Temper\n4. Mold', status: 'ACTIVE' },
      { name: 'Almond Dark Bark', description: 'Dark chocolate with almonds', yield_quantity: 60, yield_unit: 'pieces', instructions: '1. Temper dark chocolate\n2. Spread on sheet\n3. Sprinkle almonds\n4. Cool and break', status: 'ACTIVE' },
      { name: 'Espresso Truffle', description: 'Coffee-infused chocolate truffle', yield_quantity: 120, yield_unit: 'pieces', instructions: '1. Make espresso ganache\n2. Cool overnight\n3. Roll balls\n4. Coat in cocoa', status: 'ACTIVE' },
      { name: 'Orange Peel Dark', description: 'Dark chocolate with candied orange', yield_quantity: 90, yield_unit: 'bars', instructions: '1. Candy orange peel\n2. Chop finely\n3. Mix with tempered chocolate\n4. Mold', status: 'ACTIVE' },
      { name: 'Raspberry Rose Bonbon', description: 'Raspberry ganache with rose', yield_quantity: 100, yield_unit: 'pieces', instructions: '1. Make raspberry ganache\n2. Add rose water\n3. Pipe and seal', status: 'ACTIVE' }
    ]).returning('*');
    console.log(`✅ Added ${recipes.length} recipes\n`);

    // 4. RECIPE INGREDIENTS
    console.log('🔗 Linking recipes to ingredients...');
    const recipeIngredients = [];
    // Dark Chocolate 70%
    recipeIngredients.push({ recipe_id: recipes[0].id, ingredient_id: ingredients[0].id, quantity: 50, unit: 'kg' });
    recipeIngredients.push({ recipe_id: recipes[0].id, ingredient_id: ingredients[2].id, quantity: 30, unit: 'kg' });
    recipeIngredients.push({ recipe_id: recipes[0].id, ingredient_id: ingredients[3].id, quantity: 20, unit: 'kg' });
    // Milk Chocolate
    recipeIngredients.push({ recipe_id: recipes[1].id, ingredient_id: ingredients[1].id, quantity: 30, unit: 'kg' });
    recipeIngredients.push({ recipe_id: recipes[1].id, ingredient_id: ingredients[5].id, quantity: 25, unit: 'kg' });
    recipeIngredients.push({ recipe_id: recipes[1].id, ingredient_id: ingredients[3].id, quantity: 40, unit: 'kg' });
    // Hazelnut Praline
    recipeIngredients.push({ recipe_id: recipes[2].id, ingredient_id: ingredients[8].id, quantity: 15, unit: 'kg' });
    recipeIngredients.push({ recipe_id: recipes[2].id, ingredient_id: ingredients[1].id, quantity: 20, unit: 'kg' });
    recipeIngredients.push({ recipe_id: recipes[2].id, ingredient_id: ingredients[3].id, quantity: 10, unit: 'kg' });

    await db('recipe_ingredients').insert(recipeIngredients);
    console.log(`✅ Added ${recipeIngredients.length} recipe-ingredient links\n`);

    // 5. BATCHES
    console.log('🏭 Seeding production batches...');
    const batches = await db('batches').insert([
      { batch_number: 'BATCH-2026-001', recipe_id: recipes[0].id, quantity: 100, status: 'COMPLETED', started_at: new Date('2026-01-15'), completed_at: new Date('2026-01-16') },
      { batch_number: 'BATCH-2026-002', recipe_id: recipes[1].id, quantity: 100, status: 'COMPLETED', started_at: new Date('2026-01-16'), completed_at: new Date('2026-01-17') },
      { batch_number: 'BATCH-2026-003', recipe_id: recipes[2].id, quantity: 50, status: 'COMPLETED', started_at: new Date('2026-01-18'), completed_at: new Date('2026-01-19') },
      { batch_number: 'BATCH-2026-004', recipe_id: recipes[3].id, quantity: 200, status: 'IN_PROGRESS', started_at: new Date('2026-01-28') },
      { batch_number: 'BATCH-2026-005', recipe_id: recipes[4].id, quantity: 150, status: 'IN_PROGRESS', started_at: new Date('2026-01-29') },
      { batch_number: 'BATCH-2026-006', recipe_id: recipes[0].id, quantity: 100, status: 'PENDING', scheduled_at: new Date('2026-02-01') },
      { batch_number: 'BATCH-2026-007', recipe_id: recipes[5].id, quantity: 80, status: 'PENDING', scheduled_at: new Date('2026-02-02') },
      { batch_number: 'BATCH-2026-008', recipe_id: recipes[6].id, quantity: 60, status: 'PENDING', scheduled_at: new Date('2026-02-03') },
      { batch_number: 'BATCH-2026-009', recipe_id: recipes[7].id, quantity: 120, status: 'COMPLETED', started_at: new Date('2026-01-20'), completed_at: new Date('2026-01-21') },
      { batch_number: 'BATCH-2026-010', recipe_id: recipes[8].id, quantity: 90, status: 'COMPLETED', started_at: new Date('2026-01-22'), completed_at: new Date('2026-01-23') }
    ]).returning('*');
    console.log(`✅ Added ${batches.length} production batches\n`);

    // 6. QUALITY CHECKS
    console.log('✅ Seeding quality checks...');
    const qcUsers = await db('users').where('role', 'QC').select('id').limit(1);
    const qualityChecks = await db('quality_checks').insert([
      { batch_id: batches[0].id, inspector_id: qcUsers[0]?.id, check_type: 'VISUAL', result: 'PASS', notes: 'Color and texture excellent', checked_at: new Date('2026-01-16') },
      { batch_id: batches[0].id, inspector_id: qcUsers[0]?.id, check_type: 'TASTE', result: 'PASS', notes: 'Flavor profile meets standards', checked_at: new Date('2026-01-16') },
      { batch_id: batches[1].id, inspector_id: qcUsers[0]?.id, check_type: 'VISUAL', result: 'PASS', notes: 'Smooth finish, no blooming', checked_at: new Date('2026-01-17') },
      { batch_id: batches[1].id, inspector_id: qcUsers[0]?.id, check_type: 'TASTE', result: 'PASS', notes: 'Creamy, balanced sweetness', checked_at: new Date('2026-01-17') },
      { batch_id: batches[2].id, inspector_id: qcUsers[0]?.id, check_type: 'VISUAL', result: 'PASS', notes: 'Even praline distribution', checked_at: new Date('2026-01-19') },
      { batch_id: batches[2].id, inspector_id: qcUsers[0]?.id, check_type: 'TASTE', result: 'PASS', notes: 'Excellent hazelnut flavor', checked_at: new Date('2026-01-19') },
      { batch_id: batches[8].id, inspector_id: qcUsers[0]?.id, check_type: 'VISUAL', result: 'PASS', notes: 'Good truffle shape', checked_at: new Date('2026-01-21') },
      { batch_id: batches[8].id, inspector_id: qcUsers[0]?.id, check_type: 'TASTE', result: 'PASS', notes: 'Strong espresso notes', checked_at: new Date('2026-01-21') },
      { batch_id: batches[9].id, inspector_id: qcUsers[0]?.id, check_type: 'VISUAL', result: 'PASS', notes: 'Orange peel well distributed', checked_at: new Date('2026-01-23') },
      { batch_id: batches[9].id, inspector_id: qcUsers[0]?.id, check_type: 'TASTE', result: 'PASS', notes: 'Balanced bitter-sweet', checked_at: new Date('2026-01-23') }
    ]).returning('*');
    console.log(`✅ Added ${qualityChecks.length} quality checks\n`);

    // 7. EQUIPMENT
    console.log('⚙️ Seeding equipment...');
    const equipment = await db('equipment').insert([
      { name: 'Melanger #1', type: 'MELANGER', status: 'OPERATIONAL', location: 'Production Floor A', last_maintenance: new Date('2026-01-01') },
      { name: 'Melanger #2', type: 'MELANGER', status: 'OPERATIONAL', location: 'Production Floor A', last_maintenance: new Date('2026-01-05') },
      { name: 'Tempering Machine #1', type: 'TEMPERING', status: 'OPERATIONAL', location: 'Production Floor B', last_maintenance: new Date('2026-01-10') },
      { name: 'Tempering Machine #2', type: 'TEMPERING', status: 'OPERATIONAL', location: 'Production Floor B', last_maintenance: new Date('2026-01-12') },
      { name: 'Conche #1', type: 'CONCHE', status: 'OPERATIONAL', location: 'Production Floor A', last_maintenance: new Date('2025-12-20') },
      { name: 'Cooling Tunnel #1', type: 'COOLING', status: 'OPERATIONAL', location: 'Production Floor C', last_maintenance: new Date('2026-01-15') },
      { name: 'Enrobing Machine', type: 'ENROBER', status: 'MAINTENANCE', location: 'Production Floor C', last_maintenance: new Date('2025-12-15') },
      { name: 'Packaging Line #1', type: 'PACKAGING', status: 'OPERATIONAL', location: 'Packaging Area', last_maintenance: new Date('2026-01-20') },
      { name: 'Packaging Line #2', type: 'PACKAGING', status: 'OPERATIONAL', location: 'Packaging Area', last_maintenance: new Date('2026-01-22') },
      { name: 'Industrial Mixer', type: 'MIXER', status: 'OPERATIONAL', location: 'Production Floor A', last_maintenance: new Date('2026-01-08') }
    ]).returning('*');
    console.log(`✅ Added ${equipment.length} equipment items\n`);

    // 8. MAINTENANCE LOGS
    console.log('🔧 Seeding maintenance logs...');
    const mechanicUsers = await db('users').where('role', 'MECHANIC').select('id').limit(1);
    const maintenanceLogs = await db('maintenance_logs').insert([
      { equipment_id: equipment[0].id, technician_id: mechanicUsers[0]?.id, issue: 'Routine maintenance', priority: 'LOW', status: 'COMPLETED', resolution: 'Cleaned and lubricated', completed_at: new Date('2026-01-01') },
      { equipment_id: equipment[1].id, technician_id: mechanicUsers[0]?.id, issue: 'Belt replacement', priority: 'MEDIUM', status: 'COMPLETED', resolution: 'Replaced drive belt', completed_at: new Date('2026-01-05') },
      { equipment_id: equipment[2].id, technician_id: mechanicUsers[0]?.id, issue: 'Temperature calibration', priority: 'HIGH', status: 'COMPLETED', resolution: 'Recalibrated sensors', completed_at: new Date('2026-01-10') },
      { equipment_id: equipment[6].id, technician_id: mechanicUsers[0]?.id, issue: 'Motor malfunction', priority: 'HIGH', status: 'IN_PROGRESS', resolution: 'Replacing motor bearings' },
      { equipment_id: equipment[4].id, technician_id: mechanicUsers[0]?.id, issue: 'Scheduled service', priority: 'MEDIUM', status: 'PENDING' },
      { equipment_id: equipment[7].id, technician_id: mechanicUsers[0]?.id, issue: 'Routine inspection', priority: 'LOW', status: 'COMPLETED', resolution: 'All systems normal', completed_at: new Date('2026-01-20') },
      { equipment_id: equipment[8].id, technician_id: mechanicUsers[0]?.id, issue: 'Conveyor alignment', priority: 'MEDIUM', status: 'COMPLETED', resolution: 'Realigned conveyor belt', completed_at: new Date('2026-01-22') },
      { equipment_id: equipment[9].id, technician_id: mechanicUsers[0]?.id, issue: 'Blade sharpening', priority: 'LOW', status: 'COMPLETED', resolution: 'Sharpened mixing blades', completed_at: new Date('2026-01-08') },
      { equipment_id: equipment[3].id, technician_id: mechanicUsers[0]?.id, issue: 'Control panel update', priority: 'MEDIUM', status: 'COMPLETED', resolution: 'Updated software', completed_at: new Date('2026-01-12') },
      { equipment_id: equipment[5].id, technician_id: mechanicUsers[0]?.id, issue: 'Cooling fan noise', priority: 'LOW', status: 'COMPLETED', resolution: 'Replaced fan bearing', completed_at: new Date('2026-01-15') }
    ]).returning('*');
    console.log(`✅ Added ${maintenanceLogs.length} maintenance logs\n`);

    // 9. EMPLOYEE SALES
    console.log('💰 Seeding employee sales...');
    const salesUsers = await db('users').whereIn('role', ['SALES', 'ADMIN']).select('id').limit(3);
    const employeeSales = await db('employee_sales').insert([
      { product_name: 'Dark Chocolate Gift Box', quantity: 5, unit_price: 29.99, total_amount: 149.95, payment_method: 'CASH', employee_id: salesUsers[0]?.id, sold_at: new Date('2026-01-25') },
      { product_name: 'Milk Chocolate Bars (12 pack)', quantity: 3, unit_price: 24.99, total_amount: 74.97, payment_method: 'CARD', employee_id: salesUsers[0]?.id, sold_at: new Date('2026-01-26') },
      { product_name: 'Truffle Assortment', quantity: 8, unit_price: 19.99, total_amount: 159.92, payment_method: 'CARD', employee_id: salesUsers[1]?.id, sold_at: new Date('2026-01-27') },
      { product_name: 'Premium Dark 70%', quantity: 12, unit_price: 12.99, total_amount: 155.88, payment_method: 'CASH', employee_id: salesUsers[0]?.id, sold_at: new Date('2026-01-28') },
      { product_name: 'Hazelnut Praline Box', quantity: 6, unit_price: 22.99, total_amount: 137.94, payment_method: 'CARD', employee_id: salesUsers[2]?.id, sold_at: new Date('2026-01-28') },
      { product_name: 'Strawberry Cream Collection', quantity: 4, unit_price: 18.99, total_amount: 75.96, payment_method: 'CASH', employee_id: salesUsers[1]?.id, sold_at: new Date('2026-01-29') },
      { product_name: 'Sea Salt Caramel', quantity: 10, unit_price: 14.99, total_amount: 149.90, payment_method: 'CARD', employee_id: salesUsers[0]?.id, sold_at: new Date('2026-01-29') },
      { product_name: 'White Chocolate Bars', quantity: 7, unit_price: 11.99, total_amount: 83.93, payment_method: 'CASH', employee_id: salesUsers[2]?.id, sold_at: new Date('2026-01-29') },
      { product_name: 'Almond Dark Bark', quantity: 5, unit_price: 16.99, total_amount: 84.95, payment_method: 'CARD', employee_id: salesUsers[1]?.id, sold_at: new Date('2026-01-30') },
      { product_name: 'Espresso Truffle Box', quantity: 9, unit_price: 21.99, total_amount: 197.91, payment_method: 'CARD', employee_id: salesUsers[0]?.id, sold_at: new Date('2026-01-30') }
    ]).returning('*');
    console.log(`✅ Added ${employeeSales.length} employee sales\n`);

    // 10. SHOP ORDERS
    console.log('🛒 Seeding shop orders...');
    const products = await db('products').select('id', 'sku', 'name', 'price').limit(10);
    const shopOrders = await db('shop_orders').insert([
      { order_number: 'ORD-2026-001', customer_name: 'Alice Johnson', total_amount: 89.97, payment_method: 'CARD', status: 'COMPLETED', created_at: new Date('2026-01-25') },
      { order_number: 'ORD-2026-002', customer_name: 'Bob Smith', total_amount: 124.95, payment_method: 'CASH', status: 'COMPLETED', created_at: new Date('2026-01-26') },
      { order_number: 'ORD-2026-003', customer_name: 'Carol White', total_amount: 67.98, payment_method: 'CARD', status: 'COMPLETED', created_at: new Date('2026-01-27') },
      { order_number: 'ORD-2026-004', customer_name: 'David Brown', total_amount: 199.99, payment_method: 'CARD', status: 'COMPLETED', created_at: new Date('2026-01-28') },
      { order_number: 'ORD-2026-005', customer_name: 'Emma Davis', total_amount: 45.99, payment_method: 'CASH', status: 'COMPLETED', created_at: new Date('2026-01-28') },
      { order_number: 'ORD-2026-006', customer_name: 'Frank Miller', total_amount: 156.94, payment_method: 'CARD', status: 'PENDING', created_at: new Date('2026-01-29') },
      { order_number: 'ORD-2026-007', customer_name: 'Grace Lee', total_amount: 78.97, payment_method: 'CARD', status: 'COMPLETED', created_at: new Date('2026-01-29') },
      { order_number: 'ORD-2026-008', customer_name: 'Henry Wilson', total_amount: 234.88, payment_method: 'CASH', status: 'COMPLETED', created_at: new Date('2026-01-30') },
      { order_number: 'ORD-2026-009', customer_name: 'Ivy Martinez', total_amount: 92.96, payment_method: 'CARD', status: 'PENDING', created_at: new Date('2026-01-30') },
      { order_number: 'ORD-2026-010', customer_name: 'Jack Anderson', total_amount: 167.93, payment_method: 'CARD', status: 'COMPLETED', created_at: new Date('2026-01-30') }
    ]).returning('*');
    console.log(`✅ Added ${shopOrders.length} shop orders\n`);

    // Shop Order Items
    const orderItems = [];
    for (let i = 0; i < shopOrders.length && i < products.length; i++) {
      orderItems.push({
        order_id: shopOrders[i].id,
        product_id: products[i].id,
        quantity: Math.floor(Math.random() * 5) + 1,
        unit_price: products[i].price,
        subtotal: products[i].price * (Math.floor(Math.random() * 5) + 1)
      });
    }
    await db('shop_order_items').insert(orderItems);
    console.log(`✅ Added ${orderItems.length} shop order items\n`);

    console.log('🎉 All data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ${suppliers.length} suppliers`);
    console.log(`   ${ingredients.length} ingredients`);
    console.log(`   ${recipes.length} recipes`);
    console.log(`   ${batches.length} batches`);
    console.log(`   ${qualityChecks.length} quality checks`);
    console.log(`   ${equipment.length} equipment items`);
    console.log(`   ${maintenanceLogs.length} maintenance logs`);
    console.log(`   ${employeeSales.length} employee sales`);
    console.log(`   ${shopOrders.length} shop orders`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedAllData();
