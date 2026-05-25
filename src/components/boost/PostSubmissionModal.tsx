'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Check, X, Zap, Crown, Diamond, Loader2, ArrowRight,
  ExternalLink, LayoutDashboard, Sparkles, TrendingUp, Target,
  Clock, Shield, Star, ChevronRight, PartyPopper, RefreshCw,
  Eye, MapPin, Tag, ImageIcon, Wallet, CreditCard, ArrowLeft
} from 'lucide-react';
import { growthApi, paymentApi, walletApi } from '@/lib/api';
import { trackBoostEvent } from '@/lib/analytics';
import toast from 'react-hot-toast';

type ModalStep = 'initial' | 'packages' | 'payment_method' | 'processing' | 'success' | 'error';

interface BoostPackage {
  type: string;
  name: string;
  displayName: string;
  price: number;
  durationDays: number;
  priorityScore: number;
  badgeLabel: string;
  features: string[];
  colorScheme: {
    gradient: string;
    border: string;
    glow: string;
    text: string;
    bg: string;
    accent: string;
  };
}

interface PostSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: number;
  adSlug?: string;
  adTitle?: string;
  adImage?: string;
  adPrice?: string | number;
  adLocation?: string;
  adCategory?: string;
}

const PACKAGE_META: Record<string, { icon: typeof Zap; label: string; displayName: string; description: string }> = {
  silver: {
    icon: Zap,
    label: 'Basic Boost',
    displayName: 'Basic',
    description: 'Priority placement & increased visibility',
  },
  gold: {
    icon: Crown,
    label: 'Premium Boost',
    displayName: 'Premium',
    description: 'Higher search ranking & featured badge',
  },
  platinum: {
    icon: Diamond,
    label: 'Ultimate Boost',
    displayName: 'Ultimate',
    description: 'Maximum visibility & top ranking placement',
  },
};

const RECOMMENDED_PACKAGE = 'gold';

function getQueryParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

