'use client';

import useSWR, { SWRConfiguration, SWRResponse, mutate as globalMutate } from 'swr';
import { api } from '@/lib/api';

const defaultFetcher = async (url: string) => {
  const res = await api.get(url);
  return res.data;
};

export const swrConfig: SWRConfiguration = {
  fetcher: defaultFetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 2,
  errorRetryInterval: 3000,
  keepPreviousData: true,
  shouldRetryOnError: (err) => {
    if (err?.response?.status === 404 || err?.response?.status === 401) return false;
    if (err?.response?.status === 429) return true;
    if (err?.response?.status >= 500) return true;
    return false;
 },
  onError: (err, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SWR] Fetch error for ${key}:`, err?.message);
    }
  },
};

export const cacheConfig = {
  staleTime: {
    homepage: 300_000,
    categories: 600_000,
    locations: 600_000,
    ads: 120_000,
    adDetail: 300_000,
    search: 60_000,
    notifications: 30_000,
    user: 120_000,
    boosts: 300_000,
    messages: 15_000,
  },
  revalidateTimings: {
    homepage: 300_000,
    notifications: 30_000,
    messages: 15_000,
  },
};

export function createCacheKey(base: string, params?: Record<string, any>): string {
  if (!params) return base;
  const sorted = Object.keys(params)
    .sort()
    .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map(k => `${k}=${params[k]}`)
    .join('&');
  return sorted ? `${base}?${sorted}` : base;
}

export function useCachedFetch<T = any>(
  key: string | null,
  config?: Partial<SWRConfiguration>
): SWRResponse<T, Error> {
  return useSWR<T>(key, {
    ...swrConfig,
    ...config,
  }) as SWRResponse<T, Error>;
}

export function useInfiniteCachedFetch<T = any>(
  getKey: (pageIndex: number, previousPageData: T | null) => string | null,
  config?: Partial<SWRConfiguration>
) {
  return useSWRInfinite<T>(getKey, {
    ...swrConfig,
    ...config,
  });
}

export function invalidateCache(key: string | (() => string)): void {
  const cacheKey = typeof key === 'function' ? key() : key;
  globalMutate(cacheKey);
}

export function invalidateCachePattern(pattern: RegExp): void {
  globalMutate(
    (key: string) => pattern.test(key),
    undefined,
    false
  );
}

import useSWRInfinite from 'swr/infinite';
