'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Wallet } from 'lucide-react';
import {
  WalletBalanceCard,
  WalletTransactionList,
  PendingPaymentCard,
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

  const fetchWallet = useCallback(async () => {
    const timeoutId = setTimeout(() => setLoading(false), 10000);
    try {
      setLoading(true);
      const [walletRes, paymentsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/payments/pending').catch(() => ({ data: { data: [] } })),
      ]);
      clearTimeout(timeoutId);
      setWallet(walletRes.data.wallet);
      setTransactions(walletRes.data.transactions?.data || walletRes.data.transactions || []);
      setPendingPayments(paymentsRes.data?.data || []);
    } catch {
      clearTimeout(timeoutId);
      setWallet({ id: 0, balance: '0.00', pending_balance: '0.00' });
      setTransactions([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
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

  const handlePaymentExpired = useCallback((payment: PendingPayment) => {
    toast.error(`Payment of ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(payment.amount)} has expired`, { duration: 5000 });
    fetchWallet();
  }, [fetchWallet]);

  const balance = parseFloat(wallet?.balance || '0');
  const pendingBalance = parseFloat(wallet?.pending_balance || '0');

  const activePendingPayments = pendingPayments.filter((p) => p.status === 'pending');

  return (
    <div className="space-y-6">
      <WalletBalanceCard
        balance={balance}
        pendingBalance={pendingBalance}
        totalTransactions={transactions.length}
        loading={loading}
        title="Wallet"
        subtitle="Manage your wallet and view transactions"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Transaction History</h3>
            </div>

            <WalletTransactionList transactions={transactions} loading={loading} />
          </motion.div>
        </div>

        <div className="space-y-5">
          <FundWalletCard onFund={handleFund} loading={funding} />

          <AnimatePresence>
            {activePendingPayments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-500/10">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Pending Payments ({activePendingPayments.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {activePendingPayments.map((payment) => (
                    <PendingPaymentCard
                      key={payment.id}
                      payment={payment}
                      onExpired={handlePaymentExpired}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
