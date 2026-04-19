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
        initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
        prompt: () => void;
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

export default function GoogleOneTap() {
  const { isAuthenticated } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || isAuthenticated || initialized.current) return;
    initialized.current = true;

    loadGoogleScript(() => {
      const win = window as unknown as GoogleWindow;
      if (!win.google?.accounts?.id) return;
      try {
        win.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential });
        setTimeout(() => {
          try { win.google?.accounts?.id?.prompt(); } catch (e) { console.log('One Tap not available'); }
        }, ONE_TAP_DELAY);
      } catch (e) { console.log('One Tap init failed'); }
    });
  }, [isAuthenticated]);

  return null;
}