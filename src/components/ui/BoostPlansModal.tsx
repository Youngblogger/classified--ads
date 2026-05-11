'use client';

import { useState, useEffect } from 'react';
import { X, Check, Loader2, ArrowRight, Clock, RotateCcw, Sparkles, Wallet, CreditCard, Star } from 'lucide-react';
import { getAuthToken } from '@/lib/cookies';
import { recommendBoostPlan, BOOST_IMPACT } from '@/lib/boost-config';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface BoostPlan {
  id: number;
  name: string;
  type: string;
  price: number;
  duration_days: number;
  priority_score: number;
  badge_label: string;
  badge_icon: string;
  color_scheme: Record<string, any> | null;
  features: string[] | null;
  is_active: boolean;
  sort_order: number;
}

interface BoostPlansModalProps {
  adId: number;
  adTitle: string;
  isOpen: boolean;
  onClose: () => void;
  adCategory?: string | { name?: string; slug?: string } | null;
  adPrice?: number | string | null;
}

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
    bg: 'from-blue-50 to-sky-50',
    border: 'border-blue-300',
    badge: 'from-blue-500 via-blue-400 to-cyan-400',
    btn: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
    shadow: 'shadow-blue-500/20',
  },
};

const PLAN_TO_TIER: Record<string, string> = {
  silver: 'gold',
  gold: 'platinum',
  platinum: 'diamond',
};

const TIER_DISPLAY_NAMES: Record<string, string> = {
  silver: 'Gold',
  gold: 'Platinum',
  platinum: 'Diamond',
};

const TIER_EMOJI: Record<string, string> = {
  silver: '👑',
  gold: '⚜️',
  platinum: '💎',
};

