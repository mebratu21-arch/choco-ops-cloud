import { db } from '../src/config/database.js';

async function check() {
  try {
    const exists = await db.schema.hasTable('equipment');
    console.log('Equipment table exists:', exists);

    if (exists) {
        const rows = await db('equipment').select('*');
        console.log('Equipment rows:', rows);
    }

    const logExists = await db.schema.hasTable('maintenance_logs');
    console.log('Maintenance logs table exists:', logExists);

    // Try to insert a test log for SOS
    if (exists && logExists) {
        // Check if GENERAL_EMERGENCY exists, if not insert it
        const sos = await db('equipment').where('id', '00000000-0000-0000-0000-000000000000').first();
        if (!sos) {
             console.log('Inserting SOS equipment...');
             await db('equipment').insert({
                id: '00000000-0000-0000-0000-000000000000',
                name: 'GENERAL_EMERGENCY',
                type: 'SYSTEM',
                status: 'OPERATIONAL'
             });
        }
        console.log('SOS Equipment verified.');
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
