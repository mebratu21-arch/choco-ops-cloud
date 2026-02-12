import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  console.log('🚀 Generating Comprehensive Factory Activity Data (Last 30 Days)...');

  // 1. Fetch existing core data
  const users = await knex('users').select('id', 'role');
  const recipes = await knex('recipes').select('id', 'name');
  const machines = await knex('machines').select('id', 'name');
  const inventoryItems = await knex('inventory_items').select('id', 'name', 'unit');

  if (users.length === 0 || recipes.length === 0) {
    console.error('❌ Error: Need users and recipes to generate activity data.');
    return;
  }

  const adminUsers = users.filter(u => u.role === 'ADMIN');
  const productionUsers = users.filter(u => u.role === 'PRODUCTION');
  const salesUsers = users.filter(u => u.role === 'SALES' || u.role === 'ADMIN' || u.role === 'CONTROLLER');
  const anyUsers = users;
  const qcUsers = users.filter(u => u.role === 'QC');
  const mechanicUsers = users.filter(u => u.role === 'MECHANIC');

  // Helper for random date in last 30 days
  const randomDate = (daysAgoStart: number, daysAgoEnd: number) => {
    const start = new Date();
    start.setDate(start.getDate() - daysAgoStart);
    const end = new Date();
    end.setDate(end.getDate() - daysAgoEnd);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  // 2. Generate Production Batches
  console.log('🏭 Generating Production Batches...');
  const batchStatuses = ['pending', 'mixing', 'cooking', 'cooling', 'packaging', 'completed', 'failed'];
  const batches = [];
  
  for (let i = 0; i < 50; i++) {
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    const date = randomDate(30, 0);
    const status = i < 35 ? 'completed' : batchStatuses[Math.floor(Math.random() * (batchStatuses.length - 2))]; 
    const target = (Math.floor(Math.random() * 50) + 10) * 10; // 100-600
    
    batches.push({
      id: uuidv4(),
      batch_number: `B-${date.getFullYear()}-${String(i + 1).padStart(3, '0')}`,
      recipe_id: recipe.id,
      status: status,
      target_quantity: target,
      actual_quantity: status === 'completed' ? target - (Math.random() * 5) : null,
      started_by: (productionUsers[Math.floor(Math.random() * productionUsers.length)] || adminUsers[0]).id,
      started_at: date,
      completed_at: status === 'completed' ? new Date(date.getTime() + (Math.random() * 4 + 2) * 3600000) : null,
      created_at: date,
      updated_at: date
    });
  }
  
  const insertedBatches = await knex('production_batches').insert(batches).returning('*');
  console.log(`✅ Inserted ${insertedBatches.length} production batches.`);

  // 3. Generate Employee Sales
  console.log('💰 Generating Employee Sales...');
  const completedBatches = insertedBatches.filter(b => b.status === 'completed');
  const sales = [];
  
  for (let i = 0; i < 150; i++) {
    const batch = completedBatches[Math.floor(Math.random() * completedBatches.length)];
    const seller = salesUsers[Math.floor(Math.random() * salesUsers.length)] || adminUsers[0];
    const buyer = anyUsers[Math.floor(Math.random() * anyUsers.length)];
    const date = new Date(batch.completed_at || batch.created_at);
    date.setHours(date.getHours() + Math.floor(Math.random() * 48)); // Sold shortly after batch
    
    // Skip if date is in future
    if (date > new Date()) continue;

    const qty = Math.floor(Math.random() * 10) + 1;
    const price = 15.00; // Base price
    const discount = Math.random() < 0.3 ? (Math.floor(Math.random() * 4) + 1) * 5 : 0; // 0, 5, 10, 15, 20%
    const finalAmount = qty * price * (1 - discount / 100);

    sales.push({
      id: uuidv4(),
      seller_id: seller.id,
      buyer_id: buyer.id,
      batch_id: batch.id,
      quantity_sold: qty,
      unit: 'unit',
      original_price: price,
      discount_percentage: discount,
      final_amount: finalAmount,
      payment_method: ['CASH', 'CARD', 'TRANSFER'][Math.floor(Math.random() * 3)],
      status: 'PAID',
      created_at: date,
      updated_at: date
    });
  }
  
  await knex('employee_sales').insert(sales);
  console.log(`✅ Inserted ${sales.length} employee sales.`);

  // 4. Generate Online Orders
  console.log('🌐 Generating Online Orders...');
  const orders = [];
  const customers = [
    { name: 'Alice Cooper', email: 'alice@rock.com' },
    { name: 'Bob Dylan', email: 'bob@folk.com' },
    { name: 'Charlie Watts', email: 'charlie@drums.co.uk' },
    { name: 'David Bowie', email: 'ziggy@stardust.com' },
    { name: 'Elvis Presley', email: 'king@graceland.com' },
    { name: 'Freddie Mercury', email: 'freddie@queen.it' },
    { name: 'George Harrison', email: 'george@beatles.com' },
    { name: 'Iggy Pop', email: 'iggy@stooges.com' },
    { name: 'Janis Joplin', email: 'janis@pearl.com' },
    { name: 'Kurt Cobain', email: 'kurt@nirvana.com' }
  ];

  for (let i = 0; i < 60; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const batch = completedBatches[Math.floor(Math.random() * completedBatches.length)];
    const date = randomDate(30, 0);
    const qty = Math.floor(Math.random() * 20) + 5;
    const amount = qty * 12.50;

    orders.push({
      id: uuidv4(),
      customer_email: customer.email,
      customer_name: customer.name,
      batch_id: batch.id,
      quantity: qty,
      unit: 'unit',
      total_amount: amount,
      status: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'][Math.floor(Math.random() * 4)],
      order_date: date,
      created_at: date,
      updated_at: date
    });
  }

  await knex('online_orders').insert(orders);
  console.log(`✅ Inserted ${orders.length} online orders.`);

  // 5. QC Checks
  console.log('🔬 Generating QC Checks...');
  const qcChecks = [];
  for (const batch of insertedBatches) {
    if (batch.status === 'completed' || batch.status === 'failed') {
      qcChecks.push({
        id: uuidv4(),
        batch_id: batch.id,
        inspector_id: (qcUsers[Math.floor(Math.random() * qcUsers.length)] || adminUsers[0]).id,
        result: batch.status === 'failed' ? 'rejected' : 'approved',
        appearance_score: Math.floor(Math.random() * 3) + 3,
        texture_score: Math.floor(Math.random() * 3) + 3,
        taste_score: Math.floor(Math.random() * 3) + 3,
        notes: batch.status === 'failed' ? 'Irregular texture detected.' : 'Batch meets all standards.',
        created_at: new Date(new Date(batch.completed_at || batch.started_at).getTime() + 1800000)
      });
    }
  }
  await knex('qc_checks').insert(qcChecks);
  console.log(`✅ Inserted ${qcChecks.length} QC checks.`);

  // 6. Maintenance Logs
  console.log('🔧 Generating Maintenance Logs...');
  const maintenance = [];
  for (const machine of machines) {
    const date = randomDate(20, 5);
    maintenance.push({
      id: uuidv4(),
      machine_id: machine.id,
      mechanic_id: (mechanicUsers[Math.floor(Math.random() * mechanicUsers.length)] || adminUsers[0]).id,
      maintenance_type: Math.random() > 0.7 ? 'corrective' : 'preventive',
      description: 'Standard maintenance and calibration.',
      duration_minutes: 60 + Math.floor(Math.random() * 120),
      created_at: date
    });
  }
  await knex('maintenance_logs').insert(maintenance);
  console.log(`✅ Inserted ${maintenance.length} maintenance logs.`);

  console.log('🎉 Activity Data Seeding Complete!');
}
