import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message ?? 'Payment failed');
        setIsProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/sales?payment=success',
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message ?? 'Payment failed');
        setIsProcessing(false);
      } else {
        setPaymentSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch {
      setError('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
          <Check className="w-10 h-10 text-white stroke-[3]" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-500">Your transaction has been processed.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-chocolate-100 mb-6">
        <h3 className="text-xl font-black text-chocolate-950 uppercase tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold-600" /> Secure Checkout
        </h3>
        <p className="text-[10px] text-chocolate-400 font-bold tracking-widest mt-1">ENCRYPTED TRANSACTION CHANNEL</p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className="text-xs font-black text-chocolate-900 uppercase tracking-wide">Receipt Destination</label>
        <input
          type="email"
          placeholder="officer@cocoaflow.com"
          className="w-full px-4 py-3 rounded-xl border border-chocolate-200 bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all text-sm font-medium text-chocolate-950 placeholder:text-chocolate-300"
        />
      </div>

      {/* Card Info Title */}
      <div className="space-y-4">
        <label className="text-xs font-black text-chocolate-900 uppercase tracking-wide">Payment Details</label>
        
        {/* Stripe Payment Element */}
        <div className="bg-white rounded-xl border border-chocolate-200 p-1 shadow-sm">
          <PaymentElement
            options={{
              layout: 'accordion',
              defaultValues: {
                billingDetails: {
                  name: '',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-bold text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full py-6 rounded-2xl font-black bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-chocolate-950 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-xl shadow-gold-500/20 active:scale-[0.98] uppercase tracking-widest"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Transaction...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Authorize Payment ${amount.toFixed(2)}
            </>
          )}
        </Button>
      </div>

      {/* Trust Badges - Accepted Cards */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400 font-medium">Accepted:</span>
        <div className="flex items-center gap-2">
          {/* Visa */}
          <div className="w-12 h-8 bg-gradient-to-br from-[#1A1F71] to-[#0D1449] rounded-md flex items-center justify-center shadow-sm">
            <span className="text-white text-[10px] font-bold italic tracking-tight">VISA</span>
          </div>
          {/* Mastercard */}
          <div className="w-12 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md flex items-center justify-center shadow-sm overflow-hidden relative">
            <div className="absolute left-2 w-4 h-4 rounded-full bg-[#EB001B] opacity-90"></div>
            <div className="absolute right-2 w-4 h-4 rounded-full bg-[#F79E1B] opacity-90"></div>
            <div className="absolute w-3 h-4 bg-[#FF5F00] opacity-80" style={{ left: '50%', transform: 'translateX(-50%)' }}></div>
          </div>
          {/* Amex */}
          <div className="w-12 h-8 bg-gradient-to-br from-[#006FCF] to-[#0050A0] rounded-md flex items-center justify-center shadow-sm">
            <span className="text-white text-[7px] font-bold tracking-tight">AMEX</span>
          </div>
          {/* Discover */}
          <div className="w-12 h-8 bg-gradient-to-br from-[#FF6600] to-[#D44E00] rounded-md flex items-center justify-center shadow-sm">
            <span className="text-white text-[6px] font-bold tracking-tight">DISCOVER</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default StripePaymentForm;
