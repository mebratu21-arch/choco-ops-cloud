import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import express from 'express';

const router = Router();

// Public endpoint to check Stripe configuration
router.get('/config', PaymentController.getConfig);

// Create payment intent (requires items in body)
router.post('/create-intent', PaymentController.createPaymentIntent);

// Confirm payment after successful charge
router.post('/confirm', PaymentController.confirmPayment);

// Process refund (admin only in production)
router.post('/refund', PaymentController.refundPayment);

// Stripe webhook - needs raw body
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

export default router;
