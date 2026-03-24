import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Rename 'equipment' to 'machines' if it exists
  const hasEquipment = await knex.schema.hasTable('equipment');
  const hasMachines = await knex.schema.hasTable('machines');

  if (hasEquipment && !hasMachines) {
    await knex.schema.renameTable('equipment', 'machines');
  } else if (!hasEquipment && !hasMachines) {
      // Create it if neither exists
      await knex.schema.createTable('machines', (table) => {
          table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
          table.string('name').notEmpty();
          table.string('type').notEmpty();
          table.string('status').defaultTo('operational');
          table.string('location');
          table.timestamps(true, true);
      });
  }

  // 2. Add missing columns to 'machines'
  await knex.schema.alterTable('machines', (table) => {
    if (!(await knex.schema.hasColumn('machines', 'machine_code'))) {
      table.string('machine_code').unique();
    }
    if (!(await knex.schema.hasColumn('machines', 'last_maintenance_date'))) {
      table.timestamp('last_maintenance_date');
    }
    if (!(await knex.schema.hasColumn('machines', 'next_maintenance_date'))) {
      table.timestamp('next_maintenance_date');
    }
    if (!(await knex.schema.hasColumn('machines', 'notes'))) {
      table.text('notes');
    }
    if (!(await knex.schema.hasColumn('machines', 'installation_date'))) {
      table.timestamp('installation_date');
    }
  });

  // 3. Update 'maintenance_logs' to use 'machine_id'
  const hasMaintenanceLogs = await knex.schema.hasTable('maintenance_logs');
  if (hasMaintenanceLogs) {
      await knex.schema.alterTable('maintenance_logs', (table) => {
          if (await knex.schema.hasColumn('maintenance_logs', 'equipment_id')) {
              table.renameColumn('equipment_id', 'machine_id');
          }
      });
  }
  
  // 4. Seed a few machines if empty
  const machinesCount = await knex('machines').count('id as count').first();
  if (parseInt(machinesCount?.count as string || '0') === 0) {
      await knex('machines').insert([
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
          }
      ]);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Reverse isn't strictly necessary for this fix-up but good practice
  const hasMachines = await knex.schema.hasTable('machines');
  if (hasMachines) {
      await knex.schema.renameTable('machines', 'equipment');
  }
}
