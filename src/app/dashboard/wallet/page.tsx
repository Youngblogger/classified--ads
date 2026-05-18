'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
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

interface PendingPayment {
  id: number;
  type: string;
  amount: number;
  currency: string;
  reference: string;
  status: string;
  created_at: string;
  expires_at: string;
  remaining_seconds: number;
  ad_id?: number;
  wallet_id?: number;
}

interface Wallet {
  id: number;
  balance: string;
  pending_balance: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchWallet = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [walletRes, paymentsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/payments/pending').catch(() => ({ data: { data: [] } })),
      ]);
      setWallet(walletRes.data.wallet);
      setTransactions(walletRes.data.transactions?.data || walletRes.data.transactions || []);
      setPendingPayments(paymentsRes.data?.data || []);
    } catch {
      if (showLoader) {
        setWallet({ id: 0, balance: '0.00', pending_balance: '0.00' });
        setTransactions([]);
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    const reference = params.get('reference');

    if (verified === 'true' && reference) {
      window.history.replaceState({}, '', '/dashboard/wallet');
      setPendingPayments([]);
      api.post('/wallet/verify', { reference })
        .then(() => {
          toast.success('Payment successful! Your wallet has been credited.', { duration: 5000 });
          fetchWallet();
        })
        .catch(() => {
          toast.error('Payment verification failed');
        });
    } else {
      fetchWallet();
    }
  }, [fetchWallet]);

  useEffect(() => {
    if (pendingPayments.some((p) => p.status === 'pending')) {
      pollingRef.current = setInterval(() => {
        fetchWallet(false);
      }, 5000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [pendingPayments, fetchWallet]);

  const handleFund = async (amount: number) => {
    setFunding(true);
    try {
      const res = await api.post('/wallet/fund', {
        amount,
        method: 'paystack',
      });

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (error: any) {
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
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchWallet]);

  const balance = parseFloat(wallet?.balance || '0');
  const totalTransactions = transactions.length + pendingPayments.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-3">
      <WalletBalanceCard
        balance={balance}
        totalTransactions={totalTransactions}
        loading={loading}
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
              pendingPayments={pendingPayments}
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
