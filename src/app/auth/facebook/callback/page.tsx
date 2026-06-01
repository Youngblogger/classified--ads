'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function FacebookCallbackContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        // With detectSessionInUrl: true, getSession() handles code exchange automatically
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const redirectTo = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect') || '/';
          localStorage.removeItem('authRedirect');
          sessionStorage.removeItem('authRedirect');
          if (!cancelled) window.location.href = redirectTo;
          return;
        }

        // Fallback: manual exchange if auto-detection didn't work
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (s?.user) {
              const redirectTo = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect') || '/';
              localStorage.removeItem('authRedirect');
              sessionStorage.removeItem('authRedirect');
              if (!cancelled) window.location.href = redirectTo;
              return;
            }
            console.error('[Auth Facebook Callback] exchangeCodeForSession failed:', exchangeError);
            setError('Authentication failed. Please try again.');
            return;
          }
        }

        for (let i = 0; i < 10; i++) {
          if (cancelled) return;
          const { data: { session: s } } = await supabase.auth.getSession();
          if (s?.user) {
            const redirectTo = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect') || '/';
            localStorage.removeItem('authRedirect');
            sessionStorage.removeItem('authRedirect');
            if (!cancelled) window.location.href = redirectTo;
            return;
          }
          await new Promise(r => setTimeout(r, 500));
        }

        setError('Authentication completed but session could not be established. Please try again.');
      } catch (e) {
        console.error('[Auth Facebook Callback] Unexpected error:', e);
        setError('An error occurred during authentication. Please try again.');
      }
    }

    handleCallback();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 mb-4 text-lg font-semibold">Authentication Failed</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing Facebook login, please wait...</p>
      </div>
    </div>
  );
}

export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <FacebookCallbackContent />
    </Suspense>
  );
}
