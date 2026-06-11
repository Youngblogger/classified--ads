import type { Ad } from '@/types';

/**
 * Standard API response wrapper from http-client
 */
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Standard Supabase-style response (used by sbResponse)
 */
export interface SupabaseApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  error?: string;
  headers: Record<string, string>;
  config: Record<string, unknown>;
}

/**
 * Extract the inner data payload from an API response,
 * handling both Laravel-style and Supabase-style responses.
 */
export function extractData<T>(response: SupabaseApiResponse<ApiResponse<T> | T>): T | null {
  if (!response) return null;
  const body = response.data;
  if (!body) return null;
  if (typeof body === 'object' && 'data' in body && body.data !== undefined) {
    return body.data as T;
  }
  return body as T;
}

/**
 * Extract success boolean from a response.
 */
export function extractSuccess(response: SupabaseApiResponse<ApiResponse<unknown>>): boolean {
  if (!response?.data) return false;
  const body = response.data;
  if (typeof body === 'object' && 'success' in body) {
    return !!body.success;
  }
  return response.status >= 200 && response.status < 300;
}

/**
 * Extract error message from a response.
 */
export function extractError(response: SupabaseApiResponse<ApiResponse<unknown>>): string | null {
  if (!response?.data) return null;
  const body = response.data;
  if (typeof body === 'object') {
    if ('error' in body && body.error) return String(body.error);
    if ('message' in body && body.message) return String(body.message);
  }
  if (response.error) return response.error;
  return null;
}

/**
 * Check if Paystack public key is configured.
 */
export function isPaystackConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  return !!key && key.length > 10 && key.startsWith('pk_');
}

/**
 * Validate environment config on first import.
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
    console.warn('[Paystack] NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set');
  } else if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.startsWith('pk_')) {
    console.warn('[Paystack] NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY does not start with pk_ (test key format)');
  } else {
    console.log('[Paystack] Public key is configured');
  }
}
