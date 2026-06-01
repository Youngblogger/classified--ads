import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookieValue(name: string, value: string, maxAgeDays: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + maxAgeDays * 24 * 60 * 60 * 1000);
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;max-age=${maxAgeDays * 24 * 60 * 60};SameSite=Lax${isSecure ? ';Secure' : ''}`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

// Storage adapter that syncs to both localStorage and cookies.
// This ensures the PKCE code verifier survives the OAuth redirect
// (a full page navigation that can lose ephemeral in-memory state).
const dualStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key) || getCookie(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(key, value); } catch {}
      setCookieValue(key, value, 365);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(key); } catch {}
      removeCookie(key);
    }
  },
};

export function setAuthCookie(token: string) {
  setCookieValue('ilist-supabase-auth-token', token, 365);
}

export function clearAuthCookie() {
  removeCookie('ilist-supabase-auth-token');
}

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.warn('[Supabase] Missing environment variables NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  }

  const isBrowser = typeof window !== 'undefined';

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      storageKey: 'ilist-supabase-auth',
      storage: dualStorage,
      autoRefreshToken: isBrowser,
      persistSession: isBrowser,
      detectSessionInUrl: isBrowser,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'ilist-marketplace@1.0.0',
      },
      fetch: async (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        if (options?.signal) {
          if (options.signal.aborted) {
            controller.abort();
          } else {
            options.signal.addEventListener('abort', () => controller.abort(), { once: true });
          }
        }
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          return response;
        } finally {
          clearTimeout(timeoutId);
        }
      },
    },
  });

  return supabaseClient;
}

export const supabase = getSupabaseClient();

export function getServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY for admin operations');
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: async (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        if (options?.signal) {
          if (options.signal.aborted) {
            controller.abort();
          } else {
            options.signal.addEventListener('abort', () => controller.abort(), { once: true });
          }
        }
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          return response;
        } finally {
          clearTimeout(timeoutId);
        }
      },
    },
  });
}
