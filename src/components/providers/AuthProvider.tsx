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

  // Single source of truth: Zustand store owns auth state.
  // Supabase onAuthStateChange events sync TO Zustand, but never destructively
  // override it. The `onRehydrateStorage` callback validates token expiry on
  // every page load before hydrationComplete resolves.
  useEffect(() => {
    if (authInitRef.current) return;
    authInitRef.current = true;

    let cancelled = false;

    async function initialize() {
      try {
        await hydrationComplete;
      } catch {}
      if (!mountedRef.current || cancelled) return;

      const justLoggedOut = sessionStorage.getItem('just_logged_out');
      if (justLoggedOut === 'true') {
        sessionStorage.removeItem('just_logged_out');
        useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        finishInit('guest');
        return;
      }

      // Zustand is the single source of truth. If it has valid auth (token was
      // already validated in onRehydrateStorage), trust it immediately without
      // a destructive getSession() background check. Do NOT call logout() here
      // — that would wipe localStorage and permanently lose auth on refresh.
      const storeAlreadyAuthed = useAuthStore.getState().isAuthenticated;
      if (storeAlreadyAuthed) {
        const userData = useAuthStore.getState().user;
        finishInit('authenticated', userData as any);
        return;
      }

      // Fallback: try Supabase for a session (e.g. fresh login before Zustand
      // persisted, or callback redirect arriving before Zustand write).
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mountedRef.current || cancelled) return;

        if (session?.user) {
          const token = session.access_token;
          const user = session.user;
          setAuthCookie(token);
          finishInit('authenticated', user);
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
        } else {
          clearAuthCookie();
          finishInit('guest');
        }
      } catch {
        if (mountedRef.current && !cancelled) finishInit('guest');
      }
    }

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current || cancelled) return;

      // INITIAL_SESSION fires after Supabase recovers a session from storage.
      // Sync to Zustand if Zustand isn't already authenticated.
      if (event === 'INITIAL_SESSION' && session?.user) {
        if (!useAuthStore.getState().isAuthenticated) {
          setAuthCookie(session.access_token);
          if (mountedRef.current) {
            setAuthState('authenticated');
            setUser(session.user);
          }
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
        return;
      }

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
            const store = useAuthStore.getState();
            if (store.isAuthenticated && store.token) {
              // Check if the Zustand token is still valid before clearing
              // auth. Supabase's session recovery may have failed for reasons
              // unrelated to token validity (clock skew, cookie encoding,
              // transient storage error). The JWT expiry is the ground truth.
              try {
                const payload = JSON.parse(atob(store.token.split('.')[1]));
                if (payload.exp && payload.exp * 1000 > Date.now()) {
                  // Token is still valid — trust Zustand over Supabase
                  return;
                }
              } catch {}
              // Token is expired or malformed — clear in-memory state but
              // keep localStorage intact so the next page load can re-validate.
              useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
              sessionStorage.setItem('just_logged_out', 'true');
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
