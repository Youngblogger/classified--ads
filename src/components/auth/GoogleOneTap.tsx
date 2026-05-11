'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

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

function loadGsiScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

export default function GoogleOneTap() {
  const { isAuthenticated, login } = useAuthStore();
  const initializedRef = useRef(false);
  const promptCalledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isAuthenticated) return;
    if (initializedRef.current) return;

    let cancelled = false;

    const init = async () => {
      await loadGsiScript();

      if (cancelled || initializedRef.current) return;
      initializedRef.current = true;

      const gw = window.google?.accounts?.id;
      if (!gw) return;

      const handleCredential = async (response: { credential: string }) => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
          const res = await fetch(`${apiUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ credential: response.credential }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || 'Google login failed');
          }

          login(data.user, data.token);

        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Google login failed';
          toast.error(msg);
          console.error('Google One Tap error:', msg);
        }
      };

      gw.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      });

      if (!promptCalledRef.current) {
        promptCalledRef.current = true;
        gw.prompt(() => {});
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, login]);

  return null;
}
