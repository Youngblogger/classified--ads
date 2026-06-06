'use client';

import { useEffect, useState, useCallback, useRef, createContext, useContext } from 'react';
import { supabase, setAuthCookie, clearAuthCookie } from '@/lib/supabase';
import { useAuthStore, useGlobalStore, hydrationComplete } from '@/lib/store';
import type { User } from '@supabase/supabase-js';

const LOCATION_RESET_TIMEOUT = 5 * 60 * 1000;
const AUTH_INIT_TIMEOUT = 15000;
const LOGOUT_DEBOUNCE_MS = 3000;

export type AuthState = 'loading' | 'authenticated' | 'guest';

interface AuthContextValue {
  authState: AuthState;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue>({ authState: 'loading', user: null });

export const useAuthContext = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const authInitRef = useRef(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const finishInit = useCallback((state: 'authenticated' | 'guest', sessionUser?: User | null) => {
    if (!mountedRef.current) return;
    setAuthState(state);
    setUser(sessionUser || null);
  }, []);

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

  // Safety timeout — if init never completes, fail to guest
  useEffect(() => {
    if (authState !== 'loading') return;
    const timer = setTimeout(() => {
      if (authState === 'loading' && mountedRef.current) {
        finishInit('guest');
      }
    }, AUTH_INIT_TIMEOUT);
    return () => clearTimeout(timer);
  }, [authState, finishInit]);

  // Single source of truth for Supabase auth state
  useEffect(() => {
    if (authInitRef.current) return;
    authInitRef.current = true;

    let cancelled = false;

    async function initialize() {
      // Wait for Zustand persist to finish hydrating before checking session.
      // This prevents the race where persist rehydrates AFTER we set auth state,
      // overwriting isAuthenticated back to false.
      try {
        await hydrationComplete;
      } catch {}
      if (!mountedRef.current || cancelled) return;

      const justLoggedOut = sessionStorage.getItem('just_logged_out');
      if (justLoggedOut === 'true') {
        sessionStorage.removeItem('just_logged_out');
        const store = useAuthStore.getState();
        if (store.isAuthenticated) {
          useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
        finishInit('guest');
        return;
      }

      // If onAuthStateChange already set the store (e.g. SIGNED_IN fired during
      // listener registration on this mount), use that state without overriding.
      const storeAlreadyAuthed = useAuthStore.getState().isAuthenticated;
      if (storeAlreadyAuthed) {
        const userData = useAuthStore.getState().user;
        finishInit('authenticated', userData as any);
        // Still verify with getSession() for token validity, but don't block UI
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!cancelled && !session?.user) {
            useAuthStore.getState().logout();
            if (mountedRef.current) finishInit('guest');
          }
        });
        return;
      }

      // On ALL routes (including callback routes), try to get the session.
      // On callback routes, Supabase SDK will have processed the OAuth code
      // by the time hydrationComplete resolves (the PKCE exchange is async
      // and fires onAuthStateChange with SIGNED_IN which updates Zustand).
      // If the store was updated by the listener, the storeAlreadyAuthed check
      // above catches it. Otherwise, getSession() will find the session directly.
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mountedRef.current || cancelled) return;

        if (session?.user) {
          const token = session.access_token;
          const user = session.user;
          setAuthCookie(token);
          finishInit('authenticated', user);
          supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data: profile }) => {
            if (profile) {
              useAuthStore.getState().login(
                { ...profile, id: user.id, email: user.email },
                token
              );
            } else {
              useAuthStore.getState().login(
                {
                  id: user.id,
                  email: user.email,
                  name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                  avatar_url: user.user_metadata?.avatar_url || null,
                  google_avatar: user.user_metadata?.avatar_url || null,
                  facebook_avatar: user.user_metadata?.facebook_avatar || null,
                } as any,
                token
              );
            }
          });
        } else {
          const store = useAuthStore.getState();
          if (store.isAuthenticated) store.logout();
          clearAuthCookie();
          finishInit('guest');
        }
      }).catch(() => {
        if (mountedRef.current && !cancelled) finishInit('guest');
      });
    }

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current || cancelled) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setAuthCookie(session.access_token);
        if (mountedRef.current) {
          setAuthState('authenticated');
          setUser(session.user);
        }
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data: profile }) => {
          if (profile) {
            useAuthStore.getState().login(
              { ...profile, id: session.user.id, email: session.user.email },
              session.access_token
            );
          } else {
            useAuthStore.getState().login(
              {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                avatar_url: session.user.user_metadata?.avatar_url || null,
                google_avatar: session.user.user_metadata?.avatar_url || null,
                facebook_avatar: session.user.user_metadata?.facebook_avatar || null,
              } as any,
              session.access_token
            );
          }
        });
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        setAuthCookie(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        if (!mountedRef.current || cancelled) return;
        setTimeout(() => {
          if (!mountedRef.current || cancelled) return;
          supabase.auth.getSession().then(({ data: { session: refreshedSession } }) => {
            if (refreshedSession?.user) {
              return;
            }
            if (!mountedRef.current || cancelled) return;
            const { isAuthenticated } = useAuthStore.getState();
            if (isAuthenticated) {
              useAuthStore.getState().logout();
            }
            clearAuthCookie();
            setAuthState('guest');
            setUser(null);
          });
        }, LOGOUT_DEBOUNCE_MS);
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset selected location to All Nigeria when a logged-out user visits
  useEffect(() => {
    if (authState === 'loading') return;
    const timer = setTimeout(() => {
      if (authState === 'guest') {
        const { selectedLocation, setSelectedLocation } = useGlobalStore.getState();
        if (selectedLocation) {
          setSelectedLocation(null);
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [authState]);

  return (
    <AuthContext.Provider value={{ authState, user }}>
      {children}
    </AuthContext.Provider>
  );
}
