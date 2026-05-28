'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/lib/api';

export const WALLET_QUERY_KEY = ['wallet', 'balance'];

export function useWalletBalance() {
  return useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: async () => {
      const res = await walletApi.getBalance();
      return {
        balance: Number(res.data?.data?.balance ?? 0),
        availableBalance: Number(res.data?.data?.balance ?? 0),
        pendingBalance: 0,
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
