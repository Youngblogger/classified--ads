'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Zap, Wallet, Loader2, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useInvalidateWallet } from '@/hooks/useWallet';
import toast from 'react-hot-toast';
import type { BoostPlan, WalletBalanceData } from '@/types';
import {
  fetchBoostPlans,
  fetchWalletBalance,
  boostAdWithWallet,
  boostAdWithPaystack,
  validatePaystackConfig,
} from '@/services/boost-service';

type Step = 'plans' | 'payment' | 'processing' | 'success' | 'failed';

interface BoostAdModalProps {
  adId: number | string;
  adTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  adSlug?: string;
  adImage?: string;
  adPrice?: unknown;
  adLocation?: unknown;
  adCategory?: unknown;
  showInitialStep?: boolean;
}

function getDefaultPlans(): BoostPlan[] {
  return [
    { id: 1, name: 'Basic', type: 'basic', price: 5, formatted_price: '₦5.00', duration_days: 7, features: ['Basic visibility boost', '7 days duration'], is_active: true },
    { id: 2, name: 'Standard', type: 'standard', price: 10, formatted_price: '₦10.00', duration_days: 14, features: ['Standard visibility boost', '14 days duration', 'Highlighted listing'], is_active: true },
    { id: 3, name: 'Premium', type: 'premium', price: 25, formatted_price: '₦25.00', duration_days: 30, features: ['Premium visibility boost', '30 days duration', 'Featured listing', 'Top search results'], is_active: true },
  ];
}

