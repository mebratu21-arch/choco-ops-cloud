import { Request, Response } from 'express';
import { PaymentService, PaymentItem } from '../services/payment.service.js';

export class PaymentController {
  /**
   * POST /api/payments/create-intent
   * Create a Stripe Payment Intent
   */
  static async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { items, currency, customerEmail, metadata } = req.body as {
        items: PaymentItem[];
        currency?: string;
        customerEmail?: string;
        metadata?: Record<string, string>;
      };

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Items array is required and cannot be empty',
        });
        return;
      }

      // Validate items
      for (const item of items) {
        if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
          res.status(400).json({
            success: false,
            error: 'Each item must have id, name, price, and quantity',
          });
          return;
        }
        if (item.price <= 0 || item.quantity <= 0) {
          res.status(400).json({
            success: false,
            error: 'Price and quantity must be positive numbers',
          });
          return;
        }
      }

      const result = await PaymentService.createPaymentIntent({
        items,
        currency,
        customerEmail,
        metadata,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      });
    }
  }

  /**
   * POST /api/payments/confirm
   * Confirm payment was successful
   */
  static async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.body as { paymentIntentId: string };

      if (!paymentIntentId) {
        res.status(400).json({
          success: false,
          error: 'paymentIntentId is required',
        });
        return;
      }

      const result = await PaymentService.confirmPayment(paymentIntentId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm payment',
      });
    }
  }

  /**
   * POST /api/payments/refund
   * Process a refund
   */
  static async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId, amount } = req.body as { paymentIntentId: string; amount?: number };

      if (!paymentIntentId) {
        res.status(400).json({
          success: false,
          error: 'paymentIntentId is required',
        });
        return;
      }

      const result = await PaymentService.refundPayment(paymentIntentId, amount);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Refund failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund',
      });
    }
  }

  /**
   * POST /api/payments/webhook
   * Handle Stripe webhooks
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        res.status(400).json({ success: false, error: 'Missing stripe-signature header' });
        return;
      }

      const event = PaymentService.constructEvent(req.body, signature);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment succeeded:', event.data.object);
          // TODO: Update order status, send confirmation email, etc.
          break;
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object);
          // TODO: Handle failed payment
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      });
    }
  }

  /**
   * GET /api/payments/config
   * Get Stripe publishable key for frontend
   */
  static async getConfig(req: Request, res: Response): Promise<void> {
    // Return whether Stripe is configured (don't expose actual keys)
    res.status(200).json({
      success: true,
      data: {
        configured: PaymentService.isConfigured(),
        // Frontend should have its own VITE_STRIPE_PUBLISHABLE_KEY
      },
    });
  }
}
