'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Receipt, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import WalletTransactionCard from './WalletTransactionCard';
import FilterTabs from './FilterTabs';

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

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'successful', label: 'Successful' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

const successStatuses = ['completed', 'success'];
const pendingStatuses = ['pending'];
const failedStatuses = ['failed', 'expired'];

interface WalletTransactionListProps {
  transactions: WalletTransaction[];
  loading?: boolean;
}

function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/80 p-4"
        >
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

export default function WalletTransactionList({ transactions, loading }: WalletTransactionListProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
        ? transactions.length
        : tab.key === 'successful'
          ? transactions.filter((tx) => successStatuses.includes(tx.status)).length
          : tab.key === 'pending'
            ? transactions.filter((tx) => pendingStatuses.includes(tx.status)).length
            : transactions.filter((tx) => failedStatuses.includes(tx.status)).length,
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-full bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        <TransactionSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 flex-wrap">
        {/* Desktop: pill tabs */}
        <div className="hidden sm:block">
          <FilterTabs tabs={tabsWithCounts} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Mobile: dropdown select */}
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
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>

        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all w-full sm:w-56"
          />
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            {filteredTransactions.map((tx, i) => (
              <WalletTransactionCard key={tx.id} transaction={tx} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
