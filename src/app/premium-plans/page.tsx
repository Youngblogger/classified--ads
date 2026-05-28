'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, Star, Zap, Crown, Shield, TrendingUp, Users, Gift, Loader2 } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { promotionsApi } from '@/lib/api';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';

interface Plan {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string;
  price: number;
  formatted_price: string;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

const COMPARISON_FEATURES = [
  { name: 'Featured Badge', featured: true, top: true, bump: false, premium: true },
  { name: 'Top Placement', featured: true, top: true, bump: false, premium: true },
  { name: 'Search Priority', featured: true, top: true, bump: false, premium: true },
  { name: 'Bump to Top', featured: false, top: false, bump: true, premium: true },
  { name: 'Duration', featured: '7 days', top: '14 days', bump: '1 day', premium: '30 days' },
  { name: 'Max Images', featured: '10', top: '15', bump: '5', premium: '20' },
  { name: 'Priority Support', featured: false, top: true, bump: false, premium: true },
  { name: 'Verified Badge', featured: false, top: false, bump: false, premium: true },
];

const FAQS = [
  {
    question: 'How long does it take for my ad to become featured?',
    answer: 'Your ad will become featured immediately after successful payment. You can see the changes reflected on your listing within a few minutes.',
  },
  {
    question: 'Can I cancel my promotion?',
    answer: 'Promotions are non-refundable once activated. However, you can always contact our support team if you have any issues.',
  },
  {
    question: 'Can I promote multiple ads at once?',
    answer: 'Yes! You can purchase promotions for as many ads as you like. Business account holders get special bulk pricing.',
  },
  {
    question: 'What happens when my promotion ends?',
    answer: 'Your ad will return to its normal placement. You can renew your promotion at any time to maintain visibility.',
  },
  {
    question: 'Do you offer custom enterprise solutions?',
    answer: 'Yes! We offer custom enterprise solutions for businesses with high-volume listing needs. Contact our sales team for more information.',
  },
];

export default function PremiumPlansPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fetchPlans = async () => {
    try {
      const response = await promotionsApi.getPlans();
      const plansData = (response.data as any)?.data || (response.data as any)?.plans || [];
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
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const getGradient = (type: string) => {
    switch (type) {
      case 'featured':
        return 'from-amber-500 to-orange-600';
      case 'top':
        return 'from-blue-500 to-cyan-600';
      case 'bump':
        return 'from-purple-500 to-pink-600';
      case 'premium':
        return 'from-yellow-500 via-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'featured':
        return <Star className="w-8 h-8" />;
      case 'top':
        return <TrendingUp className="w-8 h-8" />;
      case 'bump':
        return <Zap className="w-8 h-8" />;
      case 'premium':
        return <Crown className="w-8 h-8" />;
      default:
        return <Star className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 pt-[48px] md:pt-[112px]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container-app relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm mb-6">
              <Crown className="w-4 h-4" />
              Premium Plans
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Get Premium Features &amp;<br />
              <span className="text-amber-200">Stand Out</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Choose from our range of premium plans designed to help you sell faster
              and reach more buyers. All plans include instant activation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => { if (isAuthenticated) { router.push('/promote-ad'); } else { localStorage.setItem('authRedirect', '/premium-plans'); sessionStorage.setItem('authRedirect', '/premium-plans'); useUIStore.getState().toggleLoginModal(); } }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-full font-semibold hover:bg-amber-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Plans
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/business-accounts')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-700 text-white rounded-full font-semibold hover:bg-orange-800 transition-all duration-300 shadow-lg"
              >
                Business Accounts
              </button>
            </div>
          </div>
        </section>

        {/* Plans Comparison */}
        <section className="py-16 bg-white">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Compare <span className="text-orange-600">Premium Plans</span>
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Find the perfect plan for your needs. All plans include premium support.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900 bg-slate-50 rounded-tl-xl">
                        Feature
                      </th>
                      {plans.map((plan) => (
                        <th
                          key={plan.id}
                          className={`p-4 text-center ${
                            plan.type === 'premium' ? 'bg-gradient-to-b from-orange-100 to-amber-50' : 'bg-slate-50'
                          } ${plan === plans[plans.length - 1] ? 'rounded-tr-xl' : ''}`}
                        >
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${getGradient(plan.type)} flex items-center justify-center text-white mx-auto mb-3`}>
                            {getIcon(plan.type)}
                          </div>
                          <div className="font-bold text-slate-900">{plan.name}</div>
                          <div className="text-sm text-slate-500">{plan.duration_days} days</div>
                          <div className="text-lg font-bold text-slate-900 mt-2">{plan.formatted_price}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FEATURES.map((feature, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-4 text-slate-700">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.featured === 'boolean' ? (
                            feature.featured ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )
                          ) : (
                            <span className="text-slate-600">{feature.featured}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.top === 'boolean' ? (
                            feature.top ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )
                          ) : (
                            <span className="text-slate-600">{feature.top}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.bump === 'boolean' ? (
                            feature.bump ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )
                          ) : (
                            <span className="text-slate-600">{feature.bump}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.premium === 'boolean' ? (
                            feature.premium ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )
                          ) : (
                            <span className="text-slate-600">{feature.premium}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="p-4 bg-white rounded-bl-xl"></td>
                      {plans.map((plan, index) => (
                        <td key={plan.id} className={`p-4 text-center ${index === 0 ? 'bg-white' : index === plans.length - 1 ? 'rounded-br-xl bg-slate-50' : 'bg-slate-50'}`}>
                          <button
                            onClick={() => { if (isAuthenticated) { router.push(`/promote-ad?plan=${plan.id}`); } else { localStorage.setItem('authRedirect', '/premium-plans'); sessionStorage.setItem('authRedirect', '/premium-plans'); useUIStore.getState().toggleLoginModal(); } }}
                            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                              plan.type === 'premium'
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg'
                                : 'bg-orange-600 text-white hover:bg-orange-700'
                            }`}
                          >
                            Choose
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* All Plans Grid */}
        <section className="py-16 bg-slate-50">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                All <span className="text-orange-600">Plans</span> Overview
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Every plan is designed to help you sell faster. Choose the one that fits your needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {plan.type === 'premium' && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-b-lg text-xs font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500">
                      Most Popular
                    </div>
                  )}

                  <div className="p-6 pt-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getGradient(plan.type)} flex items-center justify-center text-white mb-6`}>
                      {getIcon(plan.type)}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-slate-900">{plan.formatted_price}</span>
                      <span className="text-slate-500"> / {plan.duration_days} days</span>
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {plan.features.slice(0, 5).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 5 && (
                          <li className="text-sm text-slate-400">+{plan.features.length - 5} more</li>
                        )}
                      </ul>
                    )}

                    <button
                      onClick={() => { if (isAuthenticated) { router.push(`/promote-ad?plan=${plan.id}`); } else { localStorage.setItem('authRedirect', '/premium-plans'); sessionStorage.setItem('authRedirect', '/premium-plans'); useUIStore.getState().toggleLoginModal(); } }}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                        plan.type === 'premium'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container-app max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Frequently Asked <span className="text-orange-600">Questions</span>
              </h2>
              <p className="text-slate-500">
                Everything you need to know about our premium plans.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-900">{faq.question}</span>
                    <span className={`text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="p-4 bg-slate-50 border-t border-gray-100">
                      <p className="text-slate-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
          <div className="container-app text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm mb-6">
              <Gift className="w-4 h-4" />
              Special Offer
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Get 20% Off Your First Promotion!
            </h2>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              Use code <span className="font-bold">PROMO20</span> at checkout to get 20% off any promotion plan.
            </p>
            <button
              onClick={() => { if (isAuthenticated) { router.push('/promote-ad'); } else { localStorage.setItem('authRedirect', '/premium-plans'); sessionStorage.setItem('authRedirect', '/premium-plans'); useUIStore.getState().toggleLoginModal(); } }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-full font-semibold hover:bg-amber-50 transition-all duration-300 shadow-lg"
            >
              Claim Your Discount
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
