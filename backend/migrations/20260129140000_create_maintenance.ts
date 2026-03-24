import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Use raw SQL for robustness against 'relation already exists' errors
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS equipment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      status VARCHAR(255) DEFAULT 'OPERATIONAL',
      location VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS maintenance_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      equipment_id VARCHAR(255),
      description TEXT NOT NULL,
      performed_by VARCHAR(255),
      scheduled_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      status VARCHAR(255) DEFAULT 'PENDING',
      priority VARCHAR(255) DEFAULT 'NORMAL'
    );
  `);

  // Seed default 'GENERAL_EMERGENCY' equipment for SOS button
  await knex.raw(`
    INSERT INTO equipment (id, name, type, status)
    VALUES ('00000000-0000-0000-0000-000000000000', 'GENERAL_EMERGENCY', 'SYSTEM', 'OPERATIONAL')
    ON CONFLICT (id) DO NOTHING;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('maintenance_logs');
  await knex.schema.dropTableIfExists('equipment');
}
