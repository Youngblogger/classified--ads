'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, Star, Zap, Shield, TrendingUp, Users, Clock, Check, Crown } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { promotionsApi } from '@/lib/api';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
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

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Increase Visibility',
    description: 'Get your ads seen by 5x more buyers',
  },
  {
    icon: Clock,
    title: 'Faster Sales',
    description: 'Sell your items up to 3x faster',
  },
  {
    icon: Shield,
    title: 'Verified Badge',
    description: 'Stand out with a trusted seller badge',
  },
  {
    icon: Star,
    title: 'Top Placement',
    description: 'Appear at the top of search results',
  },
];

export default function PromoteAdPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handlePromoteClick = () => {
    if (!isAuthenticated) {
      localStorage.setItem('authRedirect', '/promote-ad');
      sessionStorage.setItem('authRedirect', '/promote-ad');
      useUIStore.getState().toggleLoginModal();
      return;
    }
    router.push('/dashboard/my-ads?promote=true');
  };

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
      <ResponsiveHeader variant="default" />

      <main className="flex-1 pt-[48px] md:pt-[112px]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container-app relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm mb-6">
              <Zap className="w-4 h-4" />
              Boost Your Sales Today
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Promote Your Ad &amp; Reach<br />
              <span className="text-accent-400">More Buyers</span>
            </h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8">
              Get your listings seen by thousands of potential buyers. Choose from our
              flexible promotion packages designed to sell your items faster.
            </p>
            <button
              onClick={handlePromoteClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {isAuthenticated ? 'Promote Your Ad' : 'Get Started'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="container-app">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {BENEFITS.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-slate-500">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Plans Section */}
        <section className="py-16 bg-slate-50">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Choose Your <span className="text-primary-600">Promotion Plan</span>
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Select the promotion that best fits your needs. All plans include instant results and easy management.
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-white h-80 rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    {plan.type === 'premium' && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-b-lg text-xs font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500">
                        Most Popular
                      </div>
                    )}

                    <div className="p-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getGradient(plan.type)} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                        {getIcon(plan.type)}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                      <p className="text-sm text-slate-500 mb-4">{plan.duration_days} day{plan.duration_days !== 1 ? 's' : ''}</p>

                      <div className="mb-6">
                        <span className="text-3xl font-bold text-slate-900">{plan.formatted_price}</span>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-3 mb-6">
                          {plan.features.slice(0, 4).map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            router.push('/login?redirect=/promote-ad');
                            return;
                          }
                          router.push(`/dashboard/my-ads?promote=true&plan=${plan.id}`);
                        }}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                          plan.type === 'premium'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        Choose Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                How It <span className="text-primary-600">Works</span>
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Promoting your ad is quick and easy. Get started in just 3 simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold text-lg">
                  1
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Select Your Ad</h3>
                <p className="text-sm text-slate-500">Choose the ad you want to promote from your listings</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Choose a Plan</h3>
                <p className="text-sm text-slate-500">Pick the promotion package that suits your needs</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold text-lg">
                  3
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Make Payment</h3>
                <p className="text-sm text-slate-500">Complete your purchase and watch your ad soar</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="container-app text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Boost Your Sales?
            </h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Join thousands of sellers who have successfully sold their items faster with our promotion packages.
            </p>
            <button
              onClick={handlePromoteClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-all duration-300 shadow-lg"
            >
              {isAuthenticated ? 'Promote Your Ad Now' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
