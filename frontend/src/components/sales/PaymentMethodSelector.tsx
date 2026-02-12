import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, ShieldCheck, ChevronRight } from 'lucide-react';

export type PaymentType = 'STRIPE' | 'MASTERCARD' | 'CRYPTO' | 'CASH';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentType | null;
  onSelect: (method: PaymentType) => void;
  amount: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
  amount,
}) => {
  const methods = [
    {
      id: 'STRIPE' as PaymentType,
      name: 'Stripe',
      description: 'Secure one-click payment',
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      color: 'hover:border-blue-500/50 hover:bg-blue-50/50',
      activeColor: 'border-blue-500 bg-blue-50',
    },
    {
      id: 'MASTERCARD' as PaymentType,
      name: 'Mastercard',
      description: 'Primary credit/debit card',
      icon: <CreditCard className="w-6 h-6 text-orange-500" />,
      color: 'hover:border-orange-500/50 hover:bg-orange-50/50',
      activeColor: 'border-orange-500 bg-orange-50',
    },
    {
      id: 'CRYPTO' as PaymentType,
      name: 'Crypto',
      description: 'BTC, ETH, and Stablecoins',
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      color: 'hover:border-purple-500/50 hover:bg-purple-50/50',
      activeColor: 'border-purple-500 bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-100 mb-8">
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Select Protocol</h3>
        <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">CHOOSE SETTLEMENT DESTINATION</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {methods.map((method) => (
          <motion.button
            key={method.id}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(method.id)}
            className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${
              selectedMethod === method.id
                ? method.activeColor
                : 'border-gray-50 bg-white ' + method.color
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                selectedMethod === method.id ? 'bg-white shadow-sm' : 'bg-gray-50'
              }`}>
                {method.icon}
              </div>
              <div className="text-left">
                <h4 className={`font-black uppercase tracking-tight ${
                  selectedMethod === method.id ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {method.name}
                </h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {method.description}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 transition-all ${
              selectedMethod === method.id ? 'text-gray-900 translate-x-1' : 'text-gray-200 opacity-0 group-hover:opacity-100'
            }`} />
          </motion.button>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authorized for settlement</p>
          <span className="text-3xl font-black text-gray-900 tracking-tighter">${amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 shadow-sm">
          <ShieldCheck className="w-3 h-3" /> SECURE L4
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