export default function BoostAdModal({
  adId,
  adTitle,
  isOpen,
  onClose,
}: BoostAdModalProps) {
  const [plans, setPlans] = useState<BoostPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<BoostPlan | null>(null);
  const [step, setStep] = useState<Step>('plans');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<WalletBalanceData | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processingRef = useRef(false);

  const { user } = useAuthStore();
  const invalidateWallet = useInvalidateWallet();

  useEffect(() => {
    if (!isOpen) return;
    setStep('plans');
    setSelectedPlan(null);
    setErrorMessage(null);
    setLoading(true);
    setProcessing(false);
    setWalletBalance(null);
    processingRef.current = false;

    fetchBoostPlans().then((result) => {
      if (result.success && result.data && result.data.length > 0) {
        setPlans(result.data);
      } else {
        setPlans(getDefaultPlans());
      }
    }).catch(() => {
      setPlans(getDefaultPlans());
    }).finally(() => setLoading(false));

    setWalletLoading(true);
    fetchWalletBalance().then((result) => {
      if (result.success && result.data) {
        setWalletBalance(result.data);
      }
    }).finally(() => setWalletLoading(false));
  }, [isOpen]);

  const handleSelectPlan = (plan: BoostPlan) => {
    setSelectedPlan(plan);
    setStep('payment');
    setErrorMessage(null);
  };

  const handleWalletPayment = useCallback(async () => {
    if (!selectedPlan || !user?.id) {
      setErrorMessage('Please select a plan and ensure you are logged in');
      return;
    }
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    setStep('processing');
    setErrorMessage(null);

    try {
      const result = await boostAdWithWallet(adId, {
        ad_id: adId,
        plan_id: selectedPlan.id,
        plan_type: selectedPlan.type,
        price: selectedPlan.price,
        duration_days: selectedPlan.duration_days,
        payment_method: 'wallet',
      });

      if (result.success) {
        setStep('success');
        invalidateWallet();
        toast.success(result.data?.message || 'Ad boosted successfully!');
      } else {
        const msg = result.error || 'Wallet payment failed';
        setErrorMessage(msg);
        setStep('failed');
      }
    } catch {
      setErrorMessage('An unexpected error occurred');
      setStep('failed');
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  }, [selectedPlan, adId, user?.id, invalidateWallet]);

  const openPaystackPopup = useCallback((authorizationUrl: string) => {
    setStep('processing');
    const popup = window.open(authorizationUrl, '_blank', 'width=800,height=600');
    if (!popup || popup.closed) {
      window.location.href = authorizationUrl;
    }
  }, []);

  const handlePaystackPayment = useCallback(async () => {
    if (!selectedPlan || !user?.id) {
      setErrorMessage('Please select a plan and ensure you are logged in');
      return;
    }
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    setStep('processing');
    setErrorMessage(null);

    try {
      const result = await boostAdWithPaystack(adId, {
        ad_id: adId,
        plan_id: selectedPlan.id,
        plan_type: selectedPlan.type,
        price: selectedPlan.price,
        duration_days: selectedPlan.duration_days,
        payment_method: 'paystack',
      });

      if (result.success && result.data?.authorization_url) {
        openPaystackPopup(result.data.authorization_url);
      } else {
        const msg = result.error || 'Failed to initialize payment';
        setErrorMessage(msg);
        setStep('failed');
      }
    } catch {
      const config = validatePaystackConfig();
      if (config.valid) {
        setErrorMessage('Payment initialization failed. Please try again.');
      } else {
        setErrorMessage(config.error || 'Payment system is not configured');
      }
      setStep('failed');
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  }, [selectedPlan, adId, user?.id, openPaystackPopup]);

  const handleRetry = () => {
    setStep('payment');
    setErrorMessage(null);
  };

  const handleTryAgain = () => {
    setStep('plans');
    setSelectedPlan(null);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            {step !== 'plans' && (
              <button onClick={() => setStep('plans')} className="p-1 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              {step === 'success' ? 'Boost Activated!' : step === 'failed' ? 'Boost Failed' : 'Boost Ad'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {adTitle && step === 'plans' && (
            <p className="text-sm text-gray-500 mb-4">Boost &ldquo;{adTitle}&rdquo; to reach more buyers</p>
          )}

          {walletBalance && step === 'plans' && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Wallet Balance</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                ₦{walletBalance.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {step === 'plans' && loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}

          {step === 'plans' && !loading && (
            <div className="space-y-3">
              {plans.map((plan, idx) => {
                const isRecommended = idx === 1 || (plan.type === 'standard' || plan.type === 'popular');
                return (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                        Recommended
                      </span>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{plan.duration_days} days &middot; {plan.description || plan.type}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-xl font-bold text-gray-900">
                          {plan.formatted_price || `₦${plan.price.toFixed(2)}`}
                        </p>
                        <p className="text-[10px] text-gray-400">one-time</p>
                      </div>
                    </div>
                    {plan.features && plan.features.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {plan.features.map((f, i) => (
                          <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                            <CheckCircle className={`w-3 h-3 ${selectedPlan?.id === plan.id ? 'text-blue-500' : 'text-green-500'}`} /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {step === 'payment' && selectedPlan && (
            <div className="space-y-5">
              <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Order Summary</span>
                  <span className="text-xs text-gray-400">{selectedPlan.duration_days} days</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 text-sm">Plan</span>
                  <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600 text-sm">Duration</span>
                  <span className="text-gray-900">{selectedPlan.duration_days} days</span>
                </div>
                <div className="flex items-center justify-between pt-3 pb-1 mt-2 border-t-2 border-gray-200">
                  <span className="text-gray-800 font-medium">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {selectedPlan.formatted_price || `₦${selectedPlan.price.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {walletBalance && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Wallet Balance</span>
                  </div>
                  <span className={`text-sm font-bold ${walletBalance.balance >= selectedPlan.price ? 'text-green-600' : 'text-red-500'}`}>
                    ₦{walletBalance.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleWalletPayment}
                  disabled={processing || (walletBalance !== null && walletBalance.balance < selectedPlan.price)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                  Pay with Wallet
                  {walletBalance !== null && walletBalance.balance < selectedPlan.price && (
                    <span className="text-blue-200 text-xs ml-1">(insufficient)</span>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400">or</span>
                  </div>
                </div>

                <button
                  onClick={handlePaystackPayment}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-gray-200 hover:border-gray-300"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-lg font-bold text-green-600">₦</span>
                  )}
                  Pay with Card (Paystack)
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600 font-medium">Processing your payment...</p>
              <p className="text-sm text-gray-400 mt-1">Please wait while we process your request</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ad Boosted!</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Your ad is now being promoted to more buyers.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {step === 'failed' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Boost Failed</h3>
              <p className="text-sm text-red-600 text-center mb-2">{errorMessage || 'Something went wrong'}</p>
              <p className="text-sm text-gray-500 text-center mb-6">Please try again or choose a different payment method.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleTryAgain}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Change Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
