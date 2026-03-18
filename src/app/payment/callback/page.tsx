'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { promotionsApi } from '@/lib/api';
import toast from 'react-hot-toast';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference) {
      setStatus('failed');
      setMessage('No reference provided');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await promotionsApi.verifyPayment(reference);
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Payment successful! Your promotion has been activated.');
          toast.success('Payment successful!');
          
          setTimeout(() => {
            router.push('/dashboard/promotions');
          }, 2000);
        } else {
          setStatus('failed');
          setMessage(response.data.message || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage(error.response?.data?.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Go to Dashboard
            </button>
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
