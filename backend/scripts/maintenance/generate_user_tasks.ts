import { db } from './src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function generateTasks() {
  console.log('📝 Generating Tasks for all Users...');

  try {
    const users = await db('users').select('id', 'email', 'role');
    const [admin] = users.filter(u => u.role === 'ADMIN');
    const [manager] = users.filter(u => u.role === 'MANAGER');

    const tasksToInsert = [];

    const roleTaskDefaults = {
      'ADMIN': [
        { title: 'Review System Logs', desc: 'Check for security anomalies', prio: 'medium' },
        { title: 'Update Factory Config', desc: 'Optimize throughput parameters', prio: 'low' },
        { title: 'Manage User Permissions', desc: 'Audit access levels', prio: 'high' }
      ],
      'MANAGER': [
        { title: 'Approve Supplier Invoice', desc: 'Ghana Cocoa Co. Invoice #203', prio: 'high' },
        { title: 'Shift Planning', desc: 'Organize next week schedule', prio: 'medium' },
        { title: 'Inventory Audit', desc: 'Random check of Aisle A', prio: 'medium' }
      ],
      'PRODUCTION': [
        { title: 'Clean Melanger 3000', desc: 'Weekly deep clean', prio: 'high' },
        { title: 'Calibrate Roaster', desc: 'Ensure even heating', prio: 'medium' },
        { title: 'Prepare Batch B-2023-010', desc: 'Hazelnut Truffle run', prio: 'high' }
      ],
      'WAREHOUSE': [
        { title: 'Unload Supplier Shipment', desc: 'Milk powder arrival', prio: 'medium' },
        { title: 'Restock Gold Foil', desc: 'Aisle D needs inventory', prio: 'low' },
        { title: 'Verify Expiry Dates', desc: 'Check Cold Storage 1', prio: 'high' }
      ],
      'QC': [
        { title: 'Inspect Batch B-2023-005', desc: 'Taste and texture audit', prio: 'high' },
        { title: 'Lab Equipment Calibration', desc: 'Spectrometer check', prio: 'medium' },
        { title: 'Review Defect Reports', desc: 'Analyze trends from last week', prio: 'low' }
      ],
      'MECHANIC': [
        { title: 'Repair Temper Pro', desc: 'Fix overheating issue', prio: 'high' },
        { title: 'Service Winnowing Unit', desc: 'Routine belt replacement', prio: 'medium' },
        { title: 'Log Tool Inventory', desc: 'Check for missing wrenches', prio: 'low' }
      ],
      'CONTROLLER': [
        { title: 'Verify Sales Report', desc: 'End of week reconciliation', prio: 'high' },
        { title: 'Analyze Order Trends', desc: 'Identify top sellers', prio: 'medium' },
        { title: 'Update Price List', desc: 'Seasonal adjustments', prio: 'low' }
      ]
    };

    // Clean existing tasks to avoid duplicates for this run
    await db('tasks').truncate();

    for (const user of users) {
        const defaults = roleTaskDefaults[user.role as keyof typeof roleTaskDefaults] || [
            { title: `${user.role} Task 1`, desc: 'Default task description', prio: 'medium' },
            { title: `${user.role} Task 2`, desc: 'Default task description', prio: 'medium' },
            { title: `${user.role} Task 3`, desc: 'Default task description', prio: 'medium' }
        ];

        for (const t of defaults) {
            tasksToInsert.push({
                id: uuidv4(),
                title: t.title,
                description: t.desc,
                assigned_to: user.id,
                assigned_by: manager?.id || admin?.id,
                priority: t.prio,
                status: 'pending',
                due_date: new Date(Date.now() + Math.random() * 864000000), // Within 10 days
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    }

    await db('tasks').insert(tasksToInsert);
    console.log(`✅ Successfully generated ${tasksToInsert.length} tasks for ${users.length} users.`);

  } catch (error) {
    console.error('❌ Task Generation Failed:', error);
  } finally {
    await db.destroy();
  }
}

generateTasks();
