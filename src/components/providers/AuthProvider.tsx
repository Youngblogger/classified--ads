'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore, useGlobalStore } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const LOCATION_RESET_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const resetLocation = useCallback(() => {
    const globalStore = useGlobalStore.getState();
    if (globalStore.selectedLocation) {
      console.log('Resetting location to default due to inactivity');
      globalStore.setSelectedLocation(null);
    }
  }, []);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimer.current = setTimeout(resetLocation, LOCATION_RESET_TIMEOUT);
  }, [clearInactivityTimer, resetLocation]);

  // Inactivity timer for location reset
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      startInactivityTimer();
    };

    startInactivityTimer();

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearInactivityTimer();
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [startInactivityTimer, clearInactivityTimer]);

  // Auth restoration
  useEffect(() => {
    setMounted(true);
    
    try {
      if (typeof window !== 'undefined' && window.self === window.top && window.location?.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode && !getCookie('referrer')) {
          setCookie('referrer', refCode, 30);
        }

        const justLoggedOut = sessionStorage.getItem('just_logged_out');
        if (justLoggedOut === 'true') {
          sessionStorage.removeItem('just_logged_out');
          return;
        }
      }
      
      const authStorage = localStorage.getItem('auth-storage');
      let zustandAuth = null;
      if (authStorage) {
        try {
          zustandAuth = JSON.parse(authStorage);
        } catch (e) {
          console.error('Failed to parse auth-storage:', e);
        }
      }

      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      let tokenToRestore = null;
      let userToRestore = null;
      
      if (zustandAuth?.state?.token && zustandAuth?.state?.user) {
        tokenToRestore = zustandAuth.state.token;
        userToRestore = zustandAuth.state.user;
      } else if (storedToken && storedUser) {
        tokenToRestore = storedToken;
        userToRestore = JSON.parse(storedUser);
      }

      if (tokenToRestore && userToRestore) {
        fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${tokenToRestore}` }
        })
        .then(res => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then(userData => {
          const freshUser = {
            ...userData,
            full_avatar_url: userData.full_avatar_url || 
              (userData.avatar ? `http://127.0.0.1:8000/storage/${userData.avatar}` : null) ||
              userData.google_avatar ||
              userData.facebook_avatar,
          };
          useAuthStore.getState().login(freshUser, tokenToRestore);
        })
        .catch(() => {
          useAuthStore.getState().logout();
        });
      }
    } catch (e) {
      // Ignore errors when in restricted context
    }
  }, []);

  return <>{children}</>;
}
