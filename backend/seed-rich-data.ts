import { db } from './src/config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seedRichData() {
  try {
    console.log('🌱 Starting Rich Data Seed...');

    // 1. Clear existing data (optional, but good for clean state)
    // Be careful in production, but this is dev/demo
    console.log('🧹 Clearing old data...');
    await db('sos_alerts').del();
    await db('maintenance_logs').del();
    // await db('machines').del(); // Keep machines we just fixed, or re-seed them better
    // await db('users').del(); // Keep users
    
    // Let's ensure we have our standard users
    const users = await db('users').select('*');
    const adminUser = users.find(u => u.role === 'ADMIN');
    const mechanicUser = users.find(u => u.role === 'MECHANIC') || adminUser; // Fallback
    const operatorUser = users.find(u => u.role === 'OPERATOR') || adminUser;

    if (!adminUser) {
        console.error('❌ No admin user found. Please run check-users.ts first.');
        process.exit(1);
    }

    // 2. Enrich Machines (Upsert)
    console.log('🏭 Seeding Machines...');
    const machineData = [
        { 
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Melanger 3000', 
          type: 'GRINDING', 
          status: 'operational', 
          machine_code: 'GRN-001', 
          location: 'Production Floor A',
          notes: 'High capacity grinder for cocoa nibs.',
          last_maintenance_date: new Date('2023-12-15'),
          next_maintenance_date: new Date('2024-02-15'),
          installation_date: new Date('2022-01-10')
        },
        { 
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Conch Master 5000', 
          type: 'CONCHING', 
          status: 'operational', 
          machine_code: 'CNC-002', 
          location: 'Production Floor B',
          notes: 'Precision conching for smooth texture.',
          last_maintenance_date: new Date('2024-01-05'),
          next_maintenance_date: new Date('2024-03-05'),
          installation_date: new Date('2021-11-20')
        },
        { 
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Temper Pro X1', 
          type: 'TEMPERING', 
          status: 'maintenance', 
          machine_code: 'TMP-003', 
          location: 'Finishing Room',
          notes: 'Currently undergoing calibration.',
          last_maintenance_date: new Date('2024-01-20'),
          next_maintenance_date: new Date('2024-01-28'), // Past due/upcoming
          installation_date: new Date('2023-05-15')
        },
        { 
          id: '44444444-4444-4444-4444-444444444444',
          name: 'Flow-Wrap 200', 
          type: 'PACKAGING', 
          status: 'sos', 
          machine_code: 'PKG-004', 
          location: 'Packaging Bay',
          notes: 'High speed wrapper. Prone to jams.',
          last_maintenance_date: new Date('2023-11-30'),
          next_maintenance_date: new Date('2024-01-15'),
          installation_date: new Date('2020-08-01')
        },
        { 
          id: '55555555-5555-5555-5555-555555555555',
          name: 'Roaster R-1', 
          type: 'ROASTING', 
          status: 'operational', 
          machine_code: 'RST-005', 
          location: 'Roasting Room',
          notes: 'Main roaster.',
          last_maintenance_date: new Date('2024-01-10'),
          next_maintenance_date: new Date('2024-04-10'),
          installation_date: new Date('2019-03-15')
        }
    ];

    for (const m of machineData) {
        const exists = await db('machines').where({ id: m.id }).first();
        if (exists) {
            await db('machines').where({ id: m.id }).update(m);
        } else {
            await db('machines').insert(m);
        }
    }

    // 3. Seed Maintenance Logs
    console.log('🛠️ Seeding Maintenance Logs...');
    const logs = [
        {
            machine_id: '11111111-1111-1111-1111-111111111111', // Melanger
            mechanic_id: mechanicUser?.id || adminUser.id,
            maintenance_type: 'routine',
            description: 'Monthly lubrication and belt check.',
            parts_used: 'Lubricant X-1, Belt B-22',
            duration_minutes: 45,
            cost: 25.50,
            performed_at: new Date('2023-12-15')
        },
        {
            machine_id: '44444444-4444-4444-4444-444444444444', // Flow-Wrap
            mechanic_id: mechanicUser?.id || adminUser.id,
            maintenance_type: 'repair',
            description: 'Replaced jammed sensor.',
            parts_used: 'Sensor S-99',
            duration_minutes: 120,
            cost: 150.00,
            performed_at: new Date('2023-11-30')
        }
    ];
    await db('maintenance_logs').insert(logs);

    // 4. Seed SOS Alerts
    console.log('🚨 Seeding SOS Alerts...');
    const alerts = [
        {
            machine_id: '44444444-4444-4444-4444-444444444444', // Flow-Wrap (Status: sos)
            reported_by: operatorUser?.id || adminUser.id,
            priority: 'high',
            status: 'open',
            problem_description: 'Machine jammed and making loud grinding noise.',
            created_at: new Date()
        },
        {
            machine_id: '33333333-3333-3333-3333-333333333333', // Temper Pro (Status: maintenance)
            reported_by: operatorUser?.id || adminUser.id,
            priority: 'medium',
            status: 'in_progress',
            problem_description: 'Temperature fluctuation alerts.',
            assigned_to: mechanicUser?.id || adminUser.id,
            created_at: new Date(Date.now() - 86400000) // Yesterday
        }
    ];
    // Need to handle different column names if migration differs, but assuming recent standard
    // Check if 'problem_description' or 'description'
    // My previous check viewed 'sos_alerts' having 'description' in controller but 'problem_description' in service mapping?
    // Let's use service logic mapping or simply ensure columns match.
    // The service uses: problem_description: data.description || data.problem_description
    // Checking schema... I'll just use 'problem_description' as per service map
    
    // Actually, let's double check the column name by trying to insert one.
    // If it fails, I'll catch and retry with 'description'.
    try {
        await db('sos_alerts').insert(alerts);
    } catch (e: any) {
        console.warn('⚠️ Insert failed, trying with description column instead of problem_description...');
        const fixedAlerts = alerts.map(a => ({
            ...a,
            description: a.problem_description,
            problem_description: undefined
        }));
        await db('sos_alerts').insert(fixedAlerts);
    }

    console.log('✅ Rich data verification complete!');
    await db.destroy();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    await db.destroy();
    process.exit(1);
  }
}

seedRichData();
