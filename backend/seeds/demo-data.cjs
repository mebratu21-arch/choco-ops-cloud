// ========================================================
// CHOCOOPS CLOUD – SEED DATA
// Development-only demo data for all 12 tables
// ========================================================

const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Only run in development environment
  if (process.env.NODE_ENV !== 'development') {
    console.log('⛔ Seeding skipped in non-development environment');
    return;
  }

  console.log('🌱 Starting database seeding...');

  await knex.transaction(async (trx) => {
    // ========================================================
    // CLEAR EXISTING DATA (in reverse dependency order)
    // ========================================================
    console.log('🗑️  Clearing existing data...');
    
    await trx('online_orders').del();
    await trx('employee_sales').del();
    await trx('refresh_tokens').del();
    await trx('audit_logs').del();
    await trx('quality_checks').del();
    await trx('batch_ingredients').del();
    await trx('batches').del();
    await trx('recipe_ingredients').del();
    await trx('recipes').del();
    await trx('ingredients').del();
    await trx('suppliers').del();
    await trx('users').del();

    // ========================================================
    // 1. USERS (All Roles)
    // ========================================================
    console.log('👥 Seeding users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const [manager, warehouse, production, qc, mechanic, controller, admin] = await trx('users')
      .insert([
        {
          email: 'manager@chocoops.com',
          password_hash: hashedPassword,
          name: 'Sarah Manager',
          role: 'MANAGER',
          is_active: true,
        },
        {
          email: 'warehouse@chocoops.com',
          password_hash: hashedPassword,
          name: 'Sam Warehouse',
          role: 'WAREHOUSE',
          is_active: true,
        },
        {
          email: 'production@chocoops.com',
          password_hash: hashedPassword,
          name: 'Alex Production',
          role: 'PRODUCTION',
          is_active: true,
        },
        {
          email: 'qc@chocoops.com',
          password_hash: hashedPassword,
          name: 'Quinn Quality',
          role: 'QC',
          is_active: true,
        },
        {
          email: 'mechanic@chocoops.com',
          password_hash: hashedPassword,
          name: 'Mike Mechanic',
          role: 'MECHANIC',
          is_active: true,
        },
        {
          email: 'controller@chocoops.com',
          password_hash: hashedPassword,
          name: 'Chris Controller',
          role: 'CONTROLLER',
          is_active: true,
        },
        {
          email: 'admin@chocoops.com',
          password_hash: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          is_active: true,
        },
      ])
      .returning('*');

    // ========================================================
    // 2. SUPPLIERS
    // ========================================================
    console.log('🏭 Seeding suppliers...');
    
    const [supplier1, supplier2] = await trx('suppliers')
      .insert([
        {
          name: 'Cocoa Masters Inc.',
          contact_email: 'orders@cocoamasters.com',
          contact_phone: '+1-555-0100',
          reliability_rating: 'EXCELLENT',
          total_deliveries: 50,
          on_time_deliveries: 48,
          is_active: true,
          created_by: manager.id,
        },
        {
          name: 'Sweet Supplies Co.',
          contact_email: 'sales@sweetsupplies.com',
          contact_phone: '+1-555-0200',
          reliability_rating: 'GOOD',
          total_deliveries: 30,
          on_time_deliveries: 25,
          is_active: true,
          created_by: manager.id,
        },
      ])
      .returning('*');

    // ========================================================
    // 3. INGREDIENTS
    // ========================================================
    console.log('📦 Seeding ingredients...');
    
    const [cocoaMass, cocoaButter, caneSugar, milkPowder, vanilla, lecithin] = await trx('ingredients')
      .insert([
        {
          name: 'Cocoa Mass',
          code: 'CM-001',
          current_stock: 100.5,
          minimum_stock: 20.0,
          optimal_stock: 150.0,
          unit: 'kg',
          aisle: 'A',
          shelf: '1',
          bin: '01',
          cost_per_unit: 8.50,
          expiry_date: new Date('2026-12-31'),
          supplier_id: supplier1.id,
          created_by: manager.id,
        },
        {
          name: 'Cocoa Butter',
          code: 'CB-001',
          current_stock: 75.0,
          minimum_stock: 15.0,
          optimal_stock: 100.0,
          unit: 'kg',
          aisle: 'A',
          shelf: '1',
          bin: '02',
          cost_per_unit: 12.00,
          expiry_date: new Date('2026-12-31'),
          supplier_id: supplier1.id,
          created_by: manager.id,
        },
        {
          name: 'Cane Sugar',
          code: 'SG-001',
          current_stock: 250.0,
          minimum_stock: 50.0,
          optimal_stock: 300.0,
          unit: 'kg',
          aisle: 'B',
          shelf: '2',
          bin: '01',
          cost_per_unit: 1.20,
          supplier_id: supplier2.id,
          created_by: manager.id,
        },
        {
          name: 'Milk Powder',
          code: 'MP-001',
          current_stock: 80.0,
          minimum_stock: 20.0,
          optimal_stock: 120.0,
          unit: 'kg',
          aisle: 'B',
          shelf: '3',
          bin: '01',
          cost_per_unit: 4.50,
          expiry_date: new Date('2026-06-30'),
          supplier_id: supplier2.id,
          created_by: manager.id,
        },
        {
          name: 'Vanilla Extract',
          code: 'VE-001',
          current_stock: 5.0,
          minimum_stock: 1.0,
          optimal_stock: 10.0,
          unit: 'liter',
          aisle: 'C',
          shelf: '1',
          bin: '01',
          cost_per_unit: 45.00,
          supplier_id: supplier2.id,
          created_by: manager.id,
        },
        {
          name: 'Soy Lecithin',
          code: 'SL-001',
          current_stock: 10.0,
          minimum_stock: 2.0,
          optimal_stock: 15.0,
          unit: 'kg',
          aisle: 'C',
          shelf: '2',
          bin: '01',
          cost_per_unit: 6.00,
          supplier_id: supplier1.id,
          created_by: manager.id,
        },
      ])
      .returning('*');

    // ========================================================
    // 4. RECIPES
    // ========================================================
    console.log('📖 Seeding recipes...');
    
    const [darkChocolate, milkChocolate] = await trx('recipes')
      .insert([
        {
          name: 'Dark Chocolate 70%',
          description: 'Premium dark chocolate with 70% cocoa content',
          yield_quantity: 10.0,
          yield_unit: 'kg',
          estimated_cost_per_batch: 95.00,
          instructions: JSON.stringify([
            { step: 1, action: 'Melt cocoa butter at 45°C' },
            { step: 2, action: 'Mix in cocoa mass gradually' },
            { step: 3, action: 'Add sugar and lecithin' },
            { step: 4, action: 'Conche for 12 hours at 55°C' },
            { step: 5, action: 'Temper to 31°C' },
            { step: 6, action: 'Mold and cool' },
          ]),
          created_by: manager.id,
        },
        {
          name: 'Milk Chocolate 40%',
          description: 'Creamy milk chocolate with 40% cocoa',
          yield_quantity: 10.0,
          yield_unit: 'kg',
          estimated_cost_per_batch: 85.00,
          instructions: JSON.stringify([
            { step: 1, action: 'Melt cocoa butter and cocoa mass' },
            { step: 2, action: 'Add milk powder and sugar' },
            { step: 3, action: 'Add vanilla and lecithin' },
            { step: 4, action: 'Conche for 8 hours' },
            { step: 5, action: 'Temper and mold' },
          ]),
          created_by: manager.id,
        },
      ])
      .returning('*');

    // ========================================================
    // 5. RECIPE INGREDIENTS
    // ========================================================
    console.log('🔗 Seeding recipe ingredients...');
    
    await trx('recipe_ingredients').insert([
      // Dark Chocolate 70%
      { recipe_id: darkChocolate.id, ingredient_id: cocoaMass.id, quantity_per_batch: 5.0, unit: 'kg' },
      { recipe_id: darkChocolate.id, ingredient_id: cocoaButter.id, quantity_per_batch: 2.0, unit: 'kg' },
      { recipe_id: darkChocolate.id, ingredient_id: caneSugar.id, quantity_per_batch: 3.0, unit: 'kg' },
      { recipe_id: darkChocolate.id, ingredient_id: lecithin.id, quantity_per_batch: 0.05, unit: 'kg' },
      
      // Milk Chocolate 40%
      { recipe_id: milkChocolate.id, ingredient_id: cocoaMass.id, quantity_per_batch: 2.5, unit: 'kg' },
      { recipe_id: milkChocolate.id, ingredient_id: cocoaButter.id, quantity_per_batch: 1.5, unit: 'kg' },
      { recipe_id: milkChocolate.id, ingredient_id: caneSugar.id, quantity_per_batch: 4.0, unit: 'kg' },
      { recipe_id: milkChocolate.id, ingredient_id: milkPowder.id, quantity_per_batch: 2.0, unit: 'kg' },
      { recipe_id: milkChocolate.id, ingredient_id: vanilla.id, quantity_per_batch: 0.02, unit: 'liter' },
      { recipe_id: milkChocolate.id, ingredient_id: lecithin.id, quantity_per_batch: 0.03, unit: 'kg' },
    ]);

    // ========================================================
    // 6. BATCHES
    // ========================================================
    console.log('🏭 Seeding batches...');
    
    const [batch1, batch2, batch3] = await trx('batches')
      .insert([
        {
          recipe_id: darkChocolate.id,
          quantity_produced: 10.0,
          status: 'COMPLETED',
          produced_by: production.id,
          created_by: manager.id,
          started_at: new Date('2026-01-20T08:00:00Z'),
          completed_at: new Date('2026-01-20T20:00:00Z'),
          actual_yield: 9.8,
          waste_percentage: 2.0,
          actual_cost: 93.50,
          notes: 'Excellent batch, minimal waste',
        },
        {
          recipe_id: milkChocolate.id,
          quantity_produced: 10.0,
          status: 'COMPLETED',
          produced_by: production.id,
          created_by: manager.id,
          started_at: new Date('2026-01-21T08:00:00Z'),
          completed_at: new Date('2026-01-21T16:00:00Z'),
          actual_yield: 9.5,
          waste_percentage: 5.0,
          actual_cost: 87.00,
        },
        {
          recipe_id: darkChocolate.id,
          quantity_produced: 10.0,
          status: 'IN_PROGRESS',
          produced_by: production.id,
          created_by: manager.id,
          started_at: new Date('2026-01-22T08:00:00Z'),
          notes: 'Currently in conching phase',
        },
      ])
      .returning('*');

    // ========================================================
    // 7. BATCH INGREDIENTS
    // ========================================================
    console.log('📊 Seeding batch ingredients...');
    
    await trx('batch_ingredients').insert([
      // Batch 1 (Dark Chocolate)
      { batch_id: batch1.id, ingredient_id: cocoaMass.id, quantity_used: 5.0, unit: 'kg', lot_number: 'LOT-CM-2026-01', cost_at_time: 8.50 },
      { batch_id: batch1.id, ingredient_id: cocoaButter.id, quantity_used: 2.0, unit: 'kg', lot_number: 'LOT-CB-2026-01', cost_at_time: 12.00 },
      { batch_id: batch1.id, ingredient_id: caneSugar.id, quantity_used: 3.0, unit: 'kg', lot_number: 'LOT-SG-2026-01', cost_at_time: 1.20 },
      { batch_id: batch1.id, ingredient_id: lecithin.id, quantity_used: 0.05, unit: 'kg', lot_number: 'LOT-SL-2026-01', cost_at_time: 6.00 },
      
      // Batch 2 (Milk Chocolate)
      { batch_id: batch2.id, ingredient_id: cocoaMass.id, quantity_used: 2.5, unit: 'kg', lot_number: 'LOT-CM-2026-02', cost_at_time: 8.50 },
      { batch_id: batch2.id, ingredient_id: cocoaButter.id, quantity_used: 1.5, unit: 'kg', lot_number: 'LOT-CB-2026-02', cost_at_time: 12.00 },
      { batch_id: batch2.id, ingredient_id: caneSugar.id, quantity_used: 4.0, unit: 'kg', lot_number: 'LOT-SG-2026-02', cost_at_time: 1.20 },
      { batch_id: batch2.id, ingredient_id: milkPowder.id, quantity_used: 2.0, unit: 'kg', lot_number: 'LOT-MP-2026-01', cost_at_time: 4.50 },
      { batch_id: batch2.id, ingredient_id: vanilla.id, quantity_used: 0.02, unit: 'liter', lot_number: 'LOT-VE-2026-01', cost_at_time: 45.00 },
      { batch_id: batch2.id, ingredient_id: lecithin.id, quantity_used: 0.03, unit: 'kg', lot_number: 'LOT-SL-2026-02', cost_at_time: 6.00 },
    ]);

    // ========================================================
    // 8. QUALITY CHECKS
    // ========================================================
    console.log('✅ Seeding quality checks...');
    
    await trx('quality_checks').insert([
      {
        batch_id: batch1.id,
        checked_by: qc.id,
        appearance: 'PASS',
        texture: 'PASS',
        taste: 'PASS',
        packaging: 'PASS',
        defect_count: 0,
        final_status: 'APPROVED',
        notes: 'Excellent quality, ready for sale',
      },
      {
        batch_id: batch2.id,
        checked_by: qc.id,
        appearance: 'PASS',
        texture: 'PASS',
        taste: 'PASS',
        packaging: 'FAIL',
        defect_count: 3,
        defect_description: 'Minor packaging defects on 3 bars',
        final_status: 'APPROVED',
        notes: 'Approved with minor packaging issues',
      },
    ]);

    // ========================================================
    // 9. AUDIT LOGS
    // ========================================================
    console.log('📝 Seeding audit logs...');
    
    await trx('audit_logs').insert([
      {
        user_id: manager.id,
        action: 'BATCH_CREATED',
        resource: 'batches',
        resource_id: batch1.id,
        new_values: JSON.stringify({ status: 'PLANNED', recipe_id: darkChocolate.id }),
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0',
      },
      {
        user_id: production.id,
        action: 'BATCH_STARTED',
        resource: 'batches',
        resource_id: batch1.id,
        old_values: JSON.stringify({ status: 'PLANNED' }),
        new_values: JSON.stringify({ status: 'IN_PROGRESS' }),
        ip_address: '127.0.0.1',
      },
      {
        user_id: production.id,
        action: 'BATCH_COMPLETED',
        resource: 'batches',
        resource_id: batch1.id,
        old_values: JSON.stringify({ status: 'IN_PROGRESS' }),
        new_values: JSON.stringify({ status: 'COMPLETED', actual_yield: 9.8 }),
        ip_address: '127.0.0.1',
      },
      {
        user_id: qc.id,
        action: 'QUALITY_CHECK_APPROVED',
        resource: 'quality_checks',
        resource_id: batch1.id,
        new_values: JSON.stringify({ final_status: 'APPROVED' }),
        ip_address: '127.0.0.1',
      },
    ]);

    // ========================================================
    // 10. EMPLOYEE SALES
    // ========================================================
    console.log('💰 Seeding employee sales...');
    
    await trx('employee_sales').insert([
      {
        seller_id: warehouse.id,
        buyer_id: production.id,
        batch_id: batch1.id,
        quantity_sold: 0.5,
        unit: 'kg',
        original_price: 10.00,
        discount_percentage: 20.0,
        final_amount: 8.00,
        payment_method: 'CASH',
        status: 'PAID',
        sale_date: new Date('2026-01-21T10:00:00Z'),
        notes: 'Employee purchase with standard 20% discount',
      },
      {
        seller_id: warehouse.id,
        buyer_id: mechanic.id,
        batch_id: batch2.id,
        quantity_sold: 1.0,
        unit: 'kg',
        original_price: 18.00,
        discount_percentage: 25.0,
        final_amount: 13.50,
        payment_method: 'EMPLOYEE_DEDUCTION',
        status: 'PENDING',
        sale_date: new Date('2026-01-22T14:00:00Z'),
        notes: 'Payroll deduction requested',
      },
    ]);

    // ========================================================
    // 11. ONLINE ORDERS
    // ========================================================
    console.log('🌐 Seeding online orders...');
    
    await trx('online_orders').insert([
      {
        customer_email: 'customer1@example.com',
        customer_name: 'David Customer',
        batch_id: batch1.id,
        quantity: 2.0,
        unit: 'kg',
        total_amount: 160.00,
        status: 'SHIPPED',
        order_date: new Date('2026-01-21T12:00:00Z'),
        processed_date: new Date('2026-01-21T14:00:00Z'),
        notes: 'Express shipping requested',
      },
      {
        customer_email: 'customer2@example.com',
        customer_name: 'Emma Buyer',
        batch_id: batch2.id,
        quantity: 1.5,
        unit: 'kg',
        total_amount: 120.00,
        status: 'PROCESSING',
        order_date: new Date('2026-01-22T09:00:00Z'),
        notes: 'Gift wrapping requested',
      },
      {
        customer_email: 'customer3@example.com',
        customer_name: 'Frank Chocolate',
        batch_id: batch1.id,
        quantity: 5.0,
        unit: 'kg',
        total_amount: 400.00,
        status: 'PENDING',
        order_date: new Date('2026-01-22T15:00:00Z'),
        notes: 'Bulk order for corporate event',
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('   • 7 Users (all roles)');
    console.log('   • 2 Suppliers');
    console.log('   • 6 Ingredients');
    console.log('   • 2 Recipes');
    console.log('   • 3 Batches (2 completed, 1 in progress)');
    console.log('   • 2 Quality Checks');
    console.log('   • 4 Audit Logs');
    console.log('   • 2 Employee Sales');
    console.log('   • 3 Online Orders');
    console.log('\n🔐 Login Credentials (password: password123):');
    console.log('   • Manager:    manager@chocoops.com');
    console.log('   • Warehouse:  warehouse@chocoops.com');
    console.log('   • Production: production@chocoops.com');
    console.log('   • QC:         qc@chocoops.com');
    console.log('   • Mechanic:   mechanic@chocoops.com');
    console.log('   • Controller: controller@chocoops.com');
    console.log('   • Admin:      admin@chocoops.com');
  });
}
