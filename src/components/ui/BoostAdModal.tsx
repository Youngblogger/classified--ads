'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Zap, Wallet, Loader2, CheckCircle, AlertTriangle, ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useInvalidateWallet } from '@/hooks/useWallet';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import { notificationsApi } from '@/lib/api';
import {
  syncAllCaches,
  syncAdListCaches,
  broadcastCacheInvalidation,
  invalidateSwrCache,
} from '@/lib/cache-sync';
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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const { user } = useAuthStore();
  const queryClient = useQueryClient();
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
    previousActiveElement.current = document.activeElement as HTMLElement;

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

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      modalRef.current?.focus();
    });
    return () => {
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
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

        if (user?.id) {
          notificationsApi.create({
            user_id: String(user.id),
            type: 'boost_activated',
            title: 'Ad Boosted!',
            message: `Your ad "${adTitle || 'listing'}" is now boosted on ${selectedPlan.name} plan for ${selectedPlan.duration_days} days.`,
            data: {
              ad_id: adId,
              plan: selectedPlan.name,
              boost_type: selectedPlan.type,
              duration_days: selectedPlan.duration_days,
            },
          }).catch(() => {});
        }

        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['boost', 'status'] });
        syncAllCaches(queryClient);
        syncAdListCaches(queryClient);
        broadcastCacheInvalidation();
        invalidateSwrCache(/^ads/);
        invalidateSwrCache('homepage_data');
        invalidateSwrCache('boosted_ads_listing');
        invalidateSwrCache(/^search/);
        invalidateSwrCache('search/trending');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ilist:cache-invalidate'));
          window.dispatchEvent(new CustomEvent('ilist:boost-activated', {
            detail: { adId, plan: selectedPlan.type },
          }));
        }
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

  const getStepWidth = (): string => {
    const map: Record<Step, string> = {
      plans: '25%',
      payment: '50%',
      processing: '75%',
      success: '100%',
      failed: '100%',
    };
    return map[step] || '25%';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Boost your ad"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto outline-none"
      >
        <div className="sticky top-0 bg-white z-10">
          <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                {step !== 'plans' && (
                  <button
                    onClick={() => { setStep('plans'); setSelectedPlan(null); setErrorMessage(null); }}
                    className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                    aria-label="Back to plans"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                )}
                {step === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
                {step === 'failed' && <AlertTriangle className="w-6 h-6 text-red-500" />}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {step === 'plans' && (
              <div className="mt-1">
                <h2 className="text-xl font-bold text-gray-900">Boost Your Ad</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Reach more buyers and increase visibility instantly.
                </p>
              </div>
            )}
          </div>

          {step !== 'success' && step !== 'failed' && (
            <div className="px-5 sm:px-6 pb-1">
              <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: getStepWidth() }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {step === 'plans' && loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <p className="text-sm text-gray-400 mt-3">Loading plans...</p>
            </div>
          )}

          {step === 'plans' && !loading && (
            <div className="space-y-3">
              {adTitle && (
                <p className="text-sm text-gray-500 mb-1">
                  Boost &ldquo;{adTitle.length > 40 ? adTitle.slice(0, 40) + '...' : adTitle}&rdquo;
                </p>
              )}

              {walletBalance && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Wallet Balance</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(walletBalance.balance)}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {plans.map((plan, idx) => {
                  const isRecommended = idx === 1 || (plan.type === 'standard' || plan.type === 'popular');
                  const isSelected = selectedPlan?.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan)}
                      className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50/50 shadow-sm shadow-primary-100'
                          : 'border-gray-200 hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 bg-white'
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`${plan.name} plan - ${formatCurrency(plan.price)}`}
                    >
                      {isRecommended && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                          Most Popular
                        </span>
                      )}
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {plan.duration_days} days &middot; {plan.description || plan.type}
                          </p>
                          {plan.features && plan.features.length > 0 && (
                            <ul className="mt-2.5 space-y-1">
                              {plan.features.map((f, i) => (
                                <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                                  <TrendingUp className={`w-3 h-3 ${isSelected ? 'text-primary-500' : 'text-gray-400'}`} />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(plan.price)}
                          </p>
                          <p className="text-[10px] text-gray-400">one-time</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 space-y-2">
                <button
                  onClick={() => {
                    if (!selectedPlan) { toast.error('Select a plan first'); return; }
                    setStep('payment');
                  }}
                  disabled={!selectedPlan}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-500 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
                >
                  Boost Now
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-gray-500 font-medium hover:text-gray-700 transition-colors rounded-xl"
                >
                  No Thanks
                </button>
              </div>
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
                    {formatCurrency(selectedPlan.price)}
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
                    {formatCurrency(walletBalance.balance)}
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-[0.98]"
                  aria-label={walletBalance !== null && walletBalance.balance < selectedPlan.price ? 'Insufficient wallet balance' : 'Pay with Wallet'}
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                  Pay with Wallet
                  {walletBalance !== null && walletBalance.balance < selectedPlan.price && (
                    <span className="text-primary-200 text-xs ml-1">(insufficient)</span>
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-gray-200 hover:border-gray-300 active:scale-[0.98]"
                  aria-label="Pay with Card"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-lg font-bold text-green-600">₦</span>
                  )}
                  Pay with Card (Paystack)
                </button>
              </div>

              <button
                onClick={() => { setStep('plans'); setSelectedPlan(null); setErrorMessage(null); }}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Change Plan
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
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
              <p className="text-sm text-gray-500 text-center mb-6 max-w-xs">
                Your ad is now being promoted to more buyers.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
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
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleTryAgain}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
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