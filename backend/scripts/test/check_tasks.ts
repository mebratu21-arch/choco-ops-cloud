import { db } from './src/config/database.js';

async function checkTasks() {
  try {
    const users = await db('users').select('id', 'email', 'role');
    console.log('--- User Roles and Task Count ---');
    
    for (const user of users) {
        const taskCount = await db('tasks').where({ assigned_to: user.id }).count('id as count').first();
        
        console.log(`User: ${user.email} (${user.role})`);
        console.log(`  - Direct Tasks: ${taskCount?.count || 0}`);
    }
    
    const allTasks = await db('tasks').select('*');
    console.log('\n--- All Tasks in DB ---');
    console.table(allTasks.map(t => ({
        id: t.id.substring(0, 8),
        title: t.title,
        status: t.status,
        assigned_to: t.assigned_to ? t.assigned_to.substring(0, 8) : 'NONE'
    })));

  } catch (error) {
    console.error('Error checking tasks:', error);
  } finally {
    await db.destroy();
  }
}

checkTasks();
