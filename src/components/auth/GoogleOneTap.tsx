'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { http } from '@/lib/http-client';
import { supabase } from '@/lib/supabase';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '190991791068-p65o95kslmp106ohlbdafsdthg702tn3.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (momentListener?: (res: { isNotDisplayed?: boolean; isSkippedMoment?: boolean; isDismissedMoment?: boolean }) => void) => void;
          cancel: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const SCRIPT_ID = 'google-gsi-script';
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGsiScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) {
      resolve(true);
      return;
    }
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function GoogleOneTap() {
  const { isAuthenticated, login } = useAuthStore();
  const initializedRef = useRef(false);
  const promptCalledRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isMobile) return;
    if (isAuthenticated) return;
    if (initializedRef.current) return;

    let cancelled = false;

    const init = async () => {
      const loaded = await loadGsiScript();
      if (cancelled || initializedRef.current) return;
      initializedRef.current = true;

      if (!loaded || !window.google?.accounts?.id) return;

      const gw = window.google.accounts.id;

      const handleCredential = async (response: { credential: string }) => {
        try {
          await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
          });

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
          const res = await http.post(`${apiUrl}/auth/google`, { credential: response.credential });

          if (res.status !== 200) throw new Error(res.data?.message || 'Google login failed');
          login(res.data.user, res.data.token);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Google login failed';
          console.error('Google One Tap error:', msg);
        }
      };

      gw.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: false,
        context: 'signin',
        use_fedcm_for_prompt: false,
      });

      if (!promptCalledRef.current) {
        promptCalledRef.current = true;
        gw.prompt();
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, login, isMobile]);

  return null;
}
