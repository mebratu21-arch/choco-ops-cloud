import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function populateDashboard() {
  console.log('🌱 Populating Dashboard Data...');

  try {
    const [admin] = await db('users').where('role', 'admin').select('id');
    const [manager] = await db('users').where('role', 'manager').select('id');
    const [worker] = await db('users').where('role', 'production_worker').select('id');

    if (!admin || !manager || !worker) throw new Error('Missing users for seed');

    const [supplier] = await db('suppliers').select('id').limit(1);

    // 1. Announcements
    console.log('Adding Announcements...');
    await db('announcements').insert([
        { title: 'New Safety Protocol', content: 'All staff must wear hairnets.', priority: 'high', created_by: admin.id, created_at: new Date() },
        { title: 'Holiday Schedule', content: 'Factory closed on Dec 25th.', priority: 'normal', created_by: manager.id, created_at: new Date() }, // Fixed 'medium' -> 'normal'
        { title: 'Goal Reached!', content: 'We produced 1000 batches this month!', priority: 'low', created_by: manager.id, created_at: new Date() }
    ]);

    // 2. Tasks
    console.log('Adding Tasks...');
    await db('tasks').insert([
        { title: 'Clean Melanger', description: 'Weekly cleaning required', assigned_to: worker.id, priority: 'high', status: 'pending', assigned_by: manager.id, due_date: new Date(Date.now() + 86400000) },
        { title: 'Inspect Raw Cocoa', description: 'Check for humidity levels', assigned_to: worker.id, priority: 'medium', status: 'in_progress', assigned_by: manager.id, due_date: new Date(Date.now() + 172800000) }
    ]);

    // 3. Orders
    console.log('Adding Orders...');
    await db('orders').insert({
        order_number: 'ORD-' + Date.now(), // Unique
        supplier_id: supplier.id,
        ordered_by: manager.id,
        status: 'pending',
        total_amount: 500.00,
        expected_delivery_date: new Date(Date.now() + 604800000)
    });

    // 4. Audit Logs (Mock)
    console.log('Adding Audit Logs...');
    await db('audit_logs').insert([
        { user_id: admin.id, action: 'LOGIN', resource: 'auth', resource_id: null, details: { message: 'User logged in' }, created_at: new Date() },
        { user_id: manager.id, action: 'CREATE_TASK', resource: 'task', resource_id: uuidv4(), details: { message: 'Created cleaning task' }, created_at: new Date() },
        { user_id: worker.id, action: 'UPDATE_BATCH', resource: 'batch', resource_id: uuidv4(), details: { message: 'Batch status updated' }, created_at: new Date() }
    ]);

    console.log('✅ Dashboard populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Population Failed:', error);
    process.exit(1);
  }
}

populateDashboard();
