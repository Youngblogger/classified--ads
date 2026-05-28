'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function CallbackContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        const urlState = queryParams.get('state');

        const allStorage = Object.entries(localStorage).map(([k, v]) => {
          if (k.includes('auth') || k.includes('supabase') || k.includes('ilist') || k.includes('oauth') || k.includes('code') || k.includes('verifier') || k.includes('state')) {
            return `${k}=${v.substring(0, 50)}`;
          }
          return null;
        }).filter(Boolean).join('\n');

        setDebug(`URL: ${window.location.href}\nCode: ${code ? 'present (' + code.substring(0, 20) + '...)' : 'MISSING'}\nState: ${urlState ? 'present' : 'MISSING'}\n\nStorage:\n${allStorage || 'none'}`);

        let exchangeErrMsg = '';
        if (code) {
          try {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) exchangeErrMsg = exchangeError.message;
          } catch (e) {
            exchangeErrMsg = e instanceof Error ? e.message : String(e);
          }
          setDebug(p => p + `\n\nExchange: ${exchangeErrMsg || 'OK'}`);
        }

        setDebug(p => p + `\nExchange err: "${exchangeErrMsg}"`);

        for (let i = 0; i < 15; i++) {
          if (cancelled) return;
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const redirectTo = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect') || '/';
            localStorage.removeItem('authRedirect');
            sessionStorage.removeItem('authRedirect');
            if (!cancelled) window.location.href = redirectTo;
            return;
          }
          if (i < 14) await new Promise(r => setTimeout(r, 1000));
        }

        setError('Authentication completed but session could not be established. Please try again.');
      } catch (e) {
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
          {debug && (
            <pre className="text-xs text-left bg-gray-100 p-3 rounded-lg mb-4 overflow-auto max-w-full whitespace-pre-wrap break-words">
              {debug}
            </pre>
          )}
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
