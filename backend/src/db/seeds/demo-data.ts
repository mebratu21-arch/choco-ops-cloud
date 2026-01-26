import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs'; // Using bcryptjs as per package.json

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('audit_logs').del();
  await knex('qc_records').del();
  await knex('batch_ingredients').del();
  await knex('maintenance_logs').del();
  await knex('equipment').del();
  await knex('sales_orders').del();
  await knex('production_batches').del();
  await knex('ingredients').del();
  await knex('products').del();
  await knex('refresh_tokens').del();
  await knex('users').del();
 
  // Create users
  const hashedPassword = await bcrypt.hash('Password123!', 10);
 
  const users = [
    {
      id: uuidv4(),
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
    {
      id: uuidv4(),
      email: 'manager@example.com',
      password: hashedPassword,
      role: 'MANAGER',
    },
    {
      id: uuidv4(),
      email: 'operator@example.com',
      password: hashedPassword,
      role: 'OPERATOR',
    },
    {
      id: uuidv4(),
      email: 'qc@example.com',
      password: hashedPassword,
      role: 'QC',
    },
    {
      id: uuidv4(),
      email: 'sales@example.com',
      password: hashedPassword,
      role: 'SALES',
    },
  ];
 
  await knex('users').insert(users);
 
  // Create ingredients
  const ingredients = [
    {
      id: uuidv4(),
      name: 'Flour',
      sku: 'ING-001',
      quantity: 500.00,
      unit: 'kg',
      min_threshold: 100.00,
      cost_per_unit: 2.50,
      supplier: 'ABC Suppliers',
    },
    {
      id: uuidv4(),
      name: 'Sugar',
      sku: 'ING-002',
      quantity: 300.00,
      unit: 'kg',
      min_threshold: 75.00,
      cost_per_unit: 1.80,
      supplier: 'Sweet Co.',
    },
    {
      id: uuidv4(),
      name: 'Salt',
      sku: 'ING-003',
      quantity: 150.00,
      unit: 'kg',
      min_threshold: 50.00,
      cost_per_unit: 0.90,
      supplier: 'ABC Suppliers',
    },
    {
      id: uuidv4(),
      name: 'Yeast',
      sku: 'ING-004',
      quantity: 25.00,
      unit: 'kg',
      min_threshold: 10.00,
      cost_per_unit: 15.00,
      supplier: 'Bio Ingredients',
    },
  ];
 
  await knex('ingredients').insert(ingredients);
 
  // Create products
  const products = [
    {
      id: uuidv4(),
      name: 'White Bread',
      sku: 'PRD-001',
      description: 'Classic white bread',
      price: 3.50,
      stock_quantity: 100,
    },
    {
      id: uuidv4(),
      name: 'Whole Wheat Bread',
      sku: 'PRD-002',
      description: 'Healthy whole wheat bread',
      price: 4.00,
      stock_quantity: 75,
    },
  ];
 
  await knex('products').insert(products);
 
  // Create production batches
  const batches = [
    {
      id: uuidv4(),
      batch_number: 'BATCH-2026-001',
      product_name: 'White Bread',
      quantity_planned: 200,
      quantity_actual: 195,
      status: 'COMPLETED',
      started_at: new Date('2026-01-20T08:00:00Z'),
      completed_at: new Date('2026-01-20T16:00:00Z'),
    },
    {
      id: uuidv4(),
      batch_number: 'BATCH-2026-002',
      product_name: 'Whole Wheat Bread',
      quantity_planned: 150,
      status: 'IN_PROGRESS',
      started_at: new Date('2026-01-26T07:00:00Z'),
    },
  ];
 
  await knex('production_batches').insert(batches);
 
  // Create equipment
  const equipment = [
    {
      id: uuidv4(),
      equipment_id: 'EQ-001',
      name: 'Industrial Oven #1',
      type: 'OVEN',
      status: 'OPERATIONAL',
      purchase_date: '2024-01-15',
      last_maintenance: '2025-12-01',
      next_maintenance: '2026-06-01',
    },
    {
      id: uuidv4(),
      equipment_id: 'EQ-002',
      name: 'Mixer #1',
      type: 'MIXER',
      status: 'MAINTENANCE',
      purchase_date: '2023-06-20',
      last_maintenance: '2026-01-10',
    },
  ];
 
  await knex('equipment').insert(equipment);
 
  console.log('✅ Demo data seeded successfully');
}
