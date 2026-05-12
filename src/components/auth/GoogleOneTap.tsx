'use client';

import { useEffect, useRef, useState } from 'react';
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
          renderButton: (container: HTMLElement, config: object) => void;
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
  const [showFallback, setShowFallback] = useState(false);
  const fallbackContainerRef = useRef<HTMLDivElement>(null);
  const fallbackRenderedRef = useRef(false);
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

      if (!loaded || !window.google?.accounts?.id) {
        setShowFallback(true);
        return;
      }

      const gw = window.google.accounts.id;

      const handleCredential = async (response: { credential: string }) => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
          const res = await fetch(`${apiUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ credential: response.credential }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Google login failed');
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
        cancel_on_tap_outside: false,
        context: 'signin',
        use_fedcm_for_prompt: false,
      });

      if (!promptCalledRef.current) {
        promptCalledRef.current = true;
        gw.prompt((res) => {
          if (res?.isNotDisplayed || res?.isSkippedMoment) {
            setShowFallback(true);
          }
        });
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, login, isMobile]);

  useEffect(() => {
    if (!showFallback) return;
    if (!isMobile) return;
    if (!fallbackContainerRef.current) return;
    if (fallbackRenderedRef.current) return;

    const gw = window.google?.accounts?.id;
    if (!gw) return;

    fallbackRenderedRef.current = true;

    const container = fallbackContainerRef.current;

    requestAnimationFrame(() => {
      const width = Math.min(container.clientWidth || 360, 400);
      gw.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: width.toString(),
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'center',
      });
    });
  }, [showFallback, isMobile]);

  if (isAuthenticated) return null;
  if (!isMobile) return null;

  return (
    <>
      {showFallback && (
        <div className="fixed bottom-0 left-0 right-0 z-[300]">
          <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
            <div ref={fallbackContainerRef} className="w-full" />
          </div>
        </div>
      )}
    </>
  );
}
