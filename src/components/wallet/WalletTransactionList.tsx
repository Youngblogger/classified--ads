'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import WalletTransactionCard from './WalletTransactionCard';
import FilterTabs from './FilterTabs';
import { EmptyState } from '@/components/ui/EmptyState';

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

const successStatuses = ['completed', 'success', 'successful', 'approved', 'confirmed', 'credited'];
const pendingStatuses = ['pending'];
const failedStatuses = ['failed', 'expired', 'declined', 'rejected'];

interface WalletTransactionListProps {
  transactions: WalletTransaction[];
  loading?: boolean;
  onRefreshTransaction?: (reference: string) => Promise<boolean>;
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

function NairaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 9h12" />
      <path d="M6 15h12" />
    </svg>
  );
}

function EmptyTransactions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <EmptyState customIcon={NairaIcon} title="No transactions yet" description="Your transaction history will appear here once you make your first transaction" className="py-16" />
    </motion.div>
  );
}

export default function WalletTransactionList({
  transactions,
  loading,
  onRefreshTransaction,
}: WalletTransactionListProps) {
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
        : tab.key === 'pending'
          ? transactions.filter((tx) => pendingStatuses.includes(tx.status)).length
          : tab.key === 'successful'
            ? transactions.filter((tx) => successStatuses.includes(tx.status)).length
            : transactions.filter((tx) => failedStatuses.includes(tx.status)).length,
  }));

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
          {filteredTransactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            <div className="space-y-1.5">
              {filteredTransactions.map((tx, i) => (
                <WalletTransactionCard key={tx.id} transaction={tx} index={i} onRefreshTransaction={onRefreshTransaction} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
