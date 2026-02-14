import { db } from './src/config/database.js';

async function quickSeed() {
  try {
    console.log('🌱 Quick seeding essential data...\n');

    // Suppliers
    console.log('📦 Seeding suppliers...');
    const suppliers = await db('suppliers').insert([
      { name: 'Swiss Cocoa Co.', contact_person: 'Hans Mueller', email: 'hans@swiss.ch', phone: '+41-44-123-4567', is_active: true },
      { name: 'Ecuador Cacao', contact_person: 'Maria Garcia', email: 'maria@ecuador.ec', phone: '+593-2-234-5678', is_active: true },
      { name: 'Vanilla Beans Ltd', contact_person: 'Pierre Dubois', email: 'pierre@vanilla.fr', phone: '+33-1-234-5678', is_active: true },
      { name: 'Sugar Refineries', contact_person: 'John Smith', email: 'john@sugar.com', phone: '+1-555-0123', is_active: true },
      { name: 'Dairy Products Co', contact_person: 'Emma Wilson', email: 'emma@dairy.com', phone: '+1-555-0124', is_active: true },
      { name: 'Nuts Suppliers', contact_person: 'Ahmed Hassan', email: 'ahmed@nuts.com', phone: '+20-2-345-6789', is_active: true },
      { name: 'Butter Supply', contact_person: 'Sophie Laurent', email: 'sophie@butter.fr', phone: '+33-1-345-6789', is_active: true },
      { name: 'Organic Hub', contact_person: 'Lisa Chen', email: 'lisa@organic.cn', phone: '+86-10-8765-4321', is_active: true },
      { name: 'Flavor Pro', contact_person: 'Roberto Rossi', email: 'roberto@flavors.it', phone: '+39-06-1234-5678', is_active: true },
      { name: 'Packaging Ltd', contact_person: 'David Brown', email: 'david@pack.uk', phone: '+44-20-7123-4567', is_active: true }
    ]).returning('*');
    console.log(`✅ ${suppliers.length} suppliers\n`);

    // Ingredients
    console.log('🧪 Seeding ingredients...');
    const ingredients = await db('ingredients').insert([
      { name: 'Dark Cocoa Powder', unit_of_measure: 'kg', quantity_in_stock: 500, reorder_point: 100, supplier_id: suppliers[0].id },
      { name: 'Milk Cocoa Powder', unit_of_measure: 'kg', quantity_in_stock: 400, reorder_point: 80, supplier_id: suppliers[0].id },
      { name: 'Cocoa Butter', unit_of_measure: 'kg', quantity_in_stock: 300, reorder_point: 50, supplier_id: suppliers[1].id },
      { name: 'Cane Sugar', unit_of_measure: 'kg', quantity_in_stock: 2000, reorder_point: 500, supplier_id: suppliers[3].id },
      { name: 'Vanilla Extract', unit_of_measure: 'L', quantity_in_stock: 50, reorder_point: 10, supplier_id: suppliers[2].id },
      { name: 'Milk Powder', unit_of_measure: 'kg', quantity_in_stock: 800, reorder_point: 200, supplier_id: suppliers[4].id },
      { name: 'Heavy Cream', unit_of_measure: 'L', quantity_in_stock: 200, reorder_point: 50, supplier_id: suppliers[4].id },
      { name: 'Butter', unit_of_measure: 'kg', quantity_in_stock: 150, reorder_point: 40, supplier_id: suppliers[6].id },
      { name: 'Hazelnuts', unit_of_measure: 'kg', quantity_in_stock: 200, reorder_point: 50, supplier_id: suppliers[5].id },
      { name: 'Almonds', unit_of_measure: 'kg', quantity_in_stock: 180, reorder_point: 40, supplier_id: suppliers[5].id },
      { name: 'Sea Salt', unit_of_measure: 'kg', quantity_in_stock: 100, reorder_point: 20, supplier_id: suppliers[7].id },
      { name: 'Strawberry Powder', unit_of_measure: 'kg', quantity_in_stock: 80, reorder_point: 20, supplier_id: suppliers[7].id }
    ]).returning('*');
    console.log(`✅ ${ingredients.length} ingredients\n`);

    // Recipes
    console.log('📝 Seeding recipes...');
    const recipes = await db('recipes').insert([
      { name: 'Dark Chocolate 70%', description: 'Premium dark chocolate', yield_quantity: 100, yield_unit: 'bars', preparation_time: 480 },
      { name: 'Milk Chocolate', description: 'Creamy milk chocolate', yield_quantity: 100, yield_unit: 'bars', preparation_time: 600 },
      { name: 'Hazelnut Praline', description: 'Chocolate with praline', yield_quantity: 50, yield_unit: 'boxes', preparation_time: 360 },
      { name: 'Sea Salt Caramel', description: 'Salted caramel truffle', yield_quantity: 200, yield_unit: 'pieces', preparation_time: 240 },
      { name: 'Strawberry Cream', description: 'Strawberry bonbon', yield_quantity: 150, yield_unit: 'pieces', preparation_time: 180 },
      { name: 'White Chocolate', description: 'Pure white chocolate', yield_quantity: 80, yield_unit: 'bars', preparation_time: 420 },
      { name: 'Almond Bark', description: 'Dark with almonds', yield_quantity: 60, yield_unit: 'pieces', preparation_time: 120 },
      { name: 'Espresso Truffle', description: 'Coffee truffle', yield_quantity: 120, yield_unit: 'pieces', preparation_time: 200 },
      { name: 'Orange Dark', description: 'Dark with orange peel', yield_quantity: 90, yield_unit: 'bars', preparation_time: 300 },
      { name: 'Raspberry Rose', description: 'Raspberry bonbon', yield_quantity: 100, yield_unit: 'pieces', preparation_time: 180 }
    ]).returning('*');
    console.log(`✅ ${recipes.length} recipes\n`);

    // Recipe Ingredients (simplified)
    console.log('🔗 Linking recipes...');
    await db('recipe_ingredients').insert([
      { recipe_id: recipes[0].id, ingredient_id: ingredients[0].id, quantity_required: 50 },
      { recipe_id: recipes[0].id, ingredient_id: ingredients[2].id, quantity_required: 30 },
      { recipe_id: recipes[1].id, ingredient_id: ingredients[1].id, quantity_required: 30 },
      { recipe_id: recipes[1].id, ingredient_id: ingredients[5].id, quantity_required: 25 },
      { recipe_id: recipes[2].id, ingredient_id: ingredients[8].id, quantity_required: 15 }
    ]);
    console.log(`✅ Recipe links added\n`);

    // Batches
    console.log('🏭 Seeding batches...');
    const batches = await db('batches').insert([
      { batch_number: 'BATCH-001', recipe_id: recipes[0].id, planned_quantity: 100, actual_quantity: 100, status: 'COMPLETED', production_date: new Date('2026-01-15') },
      { batch_number: 'BATCH-002', recipe_id: recipes[1].id, planned_quantity: 100, actual_quantity: 98, status: 'COMPLETED', production_date: new Date('2026-01-16') },
      { batch_number: 'BATCH-003', recipe_id: recipes[2].id, planned_quantity: 50, actual_quantity: 50, status: 'COMPLETED', production_date: new Date('2026-01-18') },
      { batch_number: 'BATCH-004', recipe_id: recipes[3].id, planned_quantity: 200, actual_quantity: null, status: 'IN_PROGRESS', production_date: new Date('2026-01-28') },
      { batch_number: 'BATCH-005', recipe_id: recipes[4].id, planned_quantity: 150, actual_quantity: null, status: 'IN_PROGRESS', production_date: new Date('2026-01-29') },
      { batch_number: 'BATCH-006', recipe_id: recipes[0].id, planned_quantity: 100, actual_quantity: null, status: 'PENDING', production_date: new Date('2026-02-01') },
      { batch_number: 'BATCH-007', recipe_id: recipes[5].id, planned_quantity: 80, actual_quantity: null, status: 'PENDING', production_date: new Date('2026-02-02') },
      { batch_number: 'BATCH-008', recipe_id: recipes[6].id, planned_quantity: 60, actual_quantity: null, status: 'PENDING', production_date: new Date('2026-02-03') },
      { batch_number: 'BATCH-009', recipe_id: recipes[7].id, planned_quantity: 120, actual_quantity: 120, status: 'COMPLETED', production_date: new Date('2026-01-20') },
      { batch_number: 'BATCH-010', recipe_id: recipes[8].id, planned_quantity: 90, actual_quantity: 89, status: 'COMPLETED', production_date: new Date('2026-01-22') }
    ]).returning('*');
    console.log(`✅ ${batches.length} batches\n`);

    // Quality Checks
    console.log('✅ Seeding QC checks...');
    const qcUser = await db('users').where('role', 'QC').first();
    if (qcUser) {
      await db('quality_checks').insert([
        { batch_id: batches[0].id, checked_by: qcUser.id, status: 'PASS', notes: 'Excellent quality', checked_at: new Date('2026-01-15') },
        { batch_id: batches[1].id, checked_by: qcUser.id, status: 'PASS', notes: 'Good texture', checked_at: new Date('2026-01-16') },
        { batch_id: batches[2].id, checked_by: qcUser.id, status: 'PASS', notes: 'Perfect', checked_at: new Date('2026-01-18') },
        { batch_id: batches[8].id, checked_by: qcUser.id, status: 'PASS', notes: 'Strong flavor', checked_at: new Date('2026-01-20') },
        { batch_id: batches[9].id, checked_by: qcUser.id, status: 'PASS', notes: 'Well balanced', checked_at: new Date('2026-01-22') }
      ]);
      console.log(`✅ QC checks added\n`);
    }

    // Equipment
    console.log('⚙️ Seeding equipment...');
    await db('equipment').insert([
      { name: 'Melanger #1', type: 'MELANGER', status: 'OPERATIONAL', location: 'Floor A' },
      { name: 'Melanger #2', type: 'MELANGER', status: 'OPERATIONAL', location: 'Floor A' },
      { name: 'Tempering #1', type: 'TEMPERING', status: 'OPERATIONAL', location: 'Floor B' },
      { name: 'Tempering #2', type: 'TEMPERING', status: 'OPERATIONAL', location: 'Floor B' },
      { name: 'Conche #1', type: 'CONCHE', status: 'OPERATIONAL', location: 'Floor A' },
      { name: 'Cooling Tunnel', type: 'COOLING', status: 'OPERATIONAL', location: 'Floor C' },
      { name: 'Enrober', type: 'ENROBER', status: 'MAINTENANCE', location: 'Floor C' },
      { name: 'Packaging #1', type: 'PACKAGING', status: 'OPERATIONAL', location: 'Pack Area' },
      { name: 'Packaging #2', type: 'PACKAGING', status: 'OPERATIONAL', location: 'Pack Area' },
      { name: 'Mixer', type: 'MIXER', status: 'OPERATIONAL', location: 'Floor A' }
    ]);
    console.log(`✅ Equipment added\n`);

    console.log('🎉 Quick seed complete!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

quickSeed();
