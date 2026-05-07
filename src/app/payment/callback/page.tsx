'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Zap, Home, ArrowLeft } from 'lucide-react';
import { promotionsApi, growthApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying payment...');
  const [paymentType, setPaymentType] = useState<'boost' | 'promotion' | 'unknown'>('unknown');
  const [adId, setAdId] = useState<number | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const ref = reference || trxref;

    if (!ref) {
      setStatus('failed');
      setMessage('No payment reference found');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await promotionsApi.verifyPayment(ref);

        if (response.data.success) {
          const payment = response.data.payment;
          const type = payment?.type || 'unknown';
          setPaymentType(type as any);

          if (payment?.ad_id) {
            setAdId(payment.ad_id);
          }

          if (type === 'boost') {
            setStatus('success');
            setMessage('Payment successful! Your ad boost has been activated.');
            toast.success('Boost activated successfully!');
          } else {
            setStatus('success');
            setMessage('Payment successful! Your promotion has been activated.');
            toast.success('Payment successful!');
          }
        } else {
          setStatus('failed');
          setMessage(response.data.message || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);

        if (error.response?.status === 404 || error.response?.status === 400) {
          setStatus('failed');
          setMessage('Payment may still be processing. Check your dashboard for updates.');
        } else {
          setStatus('failed');
          setMessage(error.response?.data?.message || 'Payment verification failed');
        }
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  const getRedirectUrl = () => {
    if (paymentType === 'boost' && adId) {
      return `/ad/${adId}`;
    }
    if (paymentType === 'promotion') {
      return '/dashboard/promotions';
    }
    return '/dashboard';
  };

  const getRedirectLabel = () => {
    if (paymentType === 'boost' && adId) {
      return 'View Your Ad';
    }
    if (paymentType === 'promotion') {
      return 'View Promotions';
    }
    return 'Go to Dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
            {paymentType === 'boost' && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-600">Boost Activated</span>
              </div>
            )}
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={getRedirectUrl()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors"
              >
                {getRedirectLabel()}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                Homepage
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                Homepage
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
