
import { Knex } from 'knex';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 4;

const hash = (pw: string) => bcrypt.hashSync(pw, SALT_ROUNDS);

export async function seed(knex: Knex): Promise<void> {
  // 1. REVERSE DEPENDENCY TRUNCATE
  // We use CASCADE to handle FKs automatically during clear, but manual order is safer for understanding
  await knex.raw('TRUNCATE TABLE refresh_tokens, audit_logs, employee_sales, online_orders, order_items, orders, tasks, announcements, machine_manuals, maintenance_logs, sos_alerts, qc_defects, qc_checks, batch_materials, production_batches, recipe_ingredients, inventory_movements, ingredients, recipes, inventory_items, machines, suppliers, users RESTART IDENTITY CASCADE');

  // 2. FORWARD INSERT
  
  // --- USERS ---
  const users = [
    { role: 'admin', email: 'admin@cocoaflow.com', name: 'Willy Wonka', pass: 'admin123' },
    { role: 'admin', email: 'admin2@cocoaflow.com', name: 'Charlie Bucket', pass: 'admin123' },
    { role: 'manager', email: 'manager@cocoaflow.com', name: 'Oompa Loompa Chief', pass: 'manager123' },
    { role: 'production_worker', email: 'worker@cocoaflow.com', name: 'Augustus Gloop', pass: 'worker123' },
    { role: 'warehouse_worker', email: 'warehouse@cocoaflow.com', name: 'Mike Teavee', pass: 'warehouse123' },
    { role: 'quality_controller', email: 'qc@cocoaflow.com', name: 'Veruca Salt', pass: 'qc123' },
    { role: 'mechanic', email: 'mechanic@cocoaflow.com', name: 'Violet Beauregarde', pass: 'mechanic123' },
    { role: 'sales_representative', email: 'sales@cocoaflow.com', name: 'Arthur Slugworth', pass: 'sales123' }
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
    { name: 'Temper Pro', code: 'EQ-003', type: 'packaging_machine', status: 'maintenance' }
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
    { name: 'Cocoa Butter', code: 'ING-001', category: 'raw_material', unit: 'kg', qty: 500 },
    { name: 'Cocoa Powder', code: 'ING-002', category: 'raw_material', unit: 'kg', qty: 1000 },
    { name: 'Sugar', code: 'ING-003', category: 'ingredient', unit: 'kg', qty: 2000 },
    { name: 'Milk Powder', code: 'ING-004', category: 'ingredient', unit: 'kg', qty: 800 },
    { name: 'Almonds', code: 'ING-005', category: 'ingredient', unit: 'kg', qty: 200 },
    { name: 'Hazelnuts', code: 'ING-006', category: 'ingredient', unit: 'kg', qty: 300 },
    { name: 'Vanilla Extract', code: 'ING-007', category: 'ingredient', unit: 'liters', qty: 50 },
    { name: 'Caramel', code: 'ING-008', category: 'ingredient', unit: 'kg', qty: 100 },
    { name: 'Cream', code: 'ING-009', category: 'ingredient', unit: 'liters', qty: 40 },
    { name: 'Dark Chocolate Chips', code: 'ING-010', category: 'ingredient', unit: 'kg', qty: 600 },
    { name: 'Gold Foil', code: 'PKG-001', category: 'packaging', unit: 'sheets', qty: 5000 }
  ];

  const itemIds: Record<string, string> = {};
  for (const item of items) {
    const [res] = await knex('inventory_items').insert({
      name: item.name,
      code: item.code,
      category: item.category,
      quantity: item.qty,
      unit: item.unit,
      supplier_id: supplier.id,
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
    started_by: userIds['production_worker'],
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
    inspector_id: userIds['quality_controller'],
    result: 'approved',
    appearance_score: 5,
    texture_score: 5,
    taste_score: 4,
    notes: 'Excellent batch'
  });

  // --- SOS ALERTS ---
  await knex('sos_alerts').insert({
    machine_id: machineIds[2], // Temper Pro (maintenance)
    reported_by: userIds['production_worker'],
    priority: 'high',
    status: 'open',
    problem_description: 'Machine is overheating during tempering process.'
  });

  // --- MAINTENANCE LOGS ---
  await knex('maintenance_logs').insert({
    machine_id: machineIds[0],
    mechanic_id: userIds['mechanic'],
    maintenance_type: 'preventive',
    description: 'Routine oil change and cleaning.',
    duration_minutes: 45
  });

  console.log('Seed completed successfully!');
}
