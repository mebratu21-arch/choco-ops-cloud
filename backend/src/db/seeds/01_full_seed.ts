
import { Knex } from 'knex';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 4;

const hash = (pw: string) => bcrypt.hashSync(pw, SALT_ROUNDS);

export async function seed(knex: Knex): Promise<void> {
  // 1. REVERSE DEPENDENCY TRUNCATE
  // We use CASCADE to handle FKs automatically during clear, but manual order is safer for understanding
  await knex.raw('TRUNCATE TABLE refresh_tokens, audit_logs, employee_sales, online_orders, order_items, orders, tasks, announcements, machine_manuals, maintenance_logs, sos_alerts, qc_defects, qc_checks, batch_materials, production_batches, recipe_ingredients, inventory_movements, ingredients, recipes, inventory_items, machines, suppliers, users, products RESTART IDENTITY CASCADE');

  // 2. FORWARD INSERT
  
  // --- USERS ---
  const users = [
    { role: 'ADMIN', email: 'admin@cocoaflow.com', name: 'Willy Wonka', pass: 'admin123' },
    { role: 'ADMIN', email: 'admin2@cocoaflow.com', name: 'Charlie Bucket', pass: 'admin123' },
    { role: 'MANAGER', email: 'manager@cocoaflow.com', name: 'Oompa Loompa Chief', pass: 'manager123' },
    { role: 'PRODUCTION', email: 'worker@cocoaflow.com', name: 'Augustus Gloop', pass: 'worker123' },
    { role: 'WAREHOUSE', email: 'warehouse@cocoaflow.com', name: 'Mike Teavee', pass: 'warehouse123' },
    { role: 'QC', email: 'qc@cocoaflow.com', name: 'Veruca Salt', pass: 'qc123' },
    { role: 'MECHANIC', email: 'mechanic@cocoaflow.com', name: 'Violet Beauregarde', pass: 'mechanic123' },
    { role: 'CONTROLLER', email: 'sales@cocoaflow.com', name: 'Arthur Slugworth', pass: 'sales123' }
  ];

  const userIds: Record<string, string> = {};

  for (const u of users) {
    const [inserted] = await knex('users').insert({
      email: u.email,
      password_hash: hash(u.pass),
      full_name: u.name,
      role: u.role,
      is_active: true
    }).returning('id');
    userIds[u.role] = inserted.id; // Store first user of each role for reference
  }

  // --- SUPPLIERS ---
  const [supplier] = await knex('suppliers').insert({
    name: 'Ghana Cocoa Co.',
    contact_person: 'Kofi Annan',
    email: 'supply@ghanacocoa.com',
    phone: '+233 55 555 5555',
    address: 'Accra, Ghana'
  }).returning('id');

  // --- MACHINES ---
  const machines = [
    { name: 'Melanger 3000', code: 'EQ-001', type: 'grinder', status: 'operational' },
    { name: 'Conch Master', code: 'EQ-002', type: 'mixer', status: 'operational' },
    { name: 'Temper Pro', code: 'EQ-003', type: 'packaging_machine', status: 'maintenance' },
    { name: 'Bean Roaster Elite', code: 'EQ-004', type: 'roaster', status: 'operational' },
    { name: 'Winnowing Unit X', code: 'EQ-005', type: 'separator', status: 'operational' },
    { name: 'Ball Mill Refiner 02', code: 'EQ-006', type: 'refiner', status: 'operational' },
    { name: 'Flow-Wrap System', code: 'EQ-007', type: 'packaging_machine', status: 'operational' }
  ];
  
  const machineIds = [];
  for (const m of machines) {
    const [res] = await knex('machines').insert({
      name: m.name,
      machine_code: m.code,
      type: m.type,
      status: m.status
    }).returning('id');
    machineIds.push(res.id);
  }

  // --- INVENTORY ITEMS ---
  const items = [
    { name: 'Cocoa Butter', code: 'ING-001', category: 'raw_material', unit: 'kg', qty: 500, loc: 'Aisle A, Shelf 1', exp: 365 },
    { name: 'Cocoa Powder', code: 'ING-002', category: 'raw_material', unit: 'kg', qty: 1000, loc: 'Aisle A, Shelf 2', exp: 730 },
    { name: 'Sugar', code: 'ING-003', category: 'ingredient', unit: 'kg', qty: 2000, loc: 'Aisle B, Shelf 1', exp: 1095 },
    { name: 'Milk Powder', code: 'ING-004', category: 'ingredient', unit: 'kg', qty: 800, loc: 'Cold Storage 1', exp: 180 },
    { name: 'Almonds', code: 'ING-005', category: 'ingredient', unit: 'kg', qty: 200, loc: 'Aisle C, Shelf 1', exp: 365 },
    { name: 'Hazelnuts', code: 'ING-006', category: 'ingredient', unit: 'kg', qty: 300, loc: 'Aisle C, Shelf 2', exp: 365 },
    { name: 'Vanilla Extract', code: 'ING-007', category: 'ingredient', unit: 'liters', qty: 50, loc: 'Cabinet 4', exp: 730 },
    { name: 'Caramel', code: 'ING-008', category: 'ingredient', unit: 'kg', qty: 100, loc: 'Aisle B, Shelf 3', exp: 365 },
    { name: 'Cream', code: 'ING-009', category: 'ingredient', unit: 'liters', qty: 40, loc: 'Cold Storage 2', exp: 14 },
    { name: 'Dark Chocolate Chips', code: 'ING-010', category: 'ingredient', unit: 'kg', qty: 600, loc: 'Aisle A, Shelf 4', exp: 365 },
    { name: 'Gold Foil', code: 'PKG-001', category: 'packaging', unit: 'sheets', qty: 5000, loc: 'Aisle D, Shelf 1', exp: null }
  ];

  const itemIds: Record<string, string> = {};
  for (const item of items) {
    const expiryDate = item.exp ? new Date() : null;
    if (expiryDate && item.exp) {
      expiryDate.setDate(expiryDate.getDate() + item.exp);
    }

    const [res] = await knex('inventory_items').insert({
      name: item.name,
      code: item.code,
      category: item.category,
      quantity: item.qty,
      unit: item.unit,
      supplier_id: supplier.id,
      location: item.loc,
      expiry_date: expiryDate,
      reorder_level: 50,
      cost_per_unit: 10.50
    }).returning('id');
    itemIds[item.name] = res.id;
  }

  // --- RECIPES ---
  const [recipe] = await knex('recipes').insert({
    name: 'Hazelnut Truffle',
    category: 'truffles',
    yield_quantity: 100,
    yield_unit: 'pieces',
    duration_minutes: 60,
    difficulty_level: 'medium',
    instructions: 'Mix cocoa, cream, and hazelnuts. Roll into balls. Coat in chocolate.'
  }).returning('id');

  // --- RECIPE INGREDIENTS ---
  await knex('recipe_ingredients').insert([
    { recipe_id: recipe.id, inventory_item_id: itemIds['Cocoa Powder'], quantity: 5, unit: 'kg' },
    { recipe_id: recipe.id, inventory_item_id: itemIds['Hazelnuts'], quantity: 2, unit: 'kg' },
    { recipe_id: recipe.id, inventory_item_id: itemIds['Cream'], quantity: 1, unit: 'liters' }
  ]);

  // --- PRODUCTION BATCHES ---
  const [batch] = await knex('production_batches').insert({
    batch_number: 'BATCH-2023-001',
    recipe_id: recipe.id,
    status: 'completed',
    target_quantity: 500,
    actual_quantity: 495,
    started_by: userIds['PRODUCTION'],
    started_at: new Date(Date.now() - 86400000), // yesterday
    completed_at: new Date()
  }).returning('id');

  // --- BATCH MATERIALS ---
  await knex('batch_materials').insert({
     batch_id: batch.id,
     inventory_item_id: itemIds['Cocoa Powder'],
     quantity_used: 25,
     unit: 'kg'
  });

  // --- QC CHECKS ---
  await knex('qc_checks').insert({
    batch_id: batch.id,
    inspector_id: userIds['QC'],
    result: 'approved',
    appearance_score: 5,
    texture_score: 5,
    taste_score: 4,
    notes: 'Excellent batch'
  });

  // --- SOS ALERTS ---
  await knex('sos_alerts').insert({
    machine_id: machineIds[2], // Temper Pro (maintenance)
    reported_by: userIds['PRODUCTION'],
    priority: 'high',
    status: 'open',
    problem_description: 'Machine is overheating during tempering process.'
  });

  // --- MAINTENANCE LOGS ---
  await knex('maintenance_logs').insert({
    machine_id: machineIds[0],
    mechanic_id: userIds['MECHANIC'],
    maintenance_type: 'preventive',
    description: 'Routine oil change and cleaning.',
    duration_minutes: 45
  });

  // --- EMPLOYEE SALES ---
  const employeeSalesData = [
    { seller_id: userIds['WAREHOUSE'], buyer_id: userIds['MANAGER'], batch_id: batch.id, quantity_sold: 10, unit: 'pieces', original_price: 150.00, discount_percentage: 10, final_amount: 135.00, payment_method: 'CARD', status: 'PAID', notes: 'Employee discount applied' },
    { seller_id: userIds['WAREHOUSE'], buyer_id: userIds['PRODUCTION'], batch_id: batch.id, quantity_sold: 5, unit: 'pieces', original_price: 75.00, discount_percentage: 15, final_amount: 63.75, payment_method: 'CASH', status: 'PAID', notes: 'Staff purchase' },
    { seller_id: userIds['WAREHOUSE'], buyer_id: userIds['QC'], batch_id: batch.id, quantity_sold: 8, unit: 'pieces', original_price: 120.00, discount_percentage: 10, final_amount: 108.00, payment_method: 'TRANSFER', status: 'PAID', notes: 'Quality team order' },
    { seller_id: userIds['WAREHOUSE'], buyer_id: userIds['MECHANIC'], batch_id: batch.id, quantity_sold: 3, unit: 'pieces', original_price: 45.00, discount_percentage: 20, final_amount: 36.00, payment_method: 'CASH', status: 'PENDING', notes: 'Awaiting payment' },
    { seller_id: userIds['WAREHOUSE'], buyer_id: userIds['ADMIN'], batch_id: batch.id, quantity_sold: 20, unit: 'pieces', original_price: 300.00, discount_percentage: 25, final_amount: 225.00, payment_method: 'CARD', status: 'PAID', notes: 'Executive gift package' },
  ];

  for (const sale of employeeSalesData) {
    await knex('employee_sales').insert(sale);
  }

  // --- ONLINE ORDERS ---
  const onlineOrdersData = [
    { customer_name: 'Sarah Johnson', customer_email: 'sarah.j@gmail.com', total_amount: 89.99, status: 'PENDING', order_date: new Date(), quantity: 10, unit: 'pieces', batch_id: batch.id },
    { customer_name: 'Michael Chen', customer_email: 'mchen@outlook.com', total_amount: 234.50, status: 'PROCESSING', order_date: new Date(Date.now() - 86400000), quantity: 25, unit: 'pieces', batch_id: batch.id },
    { customer_name: 'Emily Davis', customer_email: 'emily.davis@yahoo.com', total_amount: 156.00, status: 'SHIPPED', order_date: new Date(Date.now() - 172800000), quantity: 15, unit: 'pieces', batch_id: batch.id },
    { customer_name: 'Robert Wilson', customer_email: 'rwilson@company.com', total_amount: 445.00, status: 'DELIVERED', order_date: new Date(Date.now() - 432000000), quantity: 50, unit: 'pieces', batch_id: batch.id },
    { customer_name: 'Jennifer Martinez', customer_email: 'jmartinez@email.com', total_amount: 67.50, status: 'PENDING', order_date: new Date(), quantity: 5, unit: 'pieces', batch_id: batch.id },
    { customer_name: 'David Brown', customer_email: 'dbrown@tech.io', total_amount: 189.99, status: 'PROCESSING', order_date: new Date(Date.now() - 43200000), quantity: 20, unit: 'pieces', batch_id: batch.id },
    { customer_name: 'Lisa Anderson', customer_email: 'lisa.a@business.com', total_amount: 312.00, status: 'DELIVERED', order_date: new Date(Date.now() - 604800000), quantity: 30, unit: 'pieces', batch_id: batch.id },
    { customer_name: 'James Taylor', customer_email: 'jtaylor@mail.com', total_amount: 78.25, status: 'CANCELLED', order_date: new Date(Date.now() - 259200000), quantity: 10, unit: 'pieces', batch_id: batch.id },
  ];

  for (const order of onlineOrdersData) {
    await knex('online_orders').insert(order);
  }

  // --- PRODUCTS ---
  const products = [
    { name: 'Classic Dark Chocolate Bar', price: 12.99, image_url: '/assets/products/premium-bar.jpg', category: 'Bars', stock: 150, sku: 'BAR-001' },
    { name: 'Artisanal Heart Bonbons (9pc)', price: 34.99, image_url: '/assets/products/bonbon-selection.webp', category: 'Gift Box', stock: 45, sku: 'GIFT-001' },
    { name: 'Truffle Deluxe Collection', price: 49.99, image_url: '/assets/products/truffle-box.jpg', category: 'Premium', stock: 30, sku: 'PREM-001' },
    { name: 'Dark Caramelized Hazelnut', price: 15.99, image_url: '/assets/products/DarkCarmelizedHazelnut.webp', category: 'Bars', stock: 120, sku: 'BAR-002' },
    { name: 'Hazelnut Milk Chocolate', price: 14.99, image_url: '/assets/products/milk-chocolate.jpg', category: 'Bars', stock: 95, sku: 'BAR-003' },
    { name: 'Chocolate Dragée Mix', price: 18.99, image_url: '/assets/products/Dragee.webp', category: 'Dragées', stock: 80, sku: 'DRG-001' },
    { name: 'Dark Pralines Gift Box', price: 59.99, image_url: '/assets/products/dark-pralines.jpg', category: 'Gift Box', stock: 25, sku: 'GIFT-002' },
    { name: 'Artisan Bars Collection', price: 64.99, image_url: '/assets/products/artisan-bars.jpg', category: 'Gift Box', stock: 20, sku: 'GIFT-003' },
    { name: 'Cocoa Truffles Selection', price: 29.99, image_url: '/assets/products/cocoa-truffles.jpg', category: 'Premium', stock: 40, sku: 'PREM-002' },
    { name: 'Factory Fresh Pralines', price: 44.99, image_url: '/assets/products/chocolate-production.jpg', category: 'Premium', stock: 35, sku: 'PREM-003' },
    { name: 'Hazelnut Cocoa Spread', price: 9.99, image_url: '/assets/products/premium-bar.jpg', category: 'Spreads', stock: 200, sku: 'SPD-001' },
    { name: 'Dark Chocolate Almond Spread', price: 11.49, image_url: '/assets/products/DarkCarmelizedHazelnut.webp', category: 'Spreads', stock: 160, sku: 'SPD-002' },
    { name: 'Winter Spice Truffle Box', price: 39.99, image_url: '/assets/products/truffle-box.jpg', category: 'Seasonal', stock: 50, sku: 'SEAS-001' },
    { name: 'Valentine Heart Collection', price: 54.99, image_url: '/assets/products/bonbon-selection.webp', category: 'Seasonal', stock: 30, sku: 'SEAS-002' },
    { name: 'Pure Cocoa Powder (250g)', price: 8.99, image_url: '/assets/products/cocoa-truffles.jpg', category: 'Cocoa Powders', stock: 300, sku: 'PWD-001' },
    { name: 'Hot Chocolate Mix Deluxe', price: 13.99, image_url: '/assets/products/milk-chocolate.jpg', category: 'Beverages', stock: 180, sku: 'BEV-001' },
  ];

  for (const p of products) {
    await knex('products').insert(p);
  }

  console.log('Seed completed successfully!');
}
