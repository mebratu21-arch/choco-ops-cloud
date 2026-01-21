import { Knex } from 'knex';

/**
 * ============================================
 * FILE: 010_product_sales.ts
 * ============================================
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE product_sales RESTART IDENTITY CASCADE');

  await knex('product_sales').insert([
    {
      stock_id: 'aa0e8400-e29b-41d4-a716-446655440001',
      stripe_payment_id: 'pi_test_1234567890',
      customer_name: 'Premium Chocolates Ltd',
      customer_email: 'orders@premiumchoco.com',
      quantity: 100.00,
      unit_price: 15.00,
      total_amount: 1500.00,
      payment_status: 'completed',
      sold_at: '2025-01-18 10:30:00',
      created_at: '2025-01-18 10:30:00',
      updated_at: '2025-01-18 10:30:00',
    },
    {
      stock_id: 'aa0e8400-e29b-41d4-a716-446655440002',
      stripe_payment_id: 'pi_test_0987654321',
      customer_name: 'Sweet Treats Inc',
      customer_email: 'purchasing@sweettreats.com',
      quantity: 200.00,
      unit_price: 12.00,
      total_amount: 2400.00,
      payment_status: 'completed',
      sold_at: '2025-01-19 14:15:00',
      created_at: '2025-01-19 14:15:00',
      updated_at: '2025-01-19 14:15:00',
    },
  ]);

  console.log('Seeded product sales');
}
