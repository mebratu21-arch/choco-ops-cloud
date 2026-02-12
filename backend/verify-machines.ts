import { db } from './src/config/database.js';

async function verifyMachines() {
  try {
    console.log('Verifying machines table...');
    const exists = await db.schema.hasTable('machines');
    if (!exists) {
        console.error('❌ Table machines does not exist!');
    } else {
        console.log('✅ Table machines exists.');
        const machines = await db('machines').select('*');
        console.log(`Found ${machines.length} machines:`);
        machines.forEach(m => {
            console.log(` - ${m.name} (${m.type}) [${m.status}] Code: ${m.machine_code || 'N/A'}`);
        });
    }
    await db.destroy();
  } catch (err) {
    console.error(err);
    await db.destroy();
  }
}

verifyMachines();
