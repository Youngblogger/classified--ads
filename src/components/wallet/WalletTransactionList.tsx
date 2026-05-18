'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Receipt, RefreshCw, Clock, RotateCw } from 'lucide-react';
import clsx from 'clsx';
import WalletTransactionCard from './WalletTransactionCard';
import FilterTabs from './FilterTabs';
import StatusBadge from './StatusBadge';

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

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'successful', label: 'Successful' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

const successStatuses = ['completed', 'success', 'successful', 'approved', 'confirmed', 'credited'];
const pendingStatuses = ['pending'];
const failedStatuses = ['failed', 'expired', 'declined', 'rejected'];

interface WalletTransactionListProps {
  transactions: WalletTransaction[];
  pendingPayments: PendingPayment[];
  loading?: boolean;
  onRefreshTransaction?: (reference: string) => Promise<boolean>;
}

function formatAmount(value: number | string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(Number(value));
}

function TransactionSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/80 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-5 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Receipt className="w-7 h-7 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No transactions yet</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
        Your transaction history will appear here once you make your first transaction
      </p>
    </motion.div>
  );
}

function PendingTransactionRow({
  payment,
  onRefresh,
}: {
  payment: PendingPayment;
  onRefresh: (ref: string) => void;
}) {
  const [remaining, setRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const expiredCalled = useRef(false);

  useEffect(() => {
    const calcRemaining = () => {
      const expires = new Date(payment.expires_at).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((expires - now) / 1000));
    };

    setRemaining(calcRemaining());

    const interval = setInterval(() => {
      const secs = calcRemaining();
      setRemaining(secs);
      if (secs <= 0 && !expiredCalled.current) {
        setIsExpired(true);
        expiredCalled.current = true;
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [payment.expires_at]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 120 && remaining > 0;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await onRefresh(payment.reference);
    setIsRefreshing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.3 } }}
      className={clsx(
        'rounded-xl border p-3 sm:p-4',
        isExpired
          ? 'bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
          : 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20',
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.2 }}
        >
          <div
            className={clsx(
              'w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center',
              isExpired
                ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
            )}
          >
            {isExpired ? (
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white capitalize">
              {payment.type === 'wallet_funding' ? 'Wallet Funding' : payment.type.replace('_', ' ')}
            </span>
            <StatusBadge status={isExpired ? 'expired' : 'pending'} size="sm" />
          </div>
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatAmount(payment.amount)}</p>
          <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
            {isExpired ? (
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-red-600 dark:text-red-400 font-medium">
                Payment expired
              </span>
            ) : isUrgent ? (
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-red-500 dark:text-red-400 font-medium animate-pulse">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {mins}:{secs.toString().padStart(2, '0')}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Pending {mins}:{secs.toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {!isExpired && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors shrink-0"
            title="Check payment status"
          >
            <RotateCw className={clsx('w-3.5 h-3.5 sm:w-4 sm:h-4', isRefreshing && 'animate-spin')} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default function WalletTransactionList({
  transactions,
  pendingPayments,
  loading,
  onRefreshTransaction,
}: WalletTransactionListProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const activePendingPayments = useMemo(
    () => pendingPayments.filter((p) => p.status === 'pending'),
    [pendingPayments],
  );

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    switch (activeTab) {
      case 'successful':
        filtered = filtered.filter((tx) => successStatuses.includes(tx.status));
        break;
      case 'pending':
        filtered = filtered.filter((tx) => pendingStatuses.includes(tx.status));
        break;
      case 'failed':
        filtered = filtered.filter((tx) => failedStatuses.includes(tx.status));
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(q) ||
          tx.type?.toLowerCase().includes(q) ||
          tx.reference?.toLowerCase().includes(q) ||
          tx.payment_method?.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [transactions, activeTab, searchQuery]);

  const tabsWithCounts = filterTabs.map((tab) => ({
    ...tab,
    count:
      tab.key === 'all'
        ? transactions.length + activePendingPayments.length
        : tab.key === 'pending'
          ? transactions.filter((tx) => pendingStatuses.includes(tx.status)).length + activePendingPayments.length
          : tab.key === 'successful'
            ? transactions.filter((tx) => successStatuses.includes(tx.status)).length
            : transactions.filter((tx) => failedStatuses.includes(tx.status)).length,
  }));

  const handleRefreshPending = async (ref: string) => {
    if (onRefreshTransaction) {
      await onRefreshTransaction(ref);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    if (activePendingPayments.length > 0 && onRefreshTransaction) {
      await Promise.all(activePendingPayments.map((p) => onRefreshTransaction(p.reference)));
    }
    setIsRefreshingAll(false);
  };

  const showPendingSection = activePendingPayments.length > 0 && (activeTab === 'all' || activeTab === 'pending');

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-8 w-full bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        <TransactionSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 flex-wrap">
        <div className="hidden sm:block">
          <FilterTabs tabs={tabsWithCounts} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="sm:hidden relative w-full">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
          >
            {tabsWithCounts.map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>

        <div className="flex items-center gap-1.5 sm:ml-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all w-full sm:w-44"
            />
          </div>
          {activePendingPayments.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleRefreshAll}
              disabled={isRefreshingAll}
              className="p-2 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors shrink-0"
              title="Refresh all pending"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', isRefreshingAll && 'animate-spin')} />
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + searchQuery}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {showPendingSection && (
            <div className="space-y-1.5 mb-2">
              <div className="flex items-center gap-1.5 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Pending ({activePendingPayments.length})
                </span>
              </div>
              <AnimatePresence>
                {activePendingPayments.map((payment) => (
                  <PendingTransactionRow
                    key={payment.id}
                    payment={payment}
                    onRefresh={handleRefreshPending}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredTransactions.length === 0 && !showPendingSection ? (
            <EmptyState />
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-1.5">
              {filteredTransactions.map((tx, i) => (
                <WalletTransactionCard key={tx.id} transaction={tx} index={i} onRefreshTransaction={onRefreshTransaction} />
              ))}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
