import { useState, useEffect } from 'react';
import { Check, Zap, Star, ArrowUp, Crown } from 'lucide-react';
import { promotionsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

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

interface PromotionPackagesProps {
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'featured':
      return <Star className="w-6 h-6" />;
    case 'top':
      return <ArrowUp className="w-6 h-6" />;
    case 'bump':
      return <Zap className="w-6 h-6" />;
    case 'premium':
      return <Crown className="w-6 h-6" />;
    default:
      return <Star className="w-6 h-6" />;
  }
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

export default function PromotionPackages({ selectedPlan, onSelectPlan }: PromotionPackagesProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await promotionsApi.getPlans();
      const plansData = response.data.plans || [];
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load promotion plans');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-48 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchPlans}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a Promotion</h2>
      
      {plans.map((plan) => (
        <div
          key={plan.id}
          onClick={() => onSelectPlan(plan)}
          className={`
            relative cursor-pointer rounded-xl border-2 transition-all duration-200
            ${selectedPlan?.id === plan.id 
              ? 'border-blue-500 bg-blue-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }
          `}
        >
          {plan.type === 'premium' && (
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getGradient(plan.type)}`}>
              Most Popular
            </div>
          )}
          
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getGradient(plan.type)} text-white`}>
                  {getIcon(plan.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.duration_days} day{plan.duration_days !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{plan.formatted_price}</p>
              </div>
            </div>
            
            <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
            
            {plan.features && plan.features.length > 0 && (
              <ul className="mt-3 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {selectedPlan?.id === plan.id && (
              <div className="mt-4 flex items-center justify-center py-2 bg-blue-500 text-white rounded-lg font-medium">
                Selected
              </div>
            )}
          </div>
        </div>
      ))}
      
      {!isAuthenticated && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Please login to purchase promotions
        </p>
      )}
    </div>
  );
}
