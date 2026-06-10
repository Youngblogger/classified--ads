'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Check, X, Zap, Crown, Diamond, Loader2, ArrowRight,
  ExternalLink, LayoutDashboard, Sparkles, TrendingUp, Target,
  Clock, Shield, Star, ChevronRight, PartyPopper, RefreshCw,
  Eye, MapPin, Tag, ImageIcon, Wallet, CreditCard, ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { growthApi, walletApi } from '@/lib/api';
import { getAuthToken } from '@/lib/cookies';
import { useAuthStore } from '@/lib/store';
import { recommendBoostPlan, BOOST_IMPACT, BOOST_PACKAGES, getBoostPlanLabel, type PackageDefinition } from '@/lib/boost-config';
import { trackBoostEvent } from '@/lib/analytics';
import { useWalletBalance, useInvalidateWallet, WALLET_QUERY_KEY } from '@/hooks/useWallet';
import { getQueryClient } from '@/lib/query-client';
import toast from 'react-hot-toast';

type ModalStep = 'initial' | 'packages' | 'payment_method' | 'processing' | 'success' | 'error';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const PLAN_TO_TIER: Record<string, string> = {
  silver: 'gold',
  gold: 'platinum',
  platinum: 'diamond',
};



const TIER_COLORS: Record<string, { bg: string; border: string; badge: string; btn: string; shadow: string }> = {
  gold: {
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-300',
    badge: 'from-amber-400 via-yellow-300 to-amber-400',
    btn: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
    shadow: 'shadow-amber-400/20',
  },
  platinum: {
    bg: 'from-slate-50 to-gray-50',
    border: 'border-slate-300',
    badge: 'from-slate-400 via-slate-300 to-slate-400',
    btn: 'from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700',
    shadow: 'shadow-slate-400/20',
  },
  diamond: {
    bg: 'from-violet-50 to-purple-50',
    border: 'border-violet-300',
    badge: 'from-violet-500 via-purple-400 to-fuchsia-400',
    btn: 'from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800',
    shadow: 'shadow-violet-500/20',
  },
};

const PACKAGE_EMOJI: Record<string, string> = {
  silver: '🥈',
  gold: '🪙',
  platinum: '🥇',
};

const RECOMMENDED_PACKAGE = 'gold';

interface BoostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string | number;
  adTitle?: string;
  adSlug?: string;
  adImage?: string;
  adPrice?: number | string;
  adLocation?: string;
  adCategory?: string | { name?: string; slug?: string } | null;
  showInitialStep?: boolean;
  onBoostActivated?: () => void;
}

function getQueryParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function getCategoryString(cat: string | { name?: string; slug?: string } | null | undefined): string | undefined {
  if (!cat) return undefined;
  if (typeof cat === 'string') return cat;
  return cat.name || cat.slug || undefined;
}

