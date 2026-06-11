'use client';

import { useState, useCallback, useRef } from 'react';
import { Wallet, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useInvalidateWallet } from '@/hooks/useWallet';
import toast from 'react-hot-toast';
import {
  boostAdWithWallet,
  boostAdWithPaystack,
  validatePaystackConfig,
} from '@/services/boost-service';

type PaymentMethod = 'card' | 'bank' | 'ussd' | 'wallet';

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  walletBalance: number;
  planPrice: number;
  planId: number;
  planType?: string;
  durationDays?: number;
  adId?: number;
  disabled?: boolean;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentMethods({
  selectedMethod,
  onSelectMethod,
  walletBalance,
  planPrice,
  planId,
  planType,
  durationDays,
  adId,
  disabled,
  onPaymentSuccess,
  onPaymentError,
}: PaymentMethodsProps) {
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuthStore();
  const invalidateWallet = useInvalidateWallet();
  const processingRef = useRef(false);

  const handleWalletPay = useCallback(async () => {
    if (!adId || !user?.id) {
      const msg = 'Not authenticated';
      setErrorMessage(msg);
      onPaymentError(msg);
      return;
    }
    if (walletBalance < planPrice) {
      const msg = `Insufficient wallet balance. Available: ₦${walletBalance.toFixed(2)}, Required: ₦${planPrice.toFixed(2)}`;
      setErrorMessage(msg);
      onPaymentError(msg);
      return;
    }
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    setErrorMessage(null);

    try {
      const result = await boostAdWithWallet(adId, {
        ad_id: adId,
        plan_id: planId,
        plan_type: planType || 'standard',
        price: planPrice,
        duration_days: durationDays || 7,
        payment_method: 'wallet',
      });

      if (result.success) {
        invalidateWallet();
        toast.success('Ad boosted successfully!');
        onPaymentSuccess();
      } else {
        const msg = result.error || 'Wallet payment failed';
        setErrorMessage(msg);
        onPaymentError(msg);
      }
    } catch {
      const msg = 'An unexpected error occurred';
      setErrorMessage(msg);
      onPaymentError(msg);
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  }, [adId, user?.id, walletBalance, planPrice, planId, planType, durationDays, invalidateWallet, onPaymentSuccess, onPaymentError]);

  const handleCardPay = useCallback(async () => {
    if (!adId || !user?.id) {
      const msg = 'Not authenticated';
      setErrorMessage(msg);
      onPaymentError(msg);
      return;
    }
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    setErrorMessage(null);

    try {
      const result = await boostAdWithPaystack(adId, {
        ad_id: adId,
        plan_id: planId,
        plan_type: planType || 'standard',
        price: planPrice,
        duration_days: durationDays || 7,
        payment_method: 'paystack',
      });

      if (result.success && result.data?.authorization_url) {
        setProcessing(false);
        processingRef.current = false;
        const popup = window.open(result.data.authorization_url, '_blank', 'width=800,height=600');
        if (!popup || popup.closed) {
          window.location.href = result.data.authorization_url;
        }
      } else {
        const msg = result.error || 'Payment initialization failed';
        setErrorMessage(msg);
        onPaymentError(msg);
      }
    } catch {
      const config = validatePaystackConfig();
      const msg = config.valid
        ? 'Payment initialization failed. Please try again.'
        : (config.error || 'Payment system is not configured');
      setErrorMessage(msg);
      onPaymentError(msg);
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  }, [adId, user?.id, planPrice, planId, planType, durationDays, onPaymentError]);

  const handlePay = () => {
    if (!selectedMethod) return;
    if (selectedMethod === 'wallet') handleWalletPay();
    else handleCardPay();
  };

  const methods: { id: PaymentMethod; label: string; desc: string; icon: string }[] = [
    { id: 'wallet', label: 'Wallet Balance', desc: `₦${walletBalance.toFixed(2)} available`, icon: 'W' },
    { id: 'card', label: 'Card Payment', desc: 'Pay with debit/credit card via Paystack', icon: 'C' },
  ];

  if (!adId) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-700">Loading ad information...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
      <div className="space-y-3">
        {methods.map((method) => (
          <button
            key={method.id}
            disabled={disabled || processing}
            onClick={() => onSelectMethod(method.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            } disabled:opacity-50`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-700">
                {method.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900">{method.label}</p>
                <p className="text-sm text-gray-500">{method.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {selectedMethod && (
        <button
          onClick={handlePay}
          disabled={processing || disabled}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {processing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Wallet className="w-5 h-5" />
          )}
          {processing ? 'Processing...' : `Pay ${selectedMethod === 'wallet' ? 'with Wallet' : 'with Card'}`}
        </button>
      )}
    </div>
  );
}
