/**
 * ============================================
 * MIGRATION: 002_users.ts
 * ============================================
 * Purpose: User authentication and profile management
 * 
 * Table: users
 * - Stores user accounts with secure password hashing
 * - Links to roles for RBAC
 * - Supports soft deletes for data preservation
 * - Tracks login activity for security auditing
 * 
 * Dependencies: roles (001_roles.ts)
 * 
 * Business Rules:
 * - Email must be unique and valid
 * - Password stored as bcrypt hash (never plain text)
 * - Soft delete: deleted_at IS NULL means active
 * - Role cannot be deleted if users exist (RESTRICT)
 * 
 * Security Features:
 * - Password hash column (bcrypt)
 * - Account activation flag
 * - Last login tracking
 * - Soft delete for audit trail
 * 
 * Author: Senior Database Team
 * Date: 2025-01-21
 * ============================================
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    // Primary Key
    table.uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique user identifier');

    // Foreign Key: Role
    table.uuid('role_id')
      .notNullable()
      .references('id')
      .inTable('roles')
      .onDelete('RESTRICT')
      .comment('User role (admin, manager, staff, QC)');

    // Authentication
    table.string('email', 255)
      .notNullable()
      .unique()
      .comment('User email (unique login identifier)');

    table.string('password_hash', 255)
      .notNullable()
      .comment('Bcrypt hashed password (NEVER store plain text)');

    // Profile Information
    table.string('full_name', 255)
      .notNullable()
      .comment('User full name');

    table.string('phone', 20)
      .comment('Contact phone number');

    // Account Status
    table.boolean('is_active')
      .defaultTo(true)
      .comment('Account active flag (false = suspended)');

    // Activity Tracking
    table.timestamp('last_login')
      .comment('Last successful login timestamp');

    // Audit Timestamps
    table.timestamps(true, true);

    // Soft Delete
    table.timestamp('deleted_at')
      .comment('Soft delete timestamp (NULL = active)');
  });

  // Performance Indexes
  await knex.schema.raw(`
    CREATE INDEX idx_users_email ON users(email);
    COMMENT ON INDEX idx_users_email IS 'Fast login lookup by email';
    
    CREATE INDEX idx_users_role_id ON users(role_id);
    COMMENT ON INDEX idx_users_role_id IS 'Filter users by role';
    
    CREATE INDEX idx_users_is_active ON users(is_active);
    COMMENT ON INDEX idx_users_is_active IS 'Filter active/inactive users';
    
    CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
    COMMENT ON INDEX idx_users_deleted_at IS 'Partial index for active users only';
  `);

  // Table Documentation
  await knex.raw(`
    COMMENT ON TABLE users IS 'User accounts with authentication and RBAC integration';
    COMMENT ON COLUMN users.password_hash IS 'SECURITY: Bcrypt hash with cost factor 10+';
    COMMENT ON COLUMN users.deleted_at IS 'Soft delete: preserves production history';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
