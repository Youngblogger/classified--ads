'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Check, X, CreditCard, Building2, Smartphone, Lock, Loader2, Star } from 'lucide-react';

type SubscriptionPlan = 'basic' | 'professional' | 'enterprise';
type BillingCycle = 'monthly' | 'yearly';

const subscriptionPlans: Record<SubscriptionPlan, {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  excluded: string[];
  color: string;
}> = {
  basic: {
    name: 'Basic',
    monthlyPrice: 2500,
    yearlyPrice: 25000,
    features: ['Up to 10 active ads', 'Basic ad visibility', 'Email support', 'Standard listing duration'],
    excluded: ['Featured listings', 'Priority support', 'Analytics dashboard'],
    color: 'slate',
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 5000,
    yearlyPrice: 50000,
    popular: true,
    features: ['Up to 50 active ads', '2x ad visibility boost', '5 featured listings/month', 'Priority email support', 'Analytics dashboard'],
    excluded: [],
    color: 'amber',
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 15000,
    yearlyPrice: 150000,
    features: ['Unlimited active ads', '5x ad visibility boost', 'Unlimited featured ads', '24/7 phone support', 'Custom analytics'],
    excluded: [],
    color: 'emerald',
  },
};

interface PromotionPlan {
  id: number;
  name: string;
  type: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
}

interface Promotion {
  id: number;
  type: string;
  price: string;
  duration_days: number;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  ad: {
    id: number;
    title: string;
    slug: string;
  };
}

interface Ad {
  id: number;
  title: string;
  slug: string;
  status: string;
}