export default function BoostPlansModal({ adId, adTitle, isOpen, onClose, adCategory, adPrice }: BoostPlansModalProps) {
  const [plans, setPlans] = useState<BoostPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [step, setStep] = useState<'select' | 'processing'>('select');
  const [boostStatus, setBoostStatus] = useState<{ has_active_boost: boolean; active_boost?: any; can_renew: boolean; renewal_info?: any } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/ads/boost-plans`);
        const data = await res.json();
        if (data.data) {
          setPlans(data.data);
          if (data.data.length > 0) {
            setSelectedPlan(data.data[0].type);
          }
        }
      } catch {
        setPlans([
          { id: 0, name: 'Gold Boost', type: 'silver', price: 2000, duration_days: 3, priority_score: 1000, badge_label: 'Gold', badge_icon: 'crown', color_scheme: null, features: ['Appears above normal listings', 'Highlighted ad card', 'Better search ranking', 'Gold badge', 'Increased impressions'], is_active: true, sort_order: 1 },
          { id: 0, name: 'Platinum Boost', type: 'gold', price: 5000, duration_days: 7, priority_score: 2000, badge_label: 'Platinum', badge_icon: 'diamond', color_scheme: null, features: ['Homepage exposure', 'Priority category placement', 'Higher search visibility', 'Platinum badge', 'More impressions than Gold'], is_active: true, sort_order: 2 },
          { id: 0, name: 'Diamond VIP', type: 'platinum', price: 10000, duration_days: 14, priority_score: 3000, badge_label: 'Diamond', badge_icon: 'sparkles', color_scheme: null, features: ['Top homepage placement', 'Always pinned above lower tiers', 'Highest search priority', 'Diamond animated badge', 'Priority in recommended ads', 'Increased click visibility', 'Extra premium styling'], is_active: true, sort_order: 3 },
        ]);
        setSelectedPlan('silver');
      }
    };

    const fetchStatus = async () => {
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

    const fetchBalance = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const res = await fetch(`${API_URL}/wallet/balance`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const raw = data.available_balance ?? data.data?.available_balance ?? data.balance ?? data.data?.balance;
          setWalletBalance(raw !== null && raw !== undefined ? Number(raw) : null);
        }
      } catch {}
    };

    if (isOpen) {
      setStep('select');
      setSelectedPlan(null);
      setBoostStatus(null);
      setWalletBalance(null);
      setPaymentMethod(null);
      setFetching(true);
      Promise.all([fetchPlans(), fetchStatus(), fetchBalance()]).finally(() => setFetching(false));
    }
  }, [isOpen, adId]);

  const selected = plans.find(p => p.type === selectedPlan);
  const tierKey = selectedPlan ? (PLAN_TO_TIER[selectedPlan] || 'gold') : 'gold';
  const colors = TIER_COLORS[tierKey] || TIER_COLORS.gold;

  const hasSufficientBalance = walletBalance !== null && selected && walletBalance >= selected.price;

  const handleWalletBoost = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to boost your ad');
      return;
    }
    if (!selectedPlan) {
      toast.error('Please select a boost plan');
      return;
    }
    if (!hasSufficientBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setPaymentMethod('wallet');
    setStep('processing');
    setLoading(true);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

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
          plan_type: selectedPlan,
          payment_method: 'wallet',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed (${res.status})`);
      }

      toast.success('Boost activated successfully via wallet!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process boost');
      console.error('Wallet boost error:', error);
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackBoost = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to boost your ad');
      return;
    }
    if (!selectedPlan) {
      toast.error('Please select a boost plan');
      return;
    }

    setPaymentMethod('paystack');
    setStep('processing');
    setLoading(true);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

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
          plan_type: selectedPlan,
          payment_method: 'paystack',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed (${res.status})`);
      }

      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process boost');
      console.error('Paystack boost error:', error);
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (method: 'wallet' | 'paystack' = 'paystack') => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to renew your boost');
      return;
    }
    if (!selectedPlan) {
      toast.error('Please select a boost plan');
      return;
    }

    setPaymentMethod(method);
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
          plan_type: selectedPlan,
          payment_method: method,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed (${res.status})`);
      }

      if (method === 'wallet') {
        toast.success('Boost renewed successfully via wallet!');
        onClose();
      } else if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process renewal');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center z-[99999] p-0 sm:p-4 pt-[5vh] sm:pt-0"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h2 className="text-lg font-bold text-gray-900">Boost Your Ad</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {step === 'select' && (
          <>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              {/* Ad title */}
              <p className="text-sm text-gray-600 mb-4 truncate">
                Boosting: <span className="font-semibold text-gray-900">{adTitle}</span>
              </p>

              {/* Wallet Balance Banner */}
              {walletBalance !== null && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-emerald-900">Wallet Balance</span>
                    <span className="text-emerald-700 ml-2">₦{walletBalance.toLocaleString()}</span>
                  </div>
                </div>
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

              {fetching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                </div>
              ) : (
                <>
                  {/* Recommended plan notice */}
                  {adCategory && (() => {
                    const recommended = recommendBoostPlan({ category: adCategory, price: adPrice });
                    const tierKey = PLAN_TO_TIER[Object.entries({ silver: 'silver', gold: 'gold', platinum: 'platinum' }).find(([, v]) => PLAN_TO_TIER[v] === recommended)?.[0] || 'silver'] || 'gold';
                    const rColors = TIER_COLORS[tierKey] || TIER_COLORS.gold;
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    {plans.map((plan) => {
                      const isSelected = selectedPlan === plan.type;
                      const planTierKey = PLAN_TO_TIER[plan.type] || 'gold';
                      const c = TIER_COLORS[planTierKey] || TIER_COLORS.gold;
                      const recommendedKey = adCategory ? recommendBoostPlan({ category: adCategory, price: adPrice }) : null;
                      const isRecommended = !!recommendedKey && PLAN_TO_TIER[plan.type] === recommendedKey;
                      const impactInfo = BOOST_IMPACT[recommendedKey];
                      return (
                        <button
                          key={plan.type}
                          onClick={() => setSelectedPlan(plan.type)}
                          className={`
                            relative flex flex-col items-center text-center px-4 py-5 rounded-2xl border-2 transition-all duration-200
                            ${isRecommended && !isSelected ? 'ring-2 ring-amber-400' : ''}
                            ${isSelected
                              ? `${c.border} bg-gradient-to-b ${c.bg} ${c.shadow} shadow-lg scale-[1.02]`
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }
                          `}
                        >
                          {isSelected && (
                            <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          {isRecommended && !isSelected && (
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                              ★ Best Match
                            </div>
                          )}
                          <span className="text-3xl mb-3 leading-none">{TIER_EMOJI[plan.type] || '👑'}</span>
                          <h3 className="text-base font-bold text-gray-900 mb-1">{TIER_DISPLAY_NAMES[plan.type] || plan.name}</h3>
                          <div className="text-2xl font-extrabold text-gray-900 mb-1">
                            ₦{Number(plan.price).toLocaleString()}
                          </div>
                          <div className="text-xs font-medium text-gray-500 mb-1">
                            {plan.duration_days} day{plan.duration_days > 1 ? 's' : ''}
                          </div>
                          {/* Impact preview */}
                          {impactInfo && (
                            <div className={`text-xs font-semibold mb-3 px-2 py-1 rounded-full ${isRecommended ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                              {impactInfo.views}
                            </div>
                          )}
                          <div className="w-full space-y-1.5 text-left">
                            {(plan.features || []).map((feature, i) => (
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
                </>
              )}
            </div>

            {/* Footer with payment options */}
            {!fetching && selected && (
              <div className="px-5 py-4 border-t border-gray-200 flex flex-col gap-3 flex-shrink-0 bg-white">
                {walletBalance !== null && hasSufficientBalance && (
                  <button
                    onClick={boostStatus?.can_renew ? () => handleRenew('wallet') : handleWalletBoost}
                    disabled={loading}
                    className="w-full px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Wallet className="w-4 h-4" />
                    {boostStatus?.can_renew ? 'Renew' : 'Boost'} using Wallet — ₦{Number(selected.price).toLocaleString()}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {walletBalance !== null && !hasSufficientBalance && (
                  <div className="text-xs text-red-500 text-center -mb-2">
                    Insufficient wallet balance. Please fund your wallet or use Paystack.
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={boostStatus?.can_renew ? () => handleRenew('paystack') : handlePaystackBoost}
                    disabled={loading}
                    className={`
                      flex-1 px-5 py-3 text-white rounded-xl font-semibold transition-all text-sm
                      flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                      bg-gradient-to-r ${colors.btn} shadow-lg ${colors.shadow}
                    `}
                  >
                    {boostStatus?.can_renew ? (
                      <><RotateCcw className="w-4 h-4" /> Renew with Paystack</>
                    ) : (
                      <><CreditCard className="w-4 h-4" /> Pay with Paystack</>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-16 px-5">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {paymentMethod === 'wallet' ? 'Activating boost' : (boostStatus?.can_renew ? 'Processing renewal' : 'Processing boost')}
            </h3>
            <p className="text-sm text-gray-500 text-center">
              {paymentMethod === 'wallet' ? 'Please wait...' : 'Redirecting to secure payment...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}