export default function BoostAdModal({
  isOpen,
  onClose,
  adId,
  adTitle,
  adSlug,
  adImage,
  adPrice,
  adLocation,
  adCategory,
  showInitialStep = false,
  onBoostActivated,
}: BoostAdModalProps) {
  const router = useRouter();
  const prevStepRef = useRef<ModalStep | null>(null);
  const packageTrackedRef = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<ModalStep>(showInitialStep ? 'initial' : 'packages');
  const [packages, setPackages] = useState<PackageDefinition[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidateWallet = useInvalidateWallet();
  const { data: walletData, isLoading: walletLoading } = useWalletBalance();
  const walletBalance = walletData?.availableBalance ?? null;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wallet' | 'paystack' | null>(null);
  const [boostStatus, setBoostStatus] = useState<{ has_active_boost: boolean; active_boost?: any; can_renew: boolean; renewal_info?: any } | null>(null);
  const [boostResult, setBoostResult] = useState<{
    packageName?: string;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    reference?: string;
    price?: number;
    paymentMethod?: string;
  } | null>(null);

  const selectedPkg = packages.find(p => p.type === selectedPackage);
  const tierKey = selectedPackage ? (PLAN_TO_TIER[selectedPackage] || 'gold') : 'gold';
  const colors = TIER_COLORS[tierKey] || TIER_COLORS.gold;
  const hasSufficientBalance = walletBalance !== null && selectedPkg && walletBalance >= selectedPkg.price;

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, step, adSlug]);

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setStep(showInitialStep ? 'initial' : 'packages');
    setSelectedPackage(null);
    setSelectedPaymentMethod(null);
    setError(null);
    setBoostResult(null);
    setBoostStatus(null);
    invalidateWallet();
    packageTrackedRef.current = false;
    prevStepRef.current = null;

    fetchPlans();
    fetchBoostStatus();
  }, [isOpen, adId, showInitialStep]);

  // Track step changes
  useEffect(() => {
    if (!isOpen) return;
    if (prevStepRef.current === step) return;
    prevStepRef.current = step;

    if (step === 'initial') {
      trackBoostEvent('boost_offer_viewed', { ad_id: adId });
    } else if (step === 'packages') {
      packageTrackedRef.current = false;
    }
  }, [step, isOpen, adId]);

  // Revalidate wallet balance when entering payment_method step
  useEffect(() => {
    if (step === 'payment_method') {
      invalidateWallet();
    }
  }, [step, invalidateWallet]);

  // Check for pending payment verification on mount
  useEffect(() => {
    if (!isOpen) return;
    const pendingRef = localStorage.getItem('pending_boost_ref');
    const pendingAdId = localStorage.getItem('pending_boost_ad_id');
    const trxref = getQueryParam('trxref') || getQueryParam('reference');

    if (trxref && pendingRef === trxref && pendingAdId === String(adId)) {
      setStep('processing');
      verifyPayment(trxref);
    } else if (pendingRef && !trxref) {
      const storedTime = localStorage.getItem('pending_boost_time');
      if (storedTime && Date.now() - parseInt(storedTime) > 3600000) {
        localStorage.removeItem('pending_boost_ref');
        localStorage.removeItem('pending_boost_ad_id');
        localStorage.removeItem('pending_boost_time');
      }
    }
  }, [isOpen, adId]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    setTimeout(() => firstFocusable?.focus(), 100);

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modal.addEventListener('keydown', trapFocus);
    return () => modal.removeEventListener('keydown', trapFocus);
  }, [isOpen, step]);

  // Track ad_created for post-submission flow
  useEffect(() => {
    if (isOpen && showInitialStep) {
      trackBoostEvent('ad_created', { ad_id: adId });
    }
  }, [isOpen, adId, showInitialStep]);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/ads/boost-plans`);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const mapped = data.data.map((p: any) => ({
          type: p.type,
          name: p.name,
          displayName: p.displayName || getBoostPlanLabel(p.type) || p.name,
          description: p.description || '',
          price: p.price,
          durationDays: p.durationDays || p.duration_days,
          priorityScore: p.priorityScore || p.priority_score,
          badgeLabel: p.badgeLabel || p.badge_label,
          features: p.features || [],
          iconName: p.iconName || 'Zap',
          recommendedLabel: p.recommendedLabel || (p.type === RECOMMENDED_PACKAGE ? 'Most Popular' : ''),
        }));
        setPackages(mapped);
        if (mapped.length > 0) {
          setSelectedPackage(mapped[0].type);
        }
        return;
      }
    } catch {}
    setPackages(BOOST_PACKAGES);
    setSelectedPackage(BOOST_PACKAGES[0].type);
  };

  const fetchBoostStatus = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/ads/${adId}/boost-status`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBoostStatus(data.data);
      }
    } catch {}
  };

  const verifyPayment = useCallback(async (reference: string) => {
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/payments/verify?reference=${reference}`);
      const data = await res.json();

      if (data?.success || data?.status === 'success' || data?.data?.status === 'success') {
        const pkg = packages.find(p => p.type === selectedPackage);
        setBoostResult({
          packageName: pkg?.displayName || selectedPackage || 'Boost',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + (pkg?.durationDays || 7) * 86400000).toISOString(),
          durationDays: pkg?.durationDays,
          reference,
          price: pkg?.price,
        });
        setStep('success');
        trackBoostEvent('payment_completed', { ad_id: adId, package_type: selectedPackage || undefined, reference, duration_days: pkg?.durationDays });
        trackBoostEvent('boost_activated', { ad_id: adId, package_type: selectedPackage || undefined, reference, duration_days: pkg?.durationDays });
        toast.success('Payment confirmed! Boost activated successfully.');
        onBoostActivated?.();
      } else {
        setError('Payment could not be verified. Please check your dashboard.');
        setStep('error');
        trackBoostEvent('payment_failed', { ad_id: adId, package_type: selectedPackage || undefined, reference, error: 'verification_failed' });
      }
    } catch {
      setError('Payment verification failed. Please check your dashboard.');
      setStep('error');
      trackBoostEvent('payment_failed', { ad_id: adId, package_type: selectedPackage || undefined, reference, error: 'verification_error' });
    } finally {
      setVerifying(false);
      localStorage.removeItem('pending_boost_ref');
      localStorage.removeItem('pending_boost_ad_id');
      localStorage.removeItem('pending_boost_time');
    }
  }, [adId, packages, selectedPackage, onBoostActivated]);

  const handleSkip = () => {
    trackBoostEvent('boost_skipped', { ad_id: adId });
    onClose();
    router.replace('/');
  };

  const handleProceedToPackages = () => {
    setStep('packages');
  };

  const handleSelectPackage = (type: string) => {
    setSelectedPackage(type);
    if (!packageTrackedRef.current) {
      packageTrackedRef.current = true;
    }
    trackBoostEvent('boost_package_selected', { ad_id: adId, package_type: type, package_price: packages.find(p => p.type === type)?.price });
  };

  const handleContinueToPayment = () => {
    if (!selectedPackage) {
      toast.error('Please select a boost package');
      return;
    }
    setSelectedPaymentMethod(null);
    setStep('payment_method');
  };

  const handleSelectPaymentMethod = (method: 'wallet' | 'paystack') => {
    setSelectedPaymentMethod(method);
    trackBoostEvent('payment_method_selected', { ad_id: adId, package_type: selectedPackage || undefined, package_price: selectedPkg?.price, payment_method: method });
  };

  const handleConfirmPayment = async () => {
    if (!selectedPackage || !selectedPkg || !selectedPaymentMethod) return;
    setStep('processing');
    setLoading(true);
    setError(null);

    const paymentMethod = selectedPaymentMethod;

    if (paymentMethod === 'wallet') {
      // Revalidate balance from backend before confirming
      const freshData = await getQueryClient().fetchQuery({ queryKey: WALLET_QUERY_KEY, queryFn: async () => { const res = await walletApi.getBalance(); return { balance: Number((res.data as any)?.data?.balance ?? 0), availableBalance: Number((res.data as any)?.data?.available_balance ?? (res.data as any)?.data?.balance ?? 0), pendingBalance: Number((res.data as any)?.data?.pending_balance ?? 0) }; } });
      if (freshData.availableBalance < selectedPkg.price) {
        setError('Insufficient wallet balance. Please fund your wallet or choose another payment method.');
        setStep('error');
        setLoading(false);
        trackBoostEvent('wallet_insufficient_on_confirm', { ad_id: adId, package_type: selectedPackage, available: freshData.availableBalance, required: selectedPkg.price });
        return;
      }
      trackBoostEvent('wallet_payment_started', { ad_id: adId, package_type: selectedPackage, package_price: selectedPkg.price });
    } else {
      trackBoostEvent('paystack_payment_started', { ad_id: adId, package_type: selectedPackage, package_price: selectedPkg.price });
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const token = getAuthToken();

    try {
      const res = await fetch(`${API_URL}/ads/${adId}/boost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({
          plan_type: selectedPackage,
          payment_method: paymentMethod,
          user_id: useAuthStore.getState().user?.id,
          email: useAuthStore.getState().user?.email,
        }),
      });

      const data = await res.json();
      const responseData = data.data || data;

      if (paymentMethod === 'wallet' && (responseData?.boost_id || res.ok)) {
        invalidateWallet();
        setBoostResult({
          packageName: selectedPkg.displayName,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + selectedPkg.durationDays * 86400000).toISOString(),
          durationDays: selectedPkg.durationDays,
          reference: responseData.reference || responseData.boost_id,
          price: selectedPkg.price,
          paymentMethod: 'wallet',
        });
        setStep('success');
        trackBoostEvent('wallet_payment_success', { ad_id: adId, package_type: selectedPackage, duration_days: selectedPkg.durationDays });
        trackBoostEvent('boost_activated', { ad_id: adId, package_type: selectedPackage, duration_days: selectedPkg.durationDays });
        toast.success('Boost activated successfully via wallet!');
        onBoostActivated?.();
      } else if (paymentMethod === 'paystack' && responseData?.authorization_url) {
        const ref = responseData.payment_intent || responseData.reference;
        localStorage.setItem('pending_boost_ref', ref);
        localStorage.setItem('pending_boost_ad_id', String(adId));
        localStorage.setItem('pending_boost_time', String(Date.now()));
        setBoostResult({
          packageName: selectedPkg.displayName,
          durationDays: selectedPkg.durationDays,
          reference: ref,
          price: selectedPkg.price,
          paymentMethod: 'paystack',
        });
        window.location.href = responseData.authorization_url;
      } else if (responseData?.boost_id) {
        setBoostResult({
          packageName: selectedPkg.displayName,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + selectedPkg.durationDays * 86400000).toISOString(),
          durationDays: selectedPkg.durationDays,
          price: selectedPkg.price,
          paymentMethod: paymentMethod === 'wallet' ? 'wallet' : 'paystack',
        });
        setStep('success');
        trackBoostEvent('boost_activated', { ad_id: adId, package_type: selectedPackage, duration_days: selectedPkg.durationDays });
        toast.success('Boost activated successfully!');
        onBoostActivated?.();
      } else {
        throw new Error(data.error || data.message || 'Unexpected response from server');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to process boost. Please try again.';
      setError(msg);
      setStep('error');
      trackBoostEvent('payment_failed', { ad_id: adId, package_type: selectedPackage, error: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (method: 'wallet' | 'paystack' = 'paystack') => {
    const token = getAuthToken();
    if (!token || !selectedPackage) return;

    setSelectedPaymentMethod(method);
    setStep('processing');
    setLoading(true);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    try {
      const res = await fetch(`${API_URL}/ads/${adId}/boost-renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({
          plan_type: selectedPackage,
          payment_method: method,
          user_id: useAuthStore.getState().user?.id,
          email: useAuthStore.getState().user?.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed (${res.status})`);
      }

      if (method === 'wallet') {
        toast.success('Boost renewed successfully via wallet!');
        onBoostActivated?.();
        onClose();
      } else if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process renewal');
      setStep('packages');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAd = () => {
    onClose();
    if (adSlug) {
      router.push(`/ad/${adSlug}`);
    } else {
      router.push('/dashboard/my-ads');
    }
  };

  const handleGoToDashboard = () => {
    onClose();
    router.push('/dashboard/my-ads');
  };

  const handleClose = () => {
    if (step === 'initial') {
      trackBoostEvent('boost_skipped', { ad_id: adId });
      onClose();
      router.replace('/');
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        step === 'initial' ? 'Ad posted successfully' :
        step === 'packages' ? 'Select boost package' :
        step === 'payment_method' ? 'Choose payment method' :
        step === 'success' ? 'Boost activated' :
        step === 'error' ? 'Error' : 'Processing'
      }
    >
      <div className="fixed inset-0 bg-black/60" onClick={handleClose} aria-hidden="true" />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1">
          {/* STEP: Initial - Success Message with Mini Ad Preview */}
          {step === 'initial' && (
            <div className="p-8 md:p-10 relative">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                  <PartyPopper className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                  Ad Posted Successfully
                </h2>
                <p className="text-lg text-gray-500 max-w-md mx-auto">
                  Your ad is now live and visible to potential buyers.
                </p>
              </div>

              {(adTitle || adImage || adPrice || adLocation || adCategory) && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <div className="flex gap-4 p-4">
                    {adImage ? (
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        {adImage.startsWith('blob:') ? (
                          <img src={adImage} alt={adTitle || 'Ad preview'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="relative w-full h-full">
                            <Image src={adImage} alt={adTitle || 'Ad preview'} fill priority className="object-cover" sizes="96px" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {adTitle && (
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1.5">{adTitle}</h3>
                      )}
                      {adPrice && (
                        <p className="text-lg font-bold text-violet-600 mb-1.5">{formatPrice(Number(adPrice))}</p>
                      )}
                      <div className="space-y-1">
                        {adCategory && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Tag className="w-3.5 h-3.5" />
                            {getCategoryString(adCategory)}
                          </div>
                        )}
                        {adLocation && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {adLocation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50 flex items-center gap-2 text-xs text-gray-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Your ad is live — boost it to reach more buyers</span>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-violet-50 to-purple-50/50 rounded-2xl p-6 mb-8 border border-violet-100/50">
                <div className="text-center mb-5">
                  <Sparkles className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900 text-lg">Get 10x more visibility</h3>
                  <p className="text-sm text-gray-500">Boosted ads sell 73% faster on average</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white/80 rounded-xl p-3.5 text-center">
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">Priority Placement</p>
                    <p className="text-xs text-gray-400 mt-0.5">Above normal listings</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3.5 text-center">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">More Buyers</p>
                    <p className="text-xs text-gray-400 mt-0.5">Reach interested buyers</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3.5 text-center">
                    <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">Stand Out</p>
                    <p className="text-xs text-gray-400 mt-0.5">Featured badge &amp; badge</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleProceedToPackages}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl font-bold text-lg hover:from-violet-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                  aria-label="Boost this ad to increase visibility"
                >
                  <Zap className="w-5 h-5" />
                  Boost This Ad
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  aria-label="Skip boost and go to your ad"
                >
                  Skip For Now
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Secure payment</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Instant activation</span>
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> 24/7 support</span>
              </div>
            </div>
          )}

          {/* STEP: Packages - Boost Package Selection */}
          {step === 'packages' && (
            <div className="p-6 md:p-8">
              {/* Header with wallet balance and close button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  <h2 className="text-lg font-bold text-gray-900 truncate">Boost Your Ad</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {walletBalance !== null && (
                    <div className="flex items-center gap-1.5 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">{formatPrice(walletBalance)}</span>
                    </div>
                  )}
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {adTitle && (
                <p className="text-sm text-gray-600 mb-4 truncate">
                  Boosting: <span className="font-semibold text-gray-900">{adTitle}</span>
                </p>
              )}

              {/* Active/Expired boost banner */}
              {boostStatus?.has_active_boost && boostStatus.active_boost && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-blue-900">Boost active</span>
                    <span className="text-blue-700 ml-1">
                      — {boostStatus.active_boost.plan_name || boostStatus.active_boost.boost_type} · {boostStatus.active_boost.time_remaining || `${boostStatus.active_boost.days_remaining} days left`}
                    </span>
                  </div>
                </div>
              )}

              {/* Recommended plan notice */}
              {adCategory && (() => {
                const cat = getCategoryString(adCategory);
                if (!cat) return null;
                const recommended = recommendBoostPlan({ category: cat, price: adPrice });
                const recTierKey = Object.entries(PLAN_TO_TIER).find(([, v]) => v === recommended)?.[0] || 'silver';
                const rColors = TIER_COLORS[recommended] || TIER_COLORS.gold;
                return (
                  <div className={`mb-4 px-4 py-3 rounded-xl bg-gradient-to-r ${rColors.bg} border ${rColors.border} ${rColors.shadow} flex items-center gap-3`}>
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">Recommended: </span>
                      <span className="font-bold">{recommended.charAt(0).toUpperCase() + recommended.slice(1)} Plan</span>
                      <span className="text-gray-600 ml-1">— {BOOST_IMPACT[recommended]?.views}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Plan cards */}
              {packages.length > 0 && (
                <div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
                  role="radiogroup"
                  aria-label="Boost package selection"
                >
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage === pkg.type;
                    const planTierKey = PLAN_TO_TIER[pkg.type] || 'gold';
                    const c = TIER_COLORS[planTierKey] || TIER_COLORS.gold;
                    const cat = getCategoryString(adCategory);
                    const recommendedPlanKey = cat ? recommendBoostPlan({ category: cat, price: adPrice }) : null;
                    const isRecommended = !!recommendedPlanKey && PLAN_TO_TIER[pkg.type] === recommendedPlanKey;
                    const isDefaultRecommended = pkg.type === RECOMMENDED_PACKAGE && !recommendedPlanKey;
                    const impactInfo = BOOST_IMPACT[planTierKey];
                    const pkgEmoji = PACKAGE_EMOJI[pkg.type] || '⚡';

                    return (
                      <button
                        key={pkg.type}
                        onClick={() => handleSelectPackage(pkg.type)}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${getBoostPlanLabel(pkg.type) || pkg.displayName} - ${formatPrice(pkg.price)} - ${pkg.durationDays} days`}
                        className={`
                          relative flex flex-col items-center text-center px-4 py-5 rounded-2xl border-2 transition-all duration-200
                          ${isDefaultRecommended ? 'pt-8' : ''}
                          ${isRecommended && !isSelected ? 'ring-2 ring-amber-400' : ''}
                          ${isSelected
                            ? `${c.border} bg-gradient-to-b ${c.bg} ${c.shadow} shadow-lg scale-[1.02]`
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-10">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                        {(isRecommended || isDefaultRecommended) && !isSelected && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-[10px] font-bold rounded-full shadow-lg whitespace-nowrap z-10">
                            <Star className="w-3 h-3 inline-block -mt-0.5 mr-1" />
                            Most Popular
                          </div>
                        )}
                        {(isRecommended || isDefaultRecommended) && isSelected && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg whitespace-nowrap z-10">
                            ★ Best Match
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${c.badge} shadow-lg text-xl`}>
                          {pkgEmoji}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">{getBoostPlanLabel(pkg.type) || pkg.displayName}</h3>
                        <div className="text-2xl font-extrabold text-gray-900 mb-1">
                          {formatPrice(pkg.price)}
                        </div>
                        <div className="text-xs font-medium text-gray-500 mb-2">
                          {pkg.durationDays} day{pkg.durationDays > 1 ? 's' : ''}
                        </div>
                        {impactInfo && (
                          <div className={`text-xs font-semibold mb-3 px-2 py-1 rounded-full ${isRecommended ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                            {impactInfo.views}
                          </div>
                        )}
                        <div className="w-full space-y-1.5 text-left border-t border-gray-100 pt-3">
                          {pkg.features.slice(0, 4).map((feature, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Footer actions */}
              {selectedPkg && (
                <div className="space-y-3">
                  <button
                    onClick={handleContinueToPayment}
                    disabled={!selectedPackage || loading}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl font-bold text-lg hover:from-violet-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                    aria-label={selectedPackage ? `Continue to payment for ${formatPrice(selectedPkg.price)}` : 'Select a package first'}
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                      <>
                        Continue To Payment
                        <span className="w-px h-5 bg-white/30 mx-2" />
                        {formatPrice(selectedPkg.price)}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSkip}
                    disabled={loading}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    aria-label="Skip boost for now"
                  >
                    Skip, I&apos;ll do this later
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-gray-400 mt-4">
                <Shield className="w-3 h-3 inline-block mr-1" />
                Secured by Paystack &mdash; wallet also available
              </p>
            </div>
          )}

          {/* STEP: Payment Method Selection */}
          {step === 'payment_method' && selectedPkg && (
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => { setStep('packages'); setSelectedPaymentMethod(null); }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-lg"
                  aria-label="Back to package selection"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change package
                </button>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Method</h2>
                <p className="text-gray-500 text-sm">Select how you&apos;d like to pay for your boost</p>
              </div>

              <div className="space-y-3 mb-6" role="radiogroup" aria-label="Payment method selection">
                {/* Wallet Option */}
                <button
                  onClick={() => handleSelectPaymentMethod('wallet')}
                  role="radio"
                  aria-checked={selectedPaymentMethod === 'wallet'}
                  className={`
                    w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${selectedPaymentMethod === 'wallet'
                      ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-white shadow-lg shadow-emerald-100/50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedPaymentMethod === 'wallet' ? 'bg-emerald-500' : 'bg-emerald-100'}`}>
                        <Wallet className={`w-5 h-5 ${selectedPaymentMethod === 'wallet' ? 'text-white' : 'text-emerald-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-base">Wallet Balance</p>
                        <p className="text-xs text-gray-500 mt-0.5">Instant payment using wallet funds</p>
                        {walletLoading ? (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading balance...
                          </div>
                        ) : walletBalance !== null ? (
                          <div className="mt-3 space-y-1.5">
                            <div className="flex items-center justify-between text-sm max-w-[260px]">
                              <span className="text-gray-500">Available Balance</span>
                              <span className="font-semibold text-gray-900">{formatPrice(walletBalance)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm max-w-[260px]">
                              <span className="text-gray-500">Boost Cost</span>
                              <span className="font-semibold text-gray-900">{formatPrice(selectedPkg.price)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-1.5 mt-1.5">
                              <div className="flex items-center justify-between text-sm max-w-[260px]">
                                <span className="text-gray-500">Balance After Payment</span>
                                <span className={`font-bold ${walletBalance >= selectedPkg.price ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {walletBalance >= selectedPkg.price
                                    ? formatPrice(walletBalance - selectedPkg.price)
                                    : formatPrice(selectedPkg.price - walletBalance) + ' short'}
                                </span>
                              </div>
                            </div>
                            {walletBalance >= selectedPkg.price ? (
                              <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-emerald-100 rounded-full text-xs font-medium text-emerald-700">
                                <Check className="w-3 h-3" /> Sufficient Balance
                              </div>
                            ) : (
                              <div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                                <p className="text-xs text-red-600 font-medium">Insufficient Wallet Balance</p>
                                <p className="text-xs text-red-500 mt-0.5">
                                  Additional needed: <span className="font-semibold">{formatPrice(selectedPkg.price - walletBalance)}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                            <Shield className="w-3.5 h-3.5" /> Could not load balance
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${selectedPaymentMethod === 'wallet' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                      {selectedPaymentMethod === 'wallet' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                </button>

                {/* Paystack Option */}
                <button
                  onClick={() => handleSelectPaymentMethod('paystack')}
                  role="radio"
                  aria-checked={selectedPaymentMethod === 'paystack'}
                  className={`
                    w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${selectedPaymentMethod === 'paystack'
                      ? 'border-violet-400 bg-gradient-to-br from-violet-50 to-white shadow-lg shadow-violet-100/50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedPaymentMethod === 'paystack' ? 'bg-violet-500' : 'bg-violet-100'}`}>
                        <CreditCard className={`w-5 h-5 ${selectedPaymentMethod === 'paystack' ? 'text-white' : 'text-violet-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-base">Paystack</p>
                        <p className="text-xs text-gray-500 mt-0.5">Secure payment via Paystack</p>
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                          {['Card', 'Bank Transfer', 'USSD', 'Opay', 'PalmPay', 'Mobile Banking'].map((m) => (
                            <div key={m} className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${selectedPaymentMethod === 'paystack' ? 'border-violet-500 bg-violet-500' : 'border-gray-300'}`}>
                      {selectedPaymentMethod === 'paystack' && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Payment Summary */}
              {selectedPaymentMethod && (
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    Payment Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Package</span>
                      <span className="font-medium text-gray-900">{getBoostPlanLabel(selectedPkg.type) || selectedPkg.displayName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium text-gray-900">{selectedPkg.durationDays} day{selectedPkg.durationDays > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Payment Method</span>
                      <span className="font-medium text-gray-900 capitalize">{selectedPaymentMethod === 'wallet' ? 'Wallet Balance' : 'Paystack'}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-lg text-gray-900">{formatPrice(selectedPkg.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic CTA */}
              {selectedPaymentMethod && (
                <button
                  onClick={selectedPaymentMethod === 'wallet' && !hasSufficientBalance && boostStatus?.can_renew
                    ? () => handleRenew('paystack')
                    : handleConfirmPayment
                  }
                  disabled={loading || (selectedPaymentMethod === 'wallet' && walletBalance !== null && walletBalance < selectedPkg.price && !boostStatus?.can_renew)}
                  className={`
                    w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2
                    active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${selectedPaymentMethod === 'wallet'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    }
                  `}
                  aria-label={
                    selectedPaymentMethod === 'wallet'
                      ? `Pay with wallet ${formatPrice(selectedPkg.price)}`
                      : `Continue to Paystack ${formatPrice(selectedPkg.price)}`
                  }
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : selectedPaymentMethod === 'wallet' ? (
                    <>
                      <Wallet className="w-5 h-5" />
                      {boostStatus?.can_renew ? 'Renew With Wallet' : 'Pay With Wallet'}
                      <span className="w-px h-5 bg-white/30 mx-0.5" />
                      {formatPrice(selectedPkg.price)}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {boostStatus?.can_renew ? 'Renew with Paystack' : 'Continue To Paystack'}
                      <span className="w-px h-5 bg-white/30 mx-0.5" />
                      {formatPrice(selectedPkg.price)}
                    </>
                  )}
                </button>
              )}

              {selectedPaymentMethod === 'wallet' && walletBalance !== null && walletBalance < selectedPkg.price && !boostStatus?.can_renew && (
                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-sm font-medium text-amber-800 mb-1">Insufficient wallet balance</p>
                  <p className="text-xs text-amber-700 mb-3">
                    Fund your wallet or choose Paystack to pay with card/bank transfer.
                  </p>
                  <button
                    onClick={() => handleSelectPaymentMethod('paystack')}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    Continue To Paystack Instead
                  </button>
                </div>
              )}

              <button
                onClick={handleSkip}
                className="w-full py-3 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Skip boost for now"
              >
                Skip, I&apos;ll do this later
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                <Shield className="w-3 h-3 inline-block mr-1" />
                Your payment is processed securely
              </p>
            </div>
          )}

          {/* STEP: Processing */}
          {step === 'processing' && (
            <div className="p-8 md:p-10 text-center relative" role="status" aria-label="Processing your boost">
              <div className="flex justify-end -mt-2 -mr-2 mb-2">
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {verifying ? (
                  <RefreshCw className="w-10 h-10 animate-spin text-violet-600" />
                ) : (
                  <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {verifying ? 'Verifying payment' : 'Setting up your boost'}
              </h2>
              <p className="text-gray-500 mb-2">
                {verifying
                  ? 'Please wait while we confirm your payment.'
                  : 'We&apos;re preparing your payment and boost activation.'}
              </p>
              <p className="text-sm text-gray-400">
                {verifying ? 'This should only take a moment.' : 'You will be redirected to complete payment securely.'}
              </p>
              {selectedPackage && (
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm text-gray-600">
                  <span className="text-base">{PACKAGE_EMOJI[selectedPackage] || '⚡'}</span>
                  <span>{getBoostPlanLabel(selectedPackage) || selectedPackage}</span>
                  <span className="text-gray-300 mx-1">&bull;</span>
                  {formatPrice(packages.find(p => p.type === selectedPackage)?.price || 0)}
                </div>
              )}
            </div>
          )}

          {/* STEP: Error */}
          {step === 'error' && (
            <div className="p-8 md:p-10 text-center relative" role="alert">
              <div className="flex justify-end -mt-2 -mr-2 mb-2">
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-500 mb-6">{error || 'An unexpected error occurred. Please try again.'}</p>
              <div className="space-y-3 max-w-sm mx-auto">
                <button
                  onClick={() => { setStep('payment_method'); setError(null); }}
                  className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                  aria-label="Try again"
                >
                  Try Again
                </button>
                <button
                  onClick={handleGoToDashboard}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  aria-label="Go to My Ads dashboard"
                >
                  Go to My Ads
                </button>
              </div>
            </div>
          )}

          {/* STEP: Success - Boost Activated */}
          {step === 'success' && (
            <div className="p-8 md:p-10 relative">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleClose}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-200">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                  Boost Activated Successfully
                </h2>
                <p className="text-lg text-gray-500">
                  Your advertisement is now receiving priority visibility.
                </p>
              </div>

              {boostResult && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 mb-8 border border-violet-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/80 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Package</p>
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        {boostResult.packageName || 'Boost'}
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                      <p className="font-bold text-gray-900">
                        {boostResult.durationDays || '-'} day{(boostResult.durationDays || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Activation Date</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatDate(boostResult.startDate) || 'Just now'}
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Expiration Date</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatDate(boostResult.endDate) || '-'}
                      </p>
                    </div>
                    {boostResult.paymentMethod && (
                      <div className="bg-white/80 rounded-xl p-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment Method</p>
                        <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5 capitalize">
                          {boostResult.paymentMethod === 'wallet' ? (
                            <><Wallet className="w-4 h-4 text-emerald-500" /> Wallet Balance</>
                          ) : (
                            <><CreditCard className="w-4 h-4 text-violet-500" /> Paystack</>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleViewAd}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl font-bold text-lg hover:from-violet-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                  aria-label="View your boosted ad"
                >
                  <ExternalLink className="w-5 h-5" />
                  View My Ad
                </button>
                <button
                  onClick={handleGoToDashboard}
                  className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  aria-label="Go to your ads dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go To Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
