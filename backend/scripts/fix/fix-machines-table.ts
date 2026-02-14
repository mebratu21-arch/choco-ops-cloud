import { db } from './src/config/database.js';

async function fixMachinesTable() {
  try {
    console.log('--- STARTING MACHINE TABLE STANDARDIZATION ---');

    // 1. Check if 'equipment' exists and 'machines' doesn't
    const hasEquipment = await db.schema.hasTable('equipment');
    const hasMachines = await db.schema.hasTable('machines');

    if (hasEquipment && !hasMachines) {
      console.log('Renaming equipment table to machines...');
      await db.schema.renameTable('equipment', 'machines');
    } else if (!hasEquipment && !hasMachines) {
      console.log('Neither equipment nor machines table found. Creating machines table...');
      await db.schema.createTable('machines', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.string('name').notNullable();
        table.string('type').notNullable();
        table.string('status').defaultTo('operational');
        table.string('location');
        table.timestamps(true, true);
      });
    } else {
        console.log('Table machines already exists or equipment is missing.');
    }

    // 2. Add missing columns
    console.log('Checking for missing columns in machines...');
    await db.schema.alterTable('machines', (table) => {
      // We can't use await inside alterTable callback easily in some knex versions, 
      // but we can check existence outside if needed.
    });

    const columnsToAdd = [
        { name: 'machine_code', type: 'string', unique: true },
        { name: 'last_maintenance_date', type: 'timestamp' },
        { name: 'next_maintenance_date', type: 'timestamp' },
        { name: 'notes', type: 'text' },
        { name: 'installation_date', type: 'timestamp' }
    ];

    for (const col of columnsToAdd) {
        const hasCol = await db.schema.hasColumn('machines', col.name);
        if (!hasCol) {
            console.log(`Adding column: ${col.name}`);
            await db.schema.alterTable('machines', (t) => {
                if (col.type === 'string') {
                    const c = t.string(col.name);
                    if (col.unique) c.unique();
                } else if (col.type === 'timestamp') {
                    t.timestamp(col.name);
                } else if (col.type === 'text') {
                    t.text(col.name);
                }
            });
        }
    }

    // 3. Update maintenance_logs
    const hasMaintenanceLogs = await db.schema.hasTable('maintenance_logs');
    if (hasMaintenanceLogs) {
        const hasEquipId = await db.schema.hasColumn('maintenance_logs', 'equipment_id');
        const hasMachId = await db.schema.hasColumn('maintenance_logs', 'machine_id');
        
        if (hasEquipId && !hasMachId) {
            console.log('Renaming equipment_id to machine_id in maintenance_logs...');
            await db.schema.alterTable('maintenance_logs', (t) => {
                t.renameColumn('equipment_id', 'machine_id');
            });
        }
    }

    // 4. Seed basic data if empty
    const countResult = await db('machines').count('id as count').first();
    if (parseInt(countResult?.count as string || '0') === 0) {
        console.log('Seeding initial machines...');
        await db('machines').insert([
            { 
              id: '00000000-0000-0000-0000-000000000000', 
              name: 'GENERAL_EMERGENCY', 
              type: 'SYSTEM', 
              status: 'operational', 
              machine_code: 'SYS-000' 
            },
            { 
              name: 'Tempering Unit Alpha', 
              type: 'TEMPERING', 
              status: 'operational', 
              machine_code: 'TMP-001', 
              location: 'Phase 1' 
            },
            { 
              name: 'Flow-Wrap System', 
              type: 'PACKAGING', 
              status: 'operational', 
              machine_code: 'PKG-005', 
              location: 'Packaging Bay' 
            },
            { 
              name: 'Ball Mill Refiner 02', 
              type: 'REFINING', 
              status: 'maintenance', 
              machine_code: 'REF-002', 
              location: 'Grinding Room' 
            }
        ]);
    }

    console.log('✅ Machine table standardization complete!');
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during standardization:', error);
    await db.destroy();
    process.exit(1);
  }
}

fixMachinesTable();
