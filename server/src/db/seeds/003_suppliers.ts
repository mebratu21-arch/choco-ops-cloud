/**
 * ============================================
 * FILE: 003_suppliers.ts
 * ============================================
 */
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE suppliers RESTART IDENTITY CASCADE');

  await knex('suppliers').insert([
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      name: 'Ghana Cocoa Exports Ltd',
      contact_person: 'Kwame Mensah',
      email: 'sales@ghanacocoa.com',
      phone: '+233-20-123-4567',
      address: '123 Cocoa Street, Accra, Ghana',
      rating: 4.8,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      name: 'Sweet Valley Sugar Co',
      contact_person: 'Maria Rodriguez',
      email: 'orders@sweetvalley.com',
      phone: '+1-555-234-5678',
      address: '456 Sugar Lane, Miami, FL, USA',
      rating: 4.5,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440003',
      name: 'Alpine Dairy Products',
      contact_person: 'Hans Schmidt',
      email: 'contact@alpinedairy.ch',
      phone: '+41-22-345-6789',
      address: '789 Mountain Road, Zurich, Switzerland',
      rating: 4.9,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440004',
      name: 'Premium Additives Inc',
      contact_person: 'David Chen',
      email: 'sales@premiumadditives.com',
      phone: '+86-10-456-7890',
      address: '321 Industrial Blvd, Beijing, China',
      rating: 4.3,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);

  console.log('Seeded 4 international suppliers');
}
