import Stripe from 'stripe';
import { env } from '../config/env.js';

// Initialize Stripe with secret key (optional - will work in test mode if not set)
const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

export interface PaymentItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface CreatePaymentIntentInput {
  items: PaymentItem[];
  currency?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

export class PaymentService {
  /**
   * Create a Stripe Payment Intent for the cart items
   */
  static async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    const { items, currency = 'usd', customerEmail, metadata = {} } = input;

    // Calculate total amount in cents
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% VAT
    const totalAmount = Math.round((subtotal + tax) * 100); // Convert to cents

    if (totalAmount < 50) {
      throw new Error('Minimum payment amount is $0.50');
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, qty: i.quantity }))),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
      },
      ...(customerEmail && { receipt_email: customerEmail }),
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
    };
  }

  /**
   * Confirm payment was successful and create order record
   */
  static async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; status: string }> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
    };
  }

  /**
   * Process refund for a payment
   */
  static async refundPayment(paymentIntentId: string, amount?: number): Promise<{ refundId: string; status: string }> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount }), // Partial refund in cents
    });

    return {
      refundId: refund.id,
      status: refund.status || 'unknown',
    };
  }

  /**
   * Handle Stripe webhooks
   */
  static constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe webhook is not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  }

  /**
   * Check if Stripe is configured
   */
  static isConfigured(): boolean {
    return stripe !== null;
  }
}
