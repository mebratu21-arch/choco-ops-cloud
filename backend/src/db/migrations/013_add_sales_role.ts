import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // PostgreSql specific: Drop the constraint and recreate it or update the enum type
  // Since Knex specificType 'enum' usually creates a check constraint or a type depending on config.
  // We will alter the pg constraint directly to be safe.
  
  await knex.raw(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'production_worker', 'warehouse_worker', 'quality_controller', 'mechanic', 'sales_representative'));
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'production_worker', 'warehouse_worker', 'quality_controller', 'mechanic'));
  `);
}
