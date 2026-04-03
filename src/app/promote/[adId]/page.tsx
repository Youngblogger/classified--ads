'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, XCircle } from 'lucide-react';
import { adsApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import PromotionPackages from '@/components/promotion/PromotionPackages';
import PaymentMethods from '@/components/promotion/PaymentMethods';
import BankTransferDetails from '@/components/promotion/BankTransferDetails';
import PaymentStatus from '@/components/promotion/PaymentStatus';

type Step = 'packages' | 'payment' | 'processing' | 'success' | 'failed';
type PaymentMethod = 'card' | 'bank' | 'ussd' | 'wallet';

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

interface AdData {
  id: number;
  title: string;
  slug: string;
  price: string;
  images: { url: string }[];
}

export default function PromoteAdPage() {
  const params = useParams();
  const adId = params.adId as string;
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [step, setStep] = useState<Step>('packages');
  const [ad, setAd] = useState<AdData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentReference, setPaymentReference] = useState('');
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/promote/' + adId);
      return;
    }
    fetchAd();
    fetchWalletBalance();
  }, [adId, isAuthenticated]);

  const fetchAd = async () => {
    try {
      const res = await adsApi.getById(parseInt(adId));
      setAd(res.data);
    } catch (err: any) {
      setError('Failed to load ad');
      toast.error('Failed to load ad');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await walletApi.getBalance();
      setWalletBalance(parseFloat(res.data.balance) || 0);
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleCardPaymentSuccess = async () => {
    setStep('success');
    toast.success('Payment successful! Your ad is now promoted.');
  };

  const handleBankPaymentSuccess = async () => {
    setStep('success');
    toast.success('Payment received! Your ad is now promoted.');
  };

  const handleBack = () => {
    if (step === 'payment') {
      setSelectedPlan(null);
      setPaymentMethod(null);
      setStep('packages');
    } else if (step === 'processing') {
      setStep('payment');
    }
  };

  const handleTryAgain = () => {
    setStep('packages');
    setSelectedPlan(null);
    setPaymentMethod(null);
    setPaymentData(null);
    setError(null);
  };

  const handleViewPromotions = () => {
    router.push('/dashboard/promotions');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Ad Not Found</h2>
        <p className="text-gray-500 mt-2">The ad you&apos;re trying to promote doesn&apos;t exist.</p>
        <button
          onClick={() => router.push('/dashboard/my-ads')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Go to My Ads
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={step === 'packages' ? () => router.back() : handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'packages' ? 'Back to Ad' : 'Back'}
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {ad.images?.[0] && (
                <img
                  src={typeof ad.images[0] === 'string' ? ad.images[0] : ad.images[0].url}
                  alt={ad.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <h1 className="font-semibold text-gray-900">{ad.title}</h1>
                <p className="text-sm text-gray-500">{ad.price}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 'packages' && (
              <PromotionPackages
                selectedPlan={selectedPlan}
                onSelectPlan={handleSelectPlan}
              />
            )}

            {step === 'payment' && selectedPlan && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Selected Plan</span>
                    <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Total</span>
                    <span className="text-xl font-bold text-gray-900">{selectedPlan.formatted_price}</span>
                  </div>
                </div>

                <PaymentMethods
                  selectedMethod={paymentMethod}
                  onSelectMethod={handleSelectPaymentMethod}
                  walletBalance={walletBalance}
                  planPrice={selectedPlan.price}
                  planId={selectedPlan.id}
                  adId={ad?.id}
                  disabled={!isAuthenticated}
                  onPaymentSuccess={handleCardPaymentSuccess}
                  onPaymentError={(error) => {
                    setError(error);
                    setStep('failed');
                  }}
                />

              </div>
            )}

            {step === 'success' && (
              <PaymentStatus
                status="completed"
                message="Your ad has been successfully promoted!"
                amount={selectedPlan?.price}
                reference={paymentReference}
                promotionName={selectedPlan?.name}
                onViewPromotions={handleViewPromotions}
              />
            )}

            {step === 'failed' && (
              <PaymentStatus
                status="failed"
                message={error || 'Payment failed. Please try again.'}
                onTryAgain={handleTryAgain}
              />
            )}

            {step === 'processing' && paymentMethod === 'bank' && paymentData && (
              <BankTransferDetails
                bankDetails={paymentData.bank_details}
                amount={selectedPlan?.price || 0}
                reference={paymentReference}
                paymentId={paymentData.payment?.id}
                onSuccess={handleBankPaymentSuccess}
                onCancel={() => setStep('payment')}
              />
            )}

            {step === 'processing' && paymentMethod === 'wallet' && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-600">Processing wallet payment...</p>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}
