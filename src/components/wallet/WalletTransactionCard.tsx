'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Download,
  Copy,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Megaphone,
  Undo2,
} from 'lucide-react';
import clsx from 'clsx';
import StatusBadge from './StatusBadge';
import toast from 'react-hot-toast';

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

function formatAmount(value: string | number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(Number(value));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    full: d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

const typeIcons: Record<string, { icon: typeof ArrowUpRight; bg: string; text: string; label: string; sign: 'positive' | 'negative' }> = {
  deposit: {
    icon: ArrowDownLeft,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Deposit',
    sign: 'positive',
  },
  withdrawal: {
    icon: ArrowUpRight,
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    label: 'Withdrawal',
    sign: 'negative',
  },
  promotion: {
    icon: Megaphone,
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    label: 'Promotion',
    sign: 'negative',
  },
  refund: {
    icon: Undo2,
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Refund',
    sign: 'positive',
  },
  payment: {
    icon: ArrowUpRight,
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    label: 'Payment',
    sign: 'negative',
  },
};

function getTypeConfig(type: string) {
  return typeIcons[type] || {
    icon: RefreshCw,
    bg: 'bg-gray-50 dark:bg-gray-500/10',
    text: 'text-gray-600 dark:text-gray-400',
    label: type,
    sign: 'neutral' as const,
  };
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Reference ID copied');
  });
}

interface WalletTransactionCardProps {
  transaction: WalletTransaction;
  index?: number;
}

export default function WalletTransactionCard({ transaction, index = 0 }: WalletTransactionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = getTypeConfig(transaction.type);
  const Icon = typeConfig.icon;
  const formatted = formatDate(transaction.created_at);
  const txRef = transaction.reference || `TXN-${String(transaction.id).padStart(8, '0')}`;
  const amountNum = parseFloat(transaction.amount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      layout
      className={clsx(
        'group rounded-xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/80',
        'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:border-gray-200 dark:hover:border-gray-600',
        'transition-all duration-200',
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', typeConfig.bg)}>
            <Icon className={clsx('w-5 h-5', typeConfig.text)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                {typeConfig.label}
              </span>
              <StatusBadge status={transaction.status} size="sm" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {transaction.description || typeConfig.label}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{formatted.full}</p>
          </div>

          <div className="text-right shrink-0">
            <p
              className={clsx(
                'text-sm font-bold',
                typeConfig.sign === 'positive'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : typeConfig.sign === 'negative'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-white',
              )}
            >
              {typeConfig.sign === 'positive' ? '+' : typeConfig.sign === 'negative' ? '-' : ''}
              {formatAmount(amountNum)}
            </p>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-gray-50 dark:border-gray-700/40">
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reference ID</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <code className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">{txRef}</code>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(txRef); }}
                      className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Payment Method</p>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5 capitalize">
                    {transaction.payment_method || 'Wallet'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date & Time</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{formatted.date}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{formatted.time}</p>
                </div>

                <div>
                  <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Amount</p>
                  <p
                    className={clsx(
                      'text-xs font-bold mt-0.5',
                      typeConfig.sign === 'positive'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : typeConfig.sign === 'negative'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-900 dark:text-white',
                    )}
                  >
                    {formatAmount(amountNum)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); toast.success('Receipt download started'); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Receipt
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
