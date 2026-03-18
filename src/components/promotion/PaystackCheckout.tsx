import { useEffect, useRef, useState } from 'react';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { paymentsApi } from '@/lib/api';

interface PaystackCheckoutProps {
  reference: string;
  authorizationUrl: string;
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function PaystackCheckout({
  reference,
  authorizationUrl,
  amount,
  email,
  onSuccess,
  onClose,
}: PaystackCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    loadPaystack();
  }, []);

  const loadPaystack = async () => {
    try {
      const publicKeyResponse = await paymentsApi.getPublicKey();
      const publicKey = publicKeyResponse.data.public_key;

      if (!publicKey) {
        setError('Paystack public key not available');
        setLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        initializePayment(publicKey);
      };
      script.onerror = () => {
        setError('Failed to load Paystack');
        setLoading(false);
      };
      document.body.appendChild(script);

    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const initializePayment = (publicKey: string) => {
    if (!window.PaystackPop) {
      setError('Paystack not loaded');
      setLoading(false);
      return;
    }

    const paystack = window.PaystackPop.setup({
      key: publicKey,
      email: email,
      amount: amount * 100,
      reference: reference,
      callback: (response: any) => {
        handlePaymentSuccess(response.reference);
      },
      onClose: () => {
        setVerifying(true);
        checkPaymentStatus(reference);
      },
    });

    paystack.openIframe();
    setLoading(false);
  };

  const handlePaymentSuccess = async (ref: string) => {
    setVerifying(true);
    try {
      await paymentsApi.verify(ref);
      onSuccess(ref);
    } catch (err) {
      checkPaymentStatus(ref);
    }
  };

  const checkPaymentStatus = async (ref: string) => {
    try {
      const response = await paymentsApi.getStatus(ref);
      if (response.data.status === 'completed') {
        onSuccess(ref);
      } else if (response.data.status === 'pending') {
        setVerifying(false);
      } else {
        setError('Payment failed. Please try again.');
        setVerifying(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify payment');
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Initializing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Verifying payment...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your payment</p>
      </div>
    );
  }

  return null;
}