export default function PromotionsPage() {
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [myPromotions, setMyPromotions] = useState<Promotion[]>([]);
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscription' | 'plans' | 'my-promotions'>('subscription');
  const [buyingPlan, setBuyingPlan] = useState<number | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionPlan>('professional');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [subscriptionPaymentMethod, setSubscriptionPaymentMethod] = useState<'card' | 'bank' | 'ussd'>('card');
  const [processingSubscription, setProcessingSubscription] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-promotions') {
      fetchMyData();
    }
  }, [activeTab]);

  const fetchPlans = async () => {
    const timeoutId = setTimeout(() => {
      console.log('Plans fetch timeout - forcing plansLoaded to true');
      setPlansLoaded(true);
    }, 10000);
    
    try {
      const res = await api.get('/promotions/plans');
      clearTimeout(timeoutId);
      const plansData = Array.isArray(res.data?.plans) ? res.data.plans : (res.data?.data || []);
      setPlans(plansData.map((plan: any) => {
        let features: string[] = [];
        if (Array.isArray(plan.features)) {
          features = plan.features;
        } else if (typeof plan.features === 'string' && plan.features) {
          try {
            features = JSON.parse(plan.features);
          } catch (e) {
            features = [];
          }
        }
        return { ...plan, features };
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch plans:', error);
    } finally {
      clearTimeout(timeoutId);
      setPlansLoaded(true);
    }
  };

  const fetchMyData = async () => {
    try {
      const [promoRes, adsRes] = await Promise.all([
        api.get('/promotions/my-promotions'),
        api.get('/ads?status=active'),
      ]);
      setMyPromotions(Array.isArray(promoRes.data) ? promoRes.data : (promoRes.data?.data || []));
      setMyAds(Array.isArray(adsRes.data) ? adsRes.data : (adsRes.data?.data || adsRes.data?.data?.data || []));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMyPromotions([]);
      setMyAds([]);
    }
  };

  const handleBuy = async (planId: number, adId: number) => {
    try {
      await api.post('/promotions/buy', { plan_id: planId, ad_id: adId });
      toast.success('Promotion activated successfully!');
      setBuyingPlan(null);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to purchase promotion';
      toast.error(message);
      if (error.response?.data?.required) {
        window.location.href = '/dashboard/wallet';
      }
    }
  };

  const handleSubscribe = async () => {
    setProcessingSubscription(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Subscription successful!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handleCancel = async (promotionId: number) => {
    if (!confirm('Are you sure you want to cancel this promotion?')) return;
    
    try {
      await api.post('/promotions/cancel', { promotion_id: promotionId });
      toast.success('Promotion cancelled');
      fetchMyData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel promotion');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'featured': return '⭐';
      case 'top': return '🔥';
      case 'premium': return '💎';
      default: return '✨';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'featured': return 'from-yellow-400 to-yellow-600';
      case 'top': return 'from-red-400 to-red-600';
      case 'premium': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const currentSubscriptionPlan = subscriptionPlans[selectedSubscription];
  const subscriptionPrice = billingCycle === 'monthly' ? currentSubscriptionPlan.monthlyPrice : currentSubscriptionPlan.yearlyPrice;
  const subscriptionSavings = billingCycle === 'yearly' ? (currentSubscriptionPlan.monthlyPrice * 12) - currentSubscriptionPlan.yearlyPrice : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Promote Your Ads</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscription'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Premium Plans
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ad Promotions
          </button>
          <button
            onClick={() => setActiveTab('my-promotions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-promotions'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Promotions ({myPromotions.length})
          </button>
        </nav>
      </div>

      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Premium Subscription Plans</h2>
              <p className="text-slate-400">Unlock premium features and grow your business faster</p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                  Save 17%
                </span>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {(Object.entries(subscriptionPlans) as [SubscriptionPlan, typeof subscriptionPlans.basic][]).map(([key, plan]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSubscription(key)}
                  className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
                    selectedSubscription === key
                      ? plan.popular
                        ? 'border-amber-500 bg-amber-500/20'
                        : 'border-primary-500 bg-primary-500/20'
                      : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                      POPULAR
                    </span>
                  )}
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">
                      {formatPrice(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                    </span>
                    <span className="text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>

                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-emerald-400 mb-4">Save {formatPrice(subscriptionSavings)}/year</p>
                  )}

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className={`w-4 h-4 ${plan.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`} />
                        {feature}
                      </li>
                    ))}
                    {plan.excluded.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                        <X className="w-4 h-4" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className={`w-full py-2 px-4 rounded-xl text-center font-medium ${
                    selectedSubscription === key
                      ? plan.popular
                        ? 'bg-amber-500 text-white'
                        : 'bg-primary-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {selectedSubscription === key ? 'Selected' : 'Select'}
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
              
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <button
                  onClick={() => setSubscriptionPaymentMethod('card')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    subscriptionPaymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 mx-auto mb-1 ${subscriptionPaymentMethod === 'card' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-xs font-medium text-gray-900">Card</p>
                </button>

                <button
                  onClick={() => setSubscriptionPaymentMethod('bank')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    subscriptionPaymentMethod === 'bank'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 className={`w-5 h-5 mx-auto mb-1 ${subscriptionPaymentMethod === 'bank' ? 'text-green-500' : 'text-gray-400'}`} />
                  <p className="text-xs font-medium text-gray-900">Bank Transfer</p>
                </button>

                <button
                  onClick={() => setSubscriptionPaymentMethod('ussd')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    subscriptionPaymentMethod === 'ussd'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className={`w-5 h-5 mx-auto mb-1 ${subscriptionPaymentMethod === 'ussd' ? 'text-purple-500' : 'text-gray-400'}`} />
                  <p className="text-xs font-medium text-gray-900">USSD</p>
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-4">
                <span className="font-semibold text-gray-900">{currentSubscriptionPlan.name} ({billingCycle})</span>
                <span className="text-2xl font-bold text-primary-600">{formatPrice(subscriptionPrice)}</span>
              </div>

              {/* Payment Logos */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-7 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
                  <svg viewBox="0 0 50 30" className="h-4">
                    <rect width="50" height="30" rx="4" fill="#1A1F71"/>
                    <text x="25" y="20" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial" textAnchor="middle">VISA</text>
                  </svg>
                </div>
                <div className="h-7 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
                  <svg viewBox="0 0 40 30" className="h-4">
                    <circle cx="15" cy="15" r="12" fill="#EB001B"/>
                    <circle cx="25" cy="15" r="12" fill="#F79E1B"/>
                    <path d="M20 7a12 12 0 000 16 12 12 0 000-16z" fill="#FF5F00"/>
                  </svg>
                </div>
                <div className="h-7 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-slate-700" />
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={processingSubscription}
                className="w-full py-3 px-6 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {processingSubscription ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Subscribe - {formatPrice(subscriptionPrice)}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Secured by iList.ng
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          {!plansLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No promotion plans available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-gradient-to-br ${getTypeColor(plan.type)} rounded-2xl p-6 text-white`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">{getTypeIcon(plan.type)}</span>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                    <span className="text-white/80"> / {plan.duration_days} days</span>
                  </div>

                  <p className="text-white/80 text-sm mb-4">{plan.description}</p>

                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-white/80">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  {buyingPlan === plan.id ? (
                    <AdSelector 
                      planId={plan.id} 
                      onSelect={handleBuy} 
                      onCancel={() => setBuyingPlan(null)} 
                    />
                  ) : (
                    <button
                      onClick={() => setBuyingPlan(plan.id)}
                      className="w-full py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100"
                    >
                      Promote Ad
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-promotions' && (
        <div className="space-y-4">
          {myPromotions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">You don&apos;t have any active promotions.</p>
              <button
                onClick={() => setActiveTab('plans')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Browse Plans
              </button>
            </div>
          ) : (
            myPromotions.map((promotion) => (
              <div key={promotion.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(promotion.type)} flex items-center justify-center text-2xl`}>
                      {getTypeIcon(promotion.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">{promotion.type} Promotion</h3>
                      <Link
                        href={`/ad/${promotion.ad.slug}`}
                        className="text-primary-600 hover:underline"
                      >
                        {promotion.ad.title}
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Started: {formatDate(promotion.started_at)}</span>
                        <span>Expires: {formatDate(promotion.expires_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      promotion.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {promotion.is_active ? 'Active' : 'Expired'}
                    </span>
                    {promotion.is_active && (
                      <button
                        onClick={() => handleCancel(promotion.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AdSelector({ planId, onSelect, onCancel }: { planId: number, onSelect: (planId: number, adId: number) => void, onCancel: () => void }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ads?status=active').then(res => {
      setAds(Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.data?.data || []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm">Loading ads...</div>;
  }

  if (ads.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm">No active ads. Post an ad first!</p>
        <Link href="/dashboard/post-ad" className="block w-full py-2 bg-white/20 rounded-lg text-sm text-center hover:bg-white/30">
          Post an Ad
        </Link>
        <button onClick={onCancel} className="w-full py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <select
        onChange={(e) => {
          if (e.target.value) {
            onSelect(planId, parseInt(e.target.value));
          }
        }}
        className="w-full px-3 py-2 rounded-lg text-gray-900"
        defaultValue=""
      >
        <option value="">Select an ad...</option>
        {ads.map((ad) => (
          <option key={ad.id} value={ad.id}>
            {ad.title}
          </option>
        ))}
      </select>
      <button onClick={onCancel} className="w-full py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30">
        Cancel
      </button>
    </div>
  );
}
