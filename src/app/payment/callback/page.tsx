'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Zap, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 40;

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying payment...');
  const [paymentType, setPaymentType] = useState<'boost' | 'promotion' | 'unknown'>('unknown');
  const [adId, setAdId] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const ref = reference || trxref;

    if (!ref) {
      setStatus('failed');
      setMessage('No payment reference found');
      return;
    }

    const pollVerify = async () => {
      if (attemptRef.current >= MAX_POLL_ATTEMPTS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus('failed');
        setMessage('Payment verification timed out. Please check your dashboard.');
        return;
      }

      attemptRef.current += 1;

      try {
        const response = await paymentApi.verifyPayment(ref);

        if (response.data.success) {
          if (pollRef.current) clearInterval(pollRef.current);

          const payment = response.data.payment;
          const type = payment?.type || 'unknown';
          setPaymentType(type as any);

          if (payment?.ad_id) {
            setAdId(payment.ad_id);
          }

          setStatus('success');
          setMessage('Payment confirmed successfully!');

          if (type === 'boost') {
            toast.success('Boost activated successfully!');
          } else {
            toast.success('Payment successful!');
          }
        } else {
          const code = response.data.code;

          if (code === 'pending') {
            setMessage('Payment still processing...');
          } else if (code === 'validation_failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setStatus('failed');
            setMessage(response.data.message || 'Payment validation failed');
          } else if (code === 'gateway_error') {
            setMessage('Contacting payment gateway...');
          }
        }
      } catch (error: any) {
        const httpStatus = error.response?.status;

        if (httpStatus === 202 || httpStatus === 400) {
          const data = error.response?.data;

          if (data?.code === 'pending') {
            setMessage('Payment still processing...');
          } else if (data?.code === 'validation_failed' || data?.code === 'payment_not_found') {
            if (pollRef.current) clearInterval(pollRef.current);
            setStatus('failed');
            setMessage(data.message || 'Payment not found');
          }
        } else if (httpStatus === 404) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus('failed');
          setMessage('Payment reference not found');
        }
      }
    };

    pollVerify();
    pollRef.current = setInterval(pollVerify, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
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
              <button
                onClick={() => {
                  setStatus('loading');
                  setMessage('Retrying verification...');
                  attemptRef.current = 0;
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
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
