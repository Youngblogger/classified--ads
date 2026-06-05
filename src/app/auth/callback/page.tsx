'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, setAuthCookie } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function CallbackContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        // The Supabase client already auto-processes the OAuth code via
        // detectSessionInUrl. Just wait for the session to be established.
        let retries = 0;
        const MAX_RETRIES = 10;

        while (retries < MAX_RETRIES) {
          if (cancelled) return;

          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user && session.access_token) {
            setAuthCookie(session.access_token);
            useAuthStore.getState().login(
              {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                avatar_url: session.user.user_metadata?.avatar_url || null,
                google_avatar: session.user.user_metadata?.avatar_url || null,
              } as any,
              session.access_token
            );

            const redirectTo = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect') || '/';
            localStorage.removeItem('authRedirect');
            sessionStorage.removeItem('authRedirect');
            if (!cancelled) window.location.href = redirectTo;
            return;
          }

          retries++;
          await new Promise(r => setTimeout(r, 800));
        }

        setError('Authentication completed but session could not be established. Please try again.');
      } catch (e) {
        console.error('[Auth Callback] Unexpected error:', e);
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
        <p className="text-gray-600">Completing login, please wait...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
