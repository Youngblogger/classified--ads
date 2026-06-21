'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { useWalletBalance, useInvalidateWallet, WALLET_QUERY_KEY } from '@/hooks/useWallet';
import {
  WalletBalanceCard,
  WalletTransactionList,
  FundWalletCard,
} from '@/components/wallet';

interface WalletTransaction {
  id: number;
  type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  status: string;
  payment_method: string;
  created_at: string;
  reference?: string;
  expires_at?: string;
}

interface Wallet {
  id: number;
  balance: string;
  pending_balance: string;
}

export default function WalletPage() {
  const queryClient = useQueryClient();
  const invalidateWallet = useInvalidateWallet();
  const { data: walletBalance, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const verifiedHandledRef = useRef(false);

  const fetchWallet = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const walletRes = await api.get('/wallet');
      if (walletRes?.data?.wallet) {
        setWallet(walletRes.data.wallet);
        setTransactions(walletRes.data.transactions?.data || walletRes.data.transactions || []);
        return walletRes.data.wallet;
      }
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 401) {
        console.warn('[Wallet] Unauthorized — auth token may be missing or expired');
      } else {
        console.error('[Wallet] Fetch failed:', err);
      }
    }

    if (showLoader) {
      setWallet({ id: 0, balance: '0.00', pending_balance: '0.00' });
      setTransactions([]);
    }
    return null;
  }, []);

  const { isAuthenticated: isAuth } = useAuthStore();

  useEffect(() => {
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!isAuth && !authToken) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    const reference = params.get('reference');

    if (verified === 'true' && reference && !verifiedHandledRef.current) {
      verifiedHandledRef.current = true;
      window.history.replaceState({}, '', '/dashboard/wallet');
      (async () => {
        try {
          const res = await api.post('/wallet/verify', { reference });
          if (res.status >= 200 && res.status < 300) {
            let credited = false;
            for (let i = 0; i < 20; i++) {
              await new Promise(r => setTimeout(r, 1500));
              queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
              try {
                const wr = await api.get('/wallet');
                if (wr.status === 401) break;
                const walletData = wr?.data?.wallet;
                const txns = wr?.data?.transactions?.data || wr?.data?.transactions || [];
                const match = txns.find((t: any) => t.reference === reference);

                if ((match?.status === 'success' || match?.status === 'completed' || match?.type === 'credit') && walletData) {
                  setWallet(walletData);
                  setTransactions(txns);
                  toast.success('Payment successful! Your wallet has been credited.', { duration: 5000 });
                  await refetchBalance();
                  credited = true;
                  break;
                }
              } catch {
                // Network error — continue polling
              }
            }

            if (!credited) {
              await fetchWallet(true);
              await refetchBalance();
              queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
            }
          } else if (res.status === 401) {
            console.warn('[Wallet] Payment verification skipped — auth token issue');
          } else {
            throw new Error(res.data?.message || 'Verification failed');
          }
        } catch (err: any) {
          console.error('[Wallet] Payment verification failed:', err?.response?.data || err?.message || err);
          toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Payment verification failed');
          await fetchWallet(true);
        }
        setLoading(false);
      })();
    } else {
      fetchWallet().then(() => setLoading(false));
    }
  // fetchWallet is stable via useCallback([]); other deps are only used inside async IIFE
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWallet]);

  const handleFund = async (amount: number) => {
    setFunding(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const uuid = authUser?.id || useAuthStore.getState().user?.id || '';
      console.log('[Wallet fund] API URL:', process.env.NEXT_PUBLIC_API_URL);
      const res = await api.post('/wallet/fund', {
        amount,
        method: 'paystack',
        user_id: uuid,
        email: authUser?.email || useAuthStore.getState().user?.email,
      });

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (error: any) {
      console.error('[Wallet fund error]', error?.response?.data || error?.message || error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setFunding(false);
    }
  };

  const handleRefreshTransaction = useCallback(async (reference: string) => {
    try {
      const res = await api.post('/wallet/verify', { reference });
      if (res.data.success || res.data.status === 'success') {
        toast.success('Payment confirmed!', { duration: 3000 });
        fetchWallet();
        invalidateWallet();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchWallet, invalidateWallet]);

  const displayBalance = walletBalance?.balance ?? parseFloat(wallet?.balance || '0') - parseFloat(wallet?.pending_balance || '0');
  const totalTransactions = transactions.length;

  return (
    <div className="space-y-3">
      <WalletBalanceCard
        balance={displayBalance}
        totalTransactions={totalTransactions}
        loading={loading || balanceLoading}
        title="Wallet"
        subtitle="Manage your wallet and view transactions"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 order-2 lg:order-1 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-3.5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Transaction History</h3>
            </div>

            <WalletTransactionList
              transactions={transactions}
              loading={loading}
              onRefreshTransaction={handleRefreshTransaction}
            />
          </motion.div>
        </div>

        <div className="order-1 lg:order-2 space-y-2">
          <FundWalletCard onFund={handleFund} loading={funding} />
        </div>
      </div>
    </div>
  );
}
