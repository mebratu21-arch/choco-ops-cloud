/**
 * ============================================
 * MIGRATION: 001_roles.ts
 * ============================================
 * Purpose: User permission and authorization system
 * 
 * Table: roles
 * - Stores user role definitions (admin, production_manager, warehouse_staff, quality_control)
 * - JSONB permissions for flexible RBAC (Role-Based Access Control)
 * - Foundation for entire user management system
 * 
 * Dependencies: None (base table)
 * 
 * Business Rules:
 * - Role names must be unique
 * - Permissions stored as flexible JSON structure
 * - Indexed for fast role lookups
 * 
 * Author: Senior Database Team
 * Date: 2025-01-21
 * ============================================
 */

import { Knex } from 'knex';

/**
 * Create roles table and indexes
 */
export async function up(knex: Knex): Promise<void> {
  // Create roles table
  await knex.schema.createTable('roles', (table) => {
    // Primary Key
    table.uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique role identifier');

    // Core Fields
    table.string('name', 50)
      .notNullable()
      .unique()
      .comment('Role name: admin, production_manager, warehouse_staff, quality_control');

    table.text('description')
      .comment('Human-readable role description');

    // Permissions (Flexible JSONB structure)
    table.jsonb('permissions')
      .defaultTo('{}')
      .comment('RBAC permissions: {module: [actions]}');

    // Audit Timestamps
    table.timestamps(true, true);
  });

  // Performance Index
  await knex.schema.raw(`
    CREATE INDEX idx_roles_name ON roles(name);
    COMMENT ON INDEX idx_roles_name IS 'Fast role lookup by name';
  `);

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE roles IS 'User role definitions and permissions (RBAC system)';
  `);
}

/**
 * Rollback: Drop roles table
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('roles');
}
