import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface CryptoPaymentFlowProps {
  amount: number;
  onSuccess: () => void;
}

const CryptoPaymentFlow: React.FC<CryptoPaymentFlowProps> = ({ amount, onSuccess }) => {
  const [step, setStep] = useState<'details' | 'confirming' | 'success'>('details');
  const [copied, setCopied] = useState(false);
  
  // Mock exchange rate (USD to ETH)
  const ethAmount = (amount / 2500).toFixed(6);
  const cryptoAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const handleCopy = () => {
    void navigator.clipboard.writeText(cryptoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setStep('confirming');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 3000);
  };

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
          <Check className="w-10 h-10 text-white stroke-[3]" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Block Confirmed!</h3>
        <p className="text-gray-500">Transaction successfully mined on-chain.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-100">
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" /> Web3 Settlement
        </h3>
        <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">DIRECT WALLET-TO-WALLET CHANNEL</p>
      </div>

      {step === 'details' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center">
            {/* Mock QR Code */}
            <div className="w-48 h-48 bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center justify-center relative group">
              <div className="grid grid-cols-4 gap-1 opacity-20">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-900" style={{ opacity: Math.random() }} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Zap className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount to send</p>
              <div className="flex items-baseline gap-2 justify-center">
                <span className="text-3xl font-black text-gray-900">{ethAmount}</span>
                <span className="text-lg font-bold text-purple-600 uppercase">ETH</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400">≈ ${amount.toFixed(2)} USD</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination Address</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 font-mono text-xs text-gray-600 truncate flex items-center">
                {cryptoAddress}
              </div>
              <button
                onClick={handleCopy}
                className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-all shadow-lg active:scale-95"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">
              Send only ETH to this address. Sending other assets may result in permanent loss. 
              Transaction will confirm after 2 network validations.
            </p>
          </div>

          <Button
            onClick={handleSimulatePayment}
            className="w-full py-6 rounded-2xl font-black bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-200 uppercase tracking-widest text-xs"
          >
            I've Sent the Assets
          </Button>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <div className="text-center">
            <p className="text-gray-900 font-black uppercase tracking-widest text-sm">Monitoring Mempool</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Awaiting network confirmation...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoPaymentFlow;
