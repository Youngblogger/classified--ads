'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');
    const errorParam = searchParams.get('error');
    const message = searchParams.get('message');

    if (errorParam || message) {
      setError(message || errorParam || 'Authentication failed');
      return;
    }

    if (token && userData) {
      try {
        const user = JSON.parse(atob(userData));
        login(user, token);
        router.push('/dashboard');
      } catch (e) {
        setError('Failed to process authentication');
      }
    } else {
      setError('No authentication data received');
    }
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-lg">Authentication Failed</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-primary-600 hover:text-primary-700"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing Google login...</p>
      </div>
    </div>
  );
}