export default function PostSubmissionModal({
  isOpen,
  onClose,
  adId,
  adSlug,
  adTitle,
  adImage,
  adPrice,
  adLocation,
  adCategory,
}: PostSubmissionModalProps) {
  const router = useRouter();
  const prevStepRef = useRef<ModalStep | null>(null);
  const packageTrackedRef = useRef(false);

  const [step, setStep] = useState<ModalStep>('initial');
  const [packages, setPackages] = useState<BoostPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [boostResult, setBoostResult] = useState<{
    packageName?: string;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    reference?: string;
    price?: number;
  } | null>(null);

  const selectedPkg = packages.find(p => p.type === selectedPackage);

  const verifyPayment = useCallback(async (reference: string) => {
    setVerifying(true);
    try {
      const res = await paymentApi.verifyPayment(reference);
      const data = res.data;

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
  }, [adId, packages, selectedPackage]);

  // Track step changes
  useEffect(() => {
    if (!isOpen) return;
    if (prevStepRef.current === step) return;
    prevStepRef.current = step;

    switch (step) {
      case 'initial':
        trackBoostEvent('boost_offer_viewed', { ad_id: adId });
        break;
      case 'packages':
        packageTrackedRef.current = false;
        break;
    }
  }, [step, isOpen, adId]);

  // Fetch wallet balance when entering payment_method step
  useEffect(() => {
    if (step === 'payment_method' && walletBalance === null && !walletLoading) {
      setWalletLoading(true);
      walletApi.getBalance()
        .then(res => {
          const bal = res.data?.available_balance ?? res.data?.balance ?? null;
          setWalletBalance(bal);
        })
        .catch(() => {
          setWalletBalance(null);
        })
        .finally(() => setWalletLoading(false));
    }
  }, [step, walletBalance, walletLoading]);

  // Track ad_created on mount
  useEffect(() => {
    if (isOpen) {
      trackBoostEvent('ad_created', { ad_id: adId });
    }
  }, [isOpen, adId]);

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
  }, [isOpen, adId, verifyPayment]);

  useEffect(() => {
    if (isOpen) {
      setStep('initial');
      setSelectedPackage(null);
      setError(null);
      setBoostResult(null);
      packageTrackedRef.current = false;
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
      const res = await growthApi.getBoostPrices();
      const plans = res.data?.data?.plans || res.data?.plans || [];
      const normalized = plans.map((p: any) => ({
        type: p.type,
        name: p.name,
        displayName: p.displayName || p.name,
        price: p.price,
        durationDays: p.durationDays || p.duration_days,
        priorityScore: p.priorityScore || p.priority_score,
        badgeLabel: p.badgeLabel || p.badge_label,
        features: p.features || [],
        colorScheme: p.colorScheme || p.color_scheme || {
          gradient: 'from-violet-500 to-purple-600',
          border: 'border-violet-300',
          glow: 'shadow-violet-500/20',
          text: 'text-purple-900',
          bg: 'from-purple-50 to-violet-50',
          accent: '#8b5cf6',
        },
      }));
      setPackages(normalized);
    } catch {
      setPackages([
        {
          type: 'silver', name: 'Silver Boost', displayName: 'Basic Boost',
          price: 2000, durationDays: 3, priorityScore: 1000, badgeLabel: 'Boosted',
          features: ['Priority placement', 'Increased visibility', 'Above normal listings', 'Boosted badge'],
          colorScheme: { gradient: 'from-amber-400 via-yellow-300 to-amber-400', border: 'border-amber-300', glow: 'shadow-amber-400/20', text: 'text-amber-900', bg: 'from-amber-50 to-yellow-50', accent: '#f59e0b' },
        },
        {
          type: 'gold', name: 'Gold Featured', displayName: 'Premium Boost',
          price: 5000, durationDays: 7, priorityScore: 2000, badgeLabel: 'Featured',
          features: ['Higher search ranking', 'Featured badge', 'Homepage exposure', 'Priority category placement'],
          colorScheme: { gradient: 'from-slate-400 via-slate-300 to-slate-400', border: 'border-slate-300', glow: 'shadow-slate-400/20', text: 'text-slate-900', bg: 'from-slate-50 to-gray-50', accent: '#94a3b8' },
        },
        {
          type: 'platinum', name: 'Platinum VIP', displayName: 'Ultimate Boost',
          price: 10000, durationDays: 14, priorityScore: 3000, badgeLabel: 'VIP',
          features: ['Maximum visibility', 'Top ranking placement', 'Featured badge', 'Homepage exposure'],
          colorScheme: { gradient: 'from-violet-500 via-purple-400 to-violet-500', border: 'border-violet-300', glow: 'shadow-violet-500/20', text: 'text-purple-900', bg: 'from-purple-50 to-violet-50', accent: '#8b5cf6' },
        },
      ]);
    }
  };

  const handleSkip = () => {
    trackBoostEvent('boost_skipped', { ad_id: adId });
    onClose();
    if (adSlug) {
      router.push(`/ad/${adSlug}`);
    } else {
      router.push('/');
    }
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
    setStep('payment_method');
  };

  const handlePayWithWallet = async () => {
    if (!selectedPackage || !selectedPkg) return;
    setStep('processing');
    setLoading(true);
    setError(null);

    trackBoostEvent('payment_started', { ad_id: adId, package_type: selectedPackage, package_price: selectedPkg.price, payment_method: 'wallet' });

    try {
      const res = await growthApi.postSubmissionBoost(adId, {
        plan_type: selectedPackage,
        payment_method: 'wallet',
      });

      const data = res.data?.data || res.data;

      if (data?.boost_id) {
        setBoostResult({
          packageName: selectedPkg.displayName,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + selectedPkg.durationDays * 86400000).toISOString(),
          durationDays: selectedPkg.durationDays,
          reference: data.reference || data.boost_id,
          price: selectedPkg.price,
        });
        setStep('success');
        trackBoostEvent('payment_completed', { ad_id: adId, package_type: selectedPackage, duration_days: selectedPkg.durationDays });
        trackBoostEvent('boost_activated', { ad_id: adId, package_type: selectedPackage, duration_days: selectedPkg.durationDays });
        toast.success('Boost activated successfully via wallet!');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to process boost. Please try again.';
      setError(msg);
      setStep('error');
      trackBoostEvent('payment_failed', { ad_id: adId, package_type: selectedPackage, error: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithPaystack = async () => {
    if (!selectedPackage || !selectedPkg) return;
    setStep('processing');
    setLoading(true);
    setError(null);

    trackBoostEvent('payment_started', { ad_id: adId, package_type: selectedPackage, package_price: selectedPkg.price, payment_method: 'paystack' });

    try {
      const res = await growthApi.postSubmissionBoost(adId, {
        plan_type: selectedPackage,
        payment_method: 'paystack',
      });

      const data = res.data?.data || res.data;

      if (data?.authorization_url) {
        const ref = data.payment_intent || data.reference;
        localStorage.setItem('pending_boost_ref', ref);
        localStorage.setItem('pending_boost_ad_id', String(adId));
        localStorage.setItem('pending_boost_time', String(Date.now()));
        setBoostResult({
          packageName: selectedPkg.displayName,
          durationDays: selectedPkg.durationDays,
          reference: ref,
          price: selectedPkg.price,
        });
        window.location.href = data.authorization_url;
      } else if (data?.boost_id) {
        setBoostResult({
          packageName: selectedPkg.displayName,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + selectedPkg.durationDays * 86400000).toISOString(),
          durationDays: selectedPkg.durationDays,
          price: selectedPkg.price,
        });
        setStep('success');
        trackBoostEvent('payment_completed', { ad_id: adId, package_type: selectedPackage, duration_days: selectedPkg.durationDays });
        trackBoostEvent('boost_activated', { ad_id: adId, package_type: selectedPackage, duration_days: selectedPkg.durationDays });
        toast.success('Boost activated successfully!');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to process boost. Please try again.';
      setError(msg);
      setStep('error');
      trackBoostEvent('payment_failed', { ad_id: adId, package_type: selectedPackage, error: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAd = () => {
    onClose();
    if (adSlug) {
      router.push(`/ad/${adSlug}`);
    } else {
      router.push(`/dashboard/my-ads`);
    }
  };

  const handleGoToDashboard = () => {
    onClose();
    router.push('/dashboard/my-ads');
  };

  const handleClose = () => {
    if (step === 'initial') {
      trackBoostEvent('boost_skipped', { ad_id: adId });
      if (adSlug) {
        router.push(`/ad/${adSlug}`);
      } else {
        router.push('/');
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={step === 'initial' ? 'Ad posted successfully' : step === 'packages' ? 'Select boost package' : step === 'payment_method' ? 'Choose payment method' : step === 'success' ? 'Boost activated' : step === 'error' ? 'Error' : 'Processing'}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* STEP: Initial - Success Message with Mini Ad Preview */}
        {step === 'initial' && (
          <div className="p-8 md:p-10">
            {/* Success Header */}
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

            {/* Mini Ad Preview Card */}
            {(adTitle || adImage || adPrice || adLocation || adCategory) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="flex gap-4 p-4">
                  {adImage ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      {adImage.startsWith('blob:') ? (
                        <img
                          src={adImage}
                          alt={adTitle || 'Ad preview'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={adImage}
                            alt={adTitle || 'Ad preview'}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
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
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1.5">
                        {adTitle}
                      </h3>
                    )}
                    {adPrice && (
                      <p className="text-lg font-bold text-violet-600 mb-1.5">
                        {formatPrice(Number(adPrice))}
                      </p>
                    )}
                    <div className="space-y-1">
                      {adCategory && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Tag className="w-3.5 h-3.5" />
                          {adCategory}
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

            {/* Boost Value Section */}
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
                  <p className="text-xs text-gray-400 mt-0.5">Featured badge & badge</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
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

            {/* Trust */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Secure payment
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Instant activation
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" /> 24/7 support
              </span>
            </div>
          </div>
        )}

        {/* STEP: Packages - Boost Package Selection */}
        {step === 'packages' && (
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Boost Your Ad
              </h2>
              <p className="text-gray-500">
                Choose a package to get more visibility and sell faster
              </p>
              {adTitle && (
                <p className="text-sm text-gray-400 mt-1 truncate max-w-md mx-auto">
                  &ldquo;{adTitle}&rdquo;
                </p>
              )}
            </div>

            {/* Package Cards */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              role="radiogroup"
              aria-label="Boost package selection"
            >
              {packages.map((pkg, index) => {
                const isSelected = selectedPackage === pkg.type;
                const isRecommended = pkg.type === RECOMMENDED_PACKAGE;
                const pkgMeta = PACKAGE_META[pkg.type];
                const PkgIcon = pkgMeta?.icon || Zap;
                const cs = pkg.colorScheme;

                return (
                  <button
                    key={pkg.type}
                    onClick={() => handleSelectPackage(pkg.type)}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${pkgMeta?.label || pkg.displayName} - ${formatPrice(pkg.price)} - ${pkg.durationDays} days`}
                    className={`
                      relative flex flex-col items-center text-center px-5 py-6 rounded-2xl border-2 transition-all duration-200
                      ${isRecommended ? 'pt-8' : ''}
                      ${isSelected
                        ? `border-violet-400 bg-gradient-to-b from-violet-50 to-white shadow-lg shadow-violet-200/30 scale-[1.02]`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-[10px] font-bold rounded-full shadow-lg shadow-violet-300/50 whitespace-nowrap z-10">
                        <Star className="w-3 h-3 inline-block -mt-0.5 mr-1" />
                        Most Popular
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-10">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${cs.gradient} shadow-lg`}>
                      <PkgIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {pkgMeta?.label || pkg.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 leading-tight">
                      {pkgMeta?.description}
                    </p>
                    <div className="text-3xl font-extrabold text-gray-900 mb-2">
                      {formatPrice(pkg.price)}
                    </div>
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
                      <Clock className="w-3 h-3" />
                      {pkg.durationDays} day{pkg.durationDays > 1 ? 's' : ''}
                    </div>
                    <div className="w-full space-y-2 text-left border-t border-gray-100 pt-4">
                      {pkg.features.slice(0, 4).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={handleContinueToPayment}
                disabled={!selectedPackage || loading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl font-bold text-lg hover:from-violet-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                aria-label={selectedPackage ? `Continue to payment for ${formatPrice(selectedPkg?.price || 0)}` : 'Select a package first'}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <>
                    Continue To Payment
                    {selectedPackage && selectedPkg && (
                      <>
                        <span className="w-1 h-5 bg-white/30 mx-1" />
                        {formatPrice(selectedPkg.price)}
                      </>
                    )}
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

            {/* Trust note */}
            <p className="text-center text-xs text-gray-400 mt-4">
              <Shield className="w-3 h-3 inline-block mr-1" />
              Secured by Paystack &mdash; wallet also available
            </p>
          </div>
        )}

        {/* STEP: Payment Method Selection */}
        {step === 'payment_method' && selectedPkg && (
          <div className="p-8 md:p-10">
            {/* Back button */}
            <button
              onClick={() => { setStep('packages'); setError(null); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-lg"
              aria-label="Back to package selection"
            >
              <ArrowLeft className="w-4 h-4" />
              Change package
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Choose Payment Method
              </h2>
              <p className="text-gray-500">Select how you&apos;d like to pay for your boost</p>
            </div>

            {/* Selected Package Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${selectedPkg.colorScheme.gradient} shadow-sm`}>
                    {(() => {
                      const meta = PACKAGE_META[selectedPkg.type];
                      const Icon = meta?.icon || Zap;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{PACKAGE_META[selectedPkg.type]?.label || selectedPkg.displayName}</p>
                    <p className="text-sm text-gray-500">{selectedPkg.durationDays} day{selectedPkg.durationDays > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-gray-900">{formatPrice(selectedPkg.price)}</p>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4 mb-8">
              {/* Wallet Option */}
              <button
                onClick={handlePayWithWallet}
                disabled={walletLoading}
                className="w-full text-left p-5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white hover:border-emerald-300 hover:shadow-md transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60"
                aria-label="Pay with wallet balance"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Wallet Balance</p>
                      {walletLoading ? (
                        <p className="text-sm text-gray-400 flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" /> Loading balance...
                        </p>
                      ) : walletBalance !== null ? (
                        <p className="text-sm text-gray-500">
                          Balance: <span className="font-semibold text-gray-700">{formatPrice(walletBalance)}</span>
                          {walletBalance >= selectedPkg.price ? (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <Check className="w-3 h-3" /> Sufficient
                            </span>
                          ) : (
                            <span className="ml-2 text-xs text-red-500 font-medium">
                              Short by {formatPrice(selectedPkg.price - walletBalance)}
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">Unable to load balance</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${walletBalance !== null && walletBalance >= selectedPkg.price ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {walletBalance !== null && walletBalance >= selectedPkg.price ? 'Pay Now' : 'Insufficient'}
                    </div>
                  </div>
                </div>
              </button>

              {/* Paystack Option */}
              <button
                onClick={handlePayWithPaystack}
                className="w-full text-left p-5 rounded-2xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-white hover:border-violet-300 hover:shadow-md transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                aria-label="Pay with card or bank transfer via Paystack"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Card / Bank Transfer</p>
                      <p className="text-sm text-gray-500">Pay with debit card, USSD, or bank transfer</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-violet-600 text-white rounded-xl text-sm font-bold">
                    Pay {formatPrice(selectedPkg.price)}
                  </div>
                </div>
              </button>
            </div>

            {/* Skip */}
            <button
              onClick={handleSkip}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
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
          <div className="p-8 md:p-10 text-center" role="status" aria-label="Processing your boost">
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
                <Zap className="w-4 h-4 text-amber-500" />
                {PACKAGE_META[selectedPackage]?.label || selectedPackage}
                <span className="text-gray-300 mx-1">&bull;</span>
                {formatPrice(packages.find(p => p.type === selectedPackage)?.price || 0)}
              </div>
            )}
          </div>
        )}

        {/* STEP: Error */}
        {step === 'error' && (
          <div className="p-8 md:p-10 text-center" role="alert">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
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
          <div className="p-8 md:p-10">
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

            {/* Boost Details */}
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
                </div>
              </div>
            )}

            {/* Actions */}
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
  );
}
