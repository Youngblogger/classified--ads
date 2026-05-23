'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { emailVerificationApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await emailVerificationApi.verify(token);
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.message || 'Your email address has been verified successfully.');
          if (refreshUser) {
            await refreshUser();
          }
        } else {
          setStatus('error');
          setMessage(res.data.message || 'Verification failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
      }
    };

    verifyEmail();
  }, [searchParams, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Verifying Email</h1>
              <p className="text-gray-500">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-gray-500 mb-6">{message}</p>
              <Link
                href="/dashboard/verification"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Go to Verification Center
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-500 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/dashboard/verification"
                  className="block w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  Request New Verification Email
                </Link>
                <Link
                  href="/"
                  className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Go to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
