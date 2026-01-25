import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping seed in production');
    return;
  }

  await knex.transaction(async (trx) => {
    // Clear tables
    if (await knex.schema.hasTable('refresh_tokens')) await trx('refresh_tokens').del();
    if (await knex.schema.hasTable('ingredients')) await trx('ingredients').del();
    if (await knex.schema.hasTable('users')) await trx('users').del();

    // Create users
    const [manager] = await trx('users').insert([
      {
        email: 'manager@chocoops.com',
        password_hash: await bcrypt.hash('password123', 10),
        first_name: 'Sarah',
        last_name: 'Manager',
        role: 'MANAGER',
      },
      {
        email: 'worker@chocoops.com',
        password_hash: await bcrypt.hash('password123', 10),
        first_name: 'Alex',
        last_name: 'Worker',
        role: 'PRODUCTION',
      },
      {
        email: 'warehouse@chocoops.com',
        password_hash: await bcrypt.hash('password123', 10),
        first_name: 'Sam',
        last_name: 'Warehouse',
        role: 'WAREHOUSE',
      },
    ]).returning('*');

    // Create ingredients (suppliers won't exist yet as we dropped that migration, so setting supplier_id to null)
    if (await knex.schema.hasTable('ingredients')) {
        await trx('ingredients').insert([
        {
            name: 'Cocoa Mass',
            code: 'CM-001',
            current_stock: 100.0,
            minimum_stock: 20.0,
            optimal_stock: 150.0,
            unit: 'kg',
            cost_per_unit: 8.50,
            expiry_date: new Date('2025-06-01'),
            created_by: manager.id,
        },
        {
            name: 'Cocoa Butter',
            code: 'CB-002',
            current_stock: 15.0, // Low stock alert!
            minimum_stock: 20.0,
            optimal_stock: 80.0,
            unit: 'kg',
            cost_per_unit: 12.00,
            expiry_date: new Date('2025-03-15'),
            created_by: manager.id,
        },
        ]);
    }

    console.log(' Demo data seeded');
    console.log('Login: manager@chocoops.com / password123');
  });
}
