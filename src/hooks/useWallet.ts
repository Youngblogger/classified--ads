'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/lib/api';

export const WALLET_QUERY_KEY = ['wallet', 'balance'];

export function useWalletBalance() {
  return useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: async () => {
      const res = await walletApi.getBalance();
      const data = res.data?.data || res.data || {};
      const balance = Number(data.balance ?? 0);
      const pendingBalance = Number(data.pending_balance ?? data.pendingBalance ?? 0);
      const availableBalance = Math.max(0, balance - pendingBalance);
      return {
        balance,
        availableBalance,
        pendingBalance,
        currency: String(data.currency || 'NGN'),
      };
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useInvalidateWallet() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
}
