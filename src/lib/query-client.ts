import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_SECONDS = 1000 * 30;

declare global {
  interface Window {
    __queryClient?: QueryClient;
  }
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: THIRTY_SECONDS,
        gcTime: FIVE_MINUTES,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let globalQueryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  if (!globalQueryClient) {
    globalQueryClient = window.__queryClient || createQueryClient();
    window.__queryClient = globalQueryClient;
  }
  return globalQueryClient;
}

export function resetQueryClient(): void {
  if (globalQueryClient) {
    globalQueryClient.clear();
  }
}

export function handleMutationError(error: any): void {
  const message =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong';
  toast.error(message);
}
