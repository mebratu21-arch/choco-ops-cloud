/**
 * ============================================
 * SEED: 002_users.ts
 * ============================================
 * Purpose: Seed user accounts for testing
 * 
 * Default Password: "Admin123!" (for all users)
 * IMPORTANT: Change in production!
 * 
 * Users Created:
 * 1. admin@chocofactory.com - Admin
 * 2. manager@chocofactory.com - Production Manager
 * 3. warehouse@chocofactory.com - Warehouse Staff
 * 4. quality@chocofactory.com - Quality Control
 * 
 * Author: Senior Database Team
 * Date: 2025-01-21
 * ============================================
 */

import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Clean existing data with Cascade
  await knex.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

  // Hash password (bcrypt with cost factor 10)
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  // Insert users
  await knex('users').insert([
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      role_id: '550e8400-e29b-41d4-a716-446655440001', // admin
      email: 'admin@chocofactory.com',
      password_hash: passwordHash,
      full_name: 'John Admin',
      phone: '+972-50-123-4567',
      is_active: true,
      last_login: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      deleted_at: null,
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440002', // production_manager
      email: 'manager@chocofactory.com',
      password_hash: passwordHash,
      full_name: 'Sarah Production',
      phone: '+972-50-234-5678',
      is_active: true,
      last_login: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      deleted_at: null,
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440003',
      role_id: '550e8400-e29b-41d4-a716-446655440003', // warehouse_staff
      email: 'warehouse@chocofactory.com',
      password_hash: passwordHash,
      full_name: 'Mike Warehouse',
      phone: '+972-50-345-6789',
      is_active: true,
      last_login: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      deleted_at: null,
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440004',
      role_id: '550e8400-e29b-41d4-a716-446655440004', // quality_control
      email: 'quality@chocofactory.com',
      password_hash: passwordHash,
      full_name: 'Lisa Quality',
      phone: '+972-50-456-7890',
      is_active: true,
      last_login: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
      deleted_at: null,
    },
  ]);

  console.log('Seeded 4 users (Password: Admin123!)');
  console.log('   admin@chocofactory.com');
  console.log('   manager@chocofactory.com');
  console.log('   warehouse@chocofactory.com');
  console.log('   quality@chocofactory.com');
}
