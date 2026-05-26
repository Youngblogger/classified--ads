'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Building2, Users, Briefcase, Shield, Zap, BarChart3, Headphones, Globe, Star, Crown, CreditCard, Package, TrendingUp } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';

const BUSINESS_FEATURES = [
  {
    icon: Package,
    title: 'Unlimited Listings',
    description: 'Post as many ads as you need with no restrictions',
  },
  {
    icon: TrendingUp,
    title: 'Priority Visibility',
    description: 'Your ads always appear at the top of search results',
  },
  {
    icon: Shield,
    title: 'Verified Business Badge',
    description: 'Build trust with a professional verified badge',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track your ad performance with detailed insights',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'Get priority customer support from our team',
  },
  {
    icon: Globe,
    title: 'Multi-Location',
    description: 'Manage listings across multiple locations',
  },
];

const PLANS = [
  {
    name: 'Starter Business',
    price: '₦9,999',
    period: 'month',
    description: 'Perfect for small businesses getting started',
    features: [
      'Up to 50 active listings',
      'Verified business badge',
      'Priority visibility',
      'Basic analytics',
      'Email support',
    ],
    recommended: false,
  },
  {
    name: 'Professional',
    price: '₦24,999',
    period: 'month',
    description: 'For growing businesses with higher volume needs',
    features: [
      'Up to 200 active listings',
      'Verified business badge',
      'Top placement for all ads',
      'Advanced analytics',
      'Dedicated support',
      'API access',
      'Bulk upload tools',
    ],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: '₦99,999',
    period: 'month',
    description: 'For large businesses with high-volume needs',
    features: [
      'Unlimited listings',
      'Premium verified badge',
      'Exclusive homepage placement',
      'Custom analytics dashboard',
      '24/7 phone support',
      'Full API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
    recommended: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Adekunle Gold',
    role: 'Car Dealer',
    business: 'Gold Motors',
    avatar: 'AG',
    content: 'Since upgrading to a business account, my car sales have increased by 40%. The verified badge really helps build trust with buyers.',
    rating: 5,
  },
  {
    name: 'Chioma Eze',
    role: 'Real Estate Agent',
    business: 'Eze Properties',
    avatar: 'CE',
    content: 'The unlimited listings and priority visibility features are game-changers for my property listings. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Emmanuel Okonkwo',
    role: 'Electronics Seller',
    business: 'TechHub Nigeria',
    avatar: 'EO',
    content: 'Excellent platform for serious sellers. The analytics help me understand which products perform best.',
    rating: 5,
  },
];

export default function BusinessAccountsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      localStorage.setItem('authRedirect', '/business-accounts');
      sessionStorage.setItem('authRedirect', '/business-accounts');
      useUIStore.getState().toggleLoginModal();
      return;
    }
    router.push('/dashboard/settings?upgrade=business');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 pt-[48px] md:pt-[112px]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container-app relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full text-primary-400 text-sm mb-6">
                  <Building2 className="w-4 h-4" />
                  Business Accounts
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Grow Your Business<br />
                  <span className="text-primary-400">With Premium Tools</span>
                </h1>
                <p className="text-lg text-slate-300 mb-8">
                  Get the tools you need to manage your listings like a pro. From unlimited ads
                  to advanced analytics, everything your business needs to succeed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleGetStarted}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => router.push('/premium-plans')}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-600 text-white rounded-full font-semibold hover:bg-slate-800 transition-all duration-300"
                  >
                    View Pricing
                  </button>
                </div>

                <div className="flex items-center gap-8 mt-10 pt-8 border-t border-slate-700">
                  <div>
                    <div className="text-3xl font-bold text-white">5K+</div>
                    <div className="text-sm text-slate-400">Business Users</div>
                  </div>
                  <div className="w-px h-12 bg-slate-700" />
                  <div>
                    <div className="text-3xl font-bold text-white">100K+</div>
                    <div className="text-sm text-slate-400">Business Listings</div>
                  </div>
                  <div className="w-px h-12 bg-slate-700" />
                  <div>
                    <div className="text-3xl font-bold text-white">4.9/5</div>
                    <div className="text-sm text-slate-400">User Rating</div>
                  </div>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-3xl p-8 border border-primary-500/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">Professional Account</div>
                      <div className="text-primary-400 text-sm">Most Popular</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check className="w-5 h-5 text-primary-400" />
                      <span>200 Active Listings</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check className="w-5 h-5 text-primary-400" />
                      <span>Top Placement Priority</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check className="w-5 h-5 text-primary-400" />
                      <span>Advanced Analytics</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check className="w-5 h-5 text-primary-400" />
                      <span>Dedicated Support</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">₦24,999</span>
                      <span className="text-slate-400">/month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Everything You Need to <span className="text-primary-600">Succeed</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Our business accounts come packed with features designed to help you manage
                and grow your online presence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BUSINESS_FEATURES.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-6 bg-slate-50 rounded-2xl hover:bg-primary-50 transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-primary-100 group-hover:bg-primary-200 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                      <IconComponent className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-slate-50">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Choose Your <span className="text-primary-600">Business Plan</span>
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto mb-6">
                Select the plan that fits your business needs. Save more with annual billing.
              </p>

              <div className="inline-flex items-center gap-3 p-1 bg-slate-200 rounded-full">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    billingPeriod === 'yearly'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yearly <span className="text-green-600 ml-1">-20%</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {PLANS.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
                    plan.recommended
                      ? 'ring-2 ring-primary-500 shadow-xl scale-105'
                      : 'shadow-sm hover:shadow-lg'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-b-lg text-xs font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600">
                      Most Popular
                    </div>
                  )}

                  <div className="p-6 pt-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900">
                          {billingPeriod === 'yearly'
                            ? `₦${(parseInt(plan.price.replace(/[^0-9]/g, '')) * 12 * 0.8).toLocaleString()}`
                            : plan.price}
                        </span>
                        <span className="text-slate-500">/{billingPeriod === 'yearly' ? 'year' : plan.period}</span>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <div className="text-sm text-green-600 mt-1">
                          Save 20% with annual billing
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={handleGetStarted}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                        plan.recommended
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-slate-500">
                Need a custom solution?{' '}
                <button
                  onClick={() => router.push('/contact')}
                  className="text-primary-600 hover:underline font-medium"
                >
                  Contact our sales team
                </button>
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                How to <span className="text-primary-600">Get Started</span>
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Upgrade to a business account in just a few simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold text-xl">
                  1
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Sign Up</h3>
                <p className="text-sm text-slate-500">Create your free account or log in</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold text-xl">
                  2
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Choose Plan</h3>
                <p className="text-sm text-slate-500">Select the business plan that fits you</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold text-xl">
                  3
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Verify</h3>
                <p className="text-sm text-slate-500">Complete your business verification</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold text-xl">
                  4
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Start Selling</h3>
                <p className="text-sm text-slate-500">Enjoy your business features immediately</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-slate-50">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                What Our <span className="text-primary-600">Business Users</span> Say
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Join thousands of businesses already growing with our platform.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                      <div className="text-xs text-primary-600">{testimonial.business}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="container-app text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Take Your Business to the Next Level?
            </h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Join thousands of businesses already using our platform to grow their sales
              and reach more customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-all duration-300 shadow-lg"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
