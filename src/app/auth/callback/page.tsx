'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase, setAuthCookie } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

const BRAND = 'iList Classified Marketplace';

function CallbackContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Completing sign in...');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('just_logged_out');
        }
        setStatusText('Verifying authentication...');

        let retries = 0;
        const MAX_RETRIES = 10;

        while (retries < MAX_RETRIES) {
          if (cancelled || !mountedRef.current) return;

          setStatusText(retries < 3
            ? 'Completing sign in...'
            : 'Finalizing your session...');

          // Exponential backoff: 400ms, 500ms, 600ms, ... up to ~1300ms
          const delay = 400 + retries * 100;

          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user && session.access_token) {
            setStatusText('Sign in successful! Redirecting...');

            setAuthCookie(session.access_token);

            useAuthStore.getState().login(
              {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name
                  || session.user.user_metadata?.name
                  || session.user.email?.split('@')[0]
                  || 'User',
                avatar_url: session.user.user_metadata?.avatar_url
                  || session.user.user_metadata?.picture
                  || null,
                google_avatar: session.user.user_metadata?.avatar_url || null,
                facebook_avatar: session.user.user_metadata?.avatar_url || null,
              } as any,
              session.access_token
            );

            const redirectTo = localStorage.getItem('authRedirect')
              || sessionStorage.getItem('authRedirect')
              || '/';
            localStorage.removeItem('authRedirect');
            sessionStorage.removeItem('authRedirect');

            // Give Zustand persist a tick to flush state to localStorage
            await new Promise(r => setTimeout(r, 100));
            // Also wait one animation frame for React to commit the render
            await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));

            if (!cancelled && mountedRef.current) {
              window.location.replace(redirectTo);
            }
            return;
          }

          retries++;
          await new Promise(r => setTimeout(r, delay));
        }

        if (!cancelled && mountedRef.current) {
          setError('We couldn\'t complete your sign in. The session may have expired. Please try again.');
        }
      } catch (e) {
        console.error('[Auth Callback] Error:', e);
        if (!cancelled && mountedRef.current) {
          setError('An unexpected error occurred. Please try signing in again.');
        }
      }
    }

    handleCallback();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Sign In Failed</h1>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
          >
            Back to {BRAND}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="text-center px-6">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-1">{BRAND}</h1>
        <p className="text-sm text-gray-500">{statusText}</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return <CallbackContent />;
}
