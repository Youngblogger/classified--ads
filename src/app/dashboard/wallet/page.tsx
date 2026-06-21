'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const fetchWallet = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    let fetched = false;
    try {
      const walletRes = await api.get('/wallet');
      if (walletRes?.data?.wallet) {
        setWallet(walletRes.data.wallet);
        setTransactions(walletRes.data.transactions?.data || walletRes.data.transactions || []);
        fetched = true;
        return walletRes.data.wallet;
      }
    } catch (err) {
      console.error('[Wallet] Laravel fetch failed, trying Supabase fallback:', err);
    }

    if (!fetched) {
      try {
        const { user: storeUser } = useAuthStore.getState();
        const storeId: unknown = storeUser?.id;
        if (storeId) {
          const supabaseUserId = typeof storeId === 'string' && (storeId as string).includes('-')
            ? storeId as string
            : (await supabase.auth.getUser().then(r => r.data?.user?.id).catch(() => null));
          if (supabaseUserId) {
            const { data: txns, error } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', supabaseUserId)
              .order('created_at', { ascending: false })
              .limit(100);
            if (!error && txns) {
              const balance = txns.reduce((acc: number, t: any) =>
                t.type === 'credit' ? acc + parseFloat(t.amount || '0') : acc - parseFloat(t.amount || '0'), 0
              );
              setWallet({ id: 0, balance: balance.toFixed(2), pending_balance: '0.00' });
              setTransactions(txns.map(t => ({
                id: 0, type: t.type, amount: t.amount, balance_before: '', balance_after: '',
                description: t.description || '', status: t.status, payment_method: '',
                created_at: t.created_at, reference: t.reference,
              })));
              fetched = true;
              return { balance: balance.toFixed(2) };
            }
          }
        }
      } catch (supaErr) {
        console.error('[Wallet] Supabase fallback failed:', supaErr);
      }
    }

    if (showLoader && !fetched) {
      setWallet({ id: 0, balance: '0.00', pending_balance: '0.00' });
      setTransactions([]);
    }
    return null;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    const reference = params.get('reference');

    if (verified === 'true' && reference) {
      window.history.replaceState({}, '', '/dashboard/wallet');
      (async () => {
        const initialWr = await fetchWallet(false);
        const initialBalance = initialWr ? parseFloat((initialWr as any).balance || '0') : 0;

        try {
          const res = await api.post('/wallet/verify', { reference });
          if (res.status >= 200 && res.status < 300) {
            invalidateWallet();
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });

            let credited = false;
            for (let i = 0; i < 20; i++) {
              await new Promise(r => setTimeout(r, 1500));
              try {
                await refetchBalance();

                const wr = await api.get('/wallet');
                const newBalance = parseFloat(wr?.data?.wallet?.balance || '0');
                const newTxns = wr?.data?.transactions?.data || wr?.data?.transactions || [];

                if (wr?.data?.wallet && newBalance !== initialBalance) {
                  setWallet(wr.data.wallet);
                  if (newTxns.length > 0) setTransactions(newTxns);
                  toast.success('Payment successful! Your wallet has been credited.', { duration: 5000 });
                  credited = true;
                  break;
                }

                const txnMatch = newTxns.find((t: any) => t.reference === reference && t.status === 'completed');
                if (txnMatch) {
                  setWallet(wr.data.wallet || { id: 0, balance: txnMatch.balance_after || '0.00', pending_balance: '0.00' });
                  if (newTxns.length > 0) setTransactions(newTxns);
                  toast.success('Payment confirmed! Your wallet has been credited.', { duration: 5000 });
                  credited = true;
                  break;
                }

                const storeId: unknown = useAuthStore.getState().user?.id;
                if (storeId) {
                  const uuid = typeof storeId === 'string' && (storeId as string).includes('-')
                    ? storeId as string
                    : (await supabase.auth.getUser().then(r => r.data?.user?.id).catch(() => null));
                  if (uuid) {
                    const { data: supTxn } = await supabase
                      .from('transactions')
                      .select('amount, type, status, reference')
                      .eq('user_id', uuid)
                      .eq('reference', reference)
                      .maybeSingle();
                    if (supTxn && (supTxn.status === 'completed' || supTxn.type === 'credit')) {
                      const { data: allTxns } = await supabase
                        .from('transactions')
                        .select('*')
                        .eq('user_id', uuid)
                        .order('created_at', { ascending: false })
                        .limit(100);
                      if (allTxns) {
                        const bal = allTxns.reduce((acc: number, t: any) =>
                          t.type === 'credit' ? acc + parseFloat(t.amount || '0') : acc - parseFloat(t.amount || '0'), 0
                        );
                        setWallet({ id: 0, balance: bal.toFixed(2), pending_balance: '0.00' });
                        setTransactions(allTxns.map(t => ({
                          id: 0, type: t.type, amount: t.amount, balance_before: '', balance_after: '',
                          description: t.description || '', status: t.status, payment_method: '',
                          created_at: t.created_at, reference: t.reference,
                        })));
                      }
                      toast.success('Payment confirmed! Wallet updated from transactions.', { duration: 5000 });
                      credited = true;
                      break;
                    }
                  }
                }
              } catch {}
            }

            if (!credited) {
              await fetchWallet(true);
              await refetchBalance();
              invalidateWallet();
              toast.success('Payment confirmed! Refresh to see your updated balance.', { duration: 8000 });
            }
          } else {
            throw new Error(res.data?.message || 'Verification failed');
          }
        } catch (err: any) {
          console.error('[Wallet] Payment verification failed:', err?.response?.data || err?.message || err);
          toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Payment verification failed');
          fetchWallet(true);
        }
      })();
    } else {
      fetchWallet().then(() => setLoading(false));
    }
  }, [fetchWallet, invalidateWallet, refetchBalance, queryClient]);

  const handleFund = async (amount: number) => {
    setFunding(true);
    try {
      const { user } = useAuthStore.getState();
      console.log('[Wallet fund] API URL:', process.env.NEXT_PUBLIC_API_URL);
      const res = await api.post('/wallet/fund', {
        amount,
        method: 'paystack',
        user_id: user?.id,
        email: user?.email,
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
