'use client';

import { useEffect, useRef } from 'react';
import { useUIStore, useAuthStore } from '@/lib/store';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '190991791068-p65o95kslmp106ohlbdafsdthg702tn3.apps.googleusercontent.com';
const ONE_TAP_DELAY = 2000;
const SCRIPT_KEY = 'google_gsi_one_tap';

interface GoogleWindow {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: { client_id: string; auto_select: boolean; callback: (response: { credential: string }) => void; ux_mode?: string }) => void;
        prompt: (momentListener?: (res: { isNotDisplayed: boolean; isSkippedMoment: boolean; isDismissedMoment: boolean }) => void) => void;
        disableAutoSelect: () => void;
        storeCredential: (credentials: { id: string; password: string }) => void;
      };
    };
  };
}

const handleCredential = async (response: { credential: string }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  const res = await fetch(`${apiUrl}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ credential: response.credential }),
  });
  const data = await res.json();
  if (res.ok && data.token) {
    useAuthStore.getState().login(data.user, data.token);
    useUIStore.getState().closeAllModals();
  }
};

const loadGoogleScript = (onLoad: () => void) => {
  if (document.getElementById(SCRIPT_KEY)) { onLoad(); return; }
  const script = document.createElement('script');
  script.id = SCRIPT_KEY;
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => onLoad();
  document.head.appendChild(script);
};

function hasStoredToken(): boolean {
  if (typeof window === 'undefined') return false;
  const hasAuthStorage = !!localStorage.getItem('auth-storage');
  const hasAuthToken = !!localStorage.getItem('authToken');
  const hasCookie = document.cookie.includes('token=');
  return hasAuthStorage || hasAuthToken || hasCookie;
}

export default function GoogleOneTap() {
  const { isAuthenticated } = useAuthStore();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isAuthenticated || hasStoredToken()) {
      hasShownRef.current = false;
      return;
    }

    loadGoogleScript(() => {
      const win = window as unknown as GoogleWindow;
      if (!win.google?.accounts?.id) return;
      try {
        document.cookie.split(';').forEach((c) => {
          if (c.trim().startsWith('g_state=')) {
            document.cookie = 'g_state=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            document.cookie = 'g_state=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
          }
        });

        win.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select: true,
          callback: handleCredential,
          ux_mode: 'popup',
        });
        setTimeout(() => {
          if (hasShownRef.current || isAuthenticated || hasStoredToken()) return;
          try {
            win.google?.accounts?.id?.prompt((notification: any) => {
              if (notification && (notification.isNotDisplayed || notification.isSkippedMoment || notification.isDismissedMoment)) {
                hasShownRef.current = false;
              } else {
                hasShownRef.current = true;
              }
            });
          } catch (e) { /* silent */ }
        }, ONE_TAP_DELAY);
      } catch (e) { /* silent */ }
    });
  }, [isAuthenticated]);

  return null;
}
