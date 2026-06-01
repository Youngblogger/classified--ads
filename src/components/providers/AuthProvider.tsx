'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useGlobalStore } from '@/lib/store';

const LOCATION_RESET_TIMEOUT = 5 * 60 * 1000;

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
  const authInitRef = useRef(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  const resetLocation = useCallback(() => {
    const globalStore = useGlobalStore.getState();
    if (globalStore.selectedLocation) {
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => startInactivityTimer();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Single source of truth for Supabase auth state
  useEffect(() => {
    if (authInitRef.current) return;
    authInitRef.current = true;
    setMounted(true);

    const justLoggedOut = sessionStorage.getItem('just_logged_out');
    if (justLoggedOut === 'true') {
      sessionStorage.removeItem('just_logged_out');
      return;
    }

    // Restore session on mount — getSession is more reliable than getUser for cookie-based sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        const store = useAuthStore.getState();
        if (store.isAuthenticated) store.logout();
        return;
      }
      const token = session.access_token;
      supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data: profile }) => {
        if (profile) {
          useAuthStore.getState().login(
            { ...profile, id: session.user.id, email: session.user.email },
            token
          );
        }
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data: profile }) => {
          if (profile) {
            useAuthStore.getState().login(
              { ...profile, id: session.user.id, email: session.user.email },
              session.access_token
            );
          }
        });
      } else if (event === 'SIGNED_OUT') {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          useAuthStore.getState().logout();
        }
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset selected location to All Nigeria when a logged-out user visits
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        const { selectedLocation, setSelectedLocation } = useGlobalStore.getState();
        if (selectedLocation) {
          setSelectedLocation(null);
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [mounted]);

  return <>{children}</>;
}
