'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import { Check, X, CreditCard, Building2, Smartphone, Lock, ArrowLeft, Loader2, AlertCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

type Plan = 'basic' | 'professional' | 'enterprise';
type BillingCycle = 'monthly' | 'yearly';

const plans: Record<Plan, {
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
    features: [
      'Up to 10 active ads',
      'Basic ad visibility',
      'Email support',
      'Standard listing duration',
    ],
    excluded: [
      'Featured listings',
      'Priority support',
      'Analytics dashboard',
    ],
    color: 'slate',
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 5000,
    yearlyPrice: 50000,
    popular: true,
    features: [
      'Up to 50 active ads',
      '2x ad visibility boost',
      '5 featured listings/month',
      'Priority email support',
      'Analytics dashboard',
    ],
    excluded: [],
    color: 'amber',
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 15000,
    yearlyPrice: 150000,
    features: [
      'Unlimited active ads',
      '5x ad visibility boost',
      'Unlimited featured ads',
      '24/7 phone support',
      'Custom analytics',
      'API access',
    ],
    excluded: [],
    color: 'emerald',
  },
};

type PaymentMethod = 'card' | 'bank' | 'ussd';

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('professional');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan');

  const currentPlan = plans[selectedPlan];
  const price = billingCycle === 'monthly' ? currentPlan.monthlyPrice : currentPlan.yearlyPrice;
  const savings = billingCycle === 'yearly' 
    ? (currentPlan.monthlyPrice * 12) - currentPlan.yearlyPrice 
    : 0;

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amt);
  };

  const handleSubscribe = async () => {
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('success');
      toast.success('Subscription successful!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container-app max-w-5xl">
          {step === 'success' ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Subscription Activated!
              </h1>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Your {currentPlan.name} subscription is now active. Enjoy all the premium features!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/post-ad"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all"
                >
                  Start Posting Ads
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-all"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">
                  Choose Your Plan
                </h1>
                <p className="text-slate-600 mt-2">
                  Unlock premium features and grow your business faster
                </p>
              </div>

              {/* Plan Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                      billingCycle === 'yearly'
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Yearly
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                      Save 17%
                    </span>
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {(Object.entries(plans) as [Plan, typeof plans.basic][]).map(([key, plan]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPlan(key)}
                      className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
                        selectedPlan === key
                          ? plan.popular
                            ? 'border-amber-500 bg-amber-50/50'
                            : `border-primary-500 bg-primary-50/50`
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                          POPULAR
                        </span>
                      )}
                      
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {plan.name}
                      </h3>
                      
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-slate-900">
                          {formatAmount(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                        </span>
                        <span className="text-slate-500">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>

                      {billingCycle === 'yearly' && (
                        <p className="text-sm text-emerald-600 mb-4">
                          Save {formatAmount(savings)} per year
                        </p>
                      )}

                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <Check className={`w-4 h-4 ${plan.color === 'amber' ? 'text-amber-500' : 'text-emerald-500'}`} />
                            {feature}
                          </li>
                        ))}
                        {plan.excluded.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                            <X className="w-4 h-4" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className={`w-full py-2 px-4 rounded-xl text-center font-medium ${
                        selectedPlan === key
                          ? plan.popular
                            ? 'bg-amber-500 text-white'
                            : 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {selectedPlan === key ? 'Selected' : 'Select Plan'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  Select Payment Method
                </h2>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className="font-medium text-slate-900">Card</p>
                    <p className="text-sm text-slate-500">Visa, Mastercard</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'bank' ? 'text-green-500' : 'text-slate-400'}`} />
                    <p className="font-medium text-slate-900">Bank Transfer</p>
                    <p className="text-sm text-slate-500">Virtual Account</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('ussd')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'ussd'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'ussd' ? 'text-purple-500' : 'text-slate-400'}`} />
                    <p className="font-medium text-slate-900">USSD</p>
                    <p className="text-sm text-slate-500">Dial *code#</p>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      You will be redirected to enter your card details securely
                    </p>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-green-700">
                      A virtual account number will be generated for you to transfer to
                    </p>
                  </div>
                )}

                {paymentMethod === 'ussd' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-purple-700">
                      You will receive a USSD code to dial on your phone
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="border-t border-slate-200 pt-6 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600">{currentPlan.name} Plan ({billingCycle})</span>
                    <span className="font-medium text-slate-900">{formatAmount(price)}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="flex items-center justify-between mb-2 text-emerald-600">
                      <span>Yearly Savings</span>
                      <span>-{formatAmount(savings)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-primary-600">{formatAmount(price)}</span>
                  </div>
                </div>

                {/* Payment Logos */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <svg viewBox="0 0 50 30" className="h-5">
                      <rect width="50" height="30" rx="4" fill="#1A1F71"/>
                      <text x="25" y="20" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial" textAnchor="middle">VISA</text>
                    </svg>
                  </div>
                  <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <svg viewBox="0 0 40 30" className="h-5">
                      <circle cx="15" cy="15" r="12" fill="#EB001B"/>
                      <circle cx="25" cy="15" r="12" fill="#F79E1B"/>
                      <path d="M20 7a12 12 0 000 16 12 12 0 000-16z" fill="#FF5F00"/>
                    </svg>
                  </div>
                  <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-700" />
                  </div>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={processing}
                  className="w-full py-4 px-6 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay {formatAmount(price)}
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500 mt-4 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Secured by iList.ng
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
