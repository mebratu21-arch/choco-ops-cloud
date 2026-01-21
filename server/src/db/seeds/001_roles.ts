/**
 * ============================================
 * SEED: 001_roles.ts
 * ============================================
 * Purpose: Seed user roles with RBAC permissions
 * 
 * Roles Created:
 * 1. admin - Full system access
 * 2. production_manager - Production & analytics
 * 3. warehouse_staff - Inventory & warehouse
 * 4. quality_control - QA inspections
 * 
 * Author: Senior Database Team
 * Date: 2025-01-21
 * ============================================
 */

import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clean existing data with Cascade to handle foreign keys
  await knex.raw('TRUNCATE TABLE roles RESTART IDENTITY CASCADE');

  // Insert roles with detailed permissions
  await knex('roles').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'admin',
      description: 'System Administrator - Full access to all modules and settings',
      permissions: JSON.stringify({
        users: ['create', 'read', 'update', 'delete'],
        roles: ['create', 'read', 'update', 'delete'],
        inventory: ['create', 'read', 'update', 'delete'],
        production: ['create', 'read', 'update', 'delete'],
        warehouse: ['create', 'read', 'update', 'delete'],
        quality: ['create', 'read', 'update', 'delete'],
        analytics: ['read', 'export'],
        settings: ['read', 'update'],
        suppliers: ['create', 'read', 'update', 'delete'],
        sales: ['read', 'export'],
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'production_manager',
      description: 'Production Manager - Manages production batches, recipes, and material allocation',
      permissions: JSON.stringify({
        inventory: ['read'],
        production: ['create', 'read', 'update'],
        warehouse: ['read'],
        quality: ['read'],
        analytics: ['read'],
        suppliers: ['read'],
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'warehouse_staff',
      description: 'Warehouse Staff - Manages inventory, stock movements, and warehouse operations',
      permissions: JSON.stringify({
        inventory: ['read', 'update'],
        production: ['read'],
        warehouse: ['create', 'read', 'update'],
        quality: ['read'],
        suppliers: ['read'],
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'quality_control',
      description: 'Quality Control Inspector - Performs quality inspections and approvals',
      permissions: JSON.stringify({
        production: ['read'],
        warehouse: ['read'],
        quality: ['create', 'read', 'update'],
        analytics: ['read'],
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);

  console.log('Seeded 4 roles with RBAC permissions');
}
