import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

export function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `ilist-supabase-auth-token=${encodeURIComponent(token)};expires=${expires.toUTCString()};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax${isSecure ? ';Secure' : ''}`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'ilist-supabase-auth-token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
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
