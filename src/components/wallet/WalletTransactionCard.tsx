'use client';

import { useState, useEffect, useRef } from 'react';
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
  RotateCw,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import StatusBadge from './StatusBadge';
import toast from 'react-hot-toast';
import { downloadReceipt } from '@/lib/receipt';

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

function getDescription(tx: WalletTransaction): string {
  const desc = tx.description?.toLowerCase() || '';
  if (desc && !desc.includes('wallet funding pending') && !desc.includes('pending') && tx.status === 'success') {
    return tx.description;
  }
  if (tx.type === 'deposit') {
    if (tx.status === 'success' || tx.status === 'completed') {
      return `Wallet funding via ${tx.payment_method === 'paystack' ? 'Paystack' : 'Wallet transfer'}`;
    }
    return 'Wallet funding - pending confirmation';
  }
  if (tx.type === 'payment') {
    if (tx.status === 'success' || tx.status === 'completed') {
      return 'Payment for ad listing';
    }
    return 'Payment for ad listing - pending';
  }
  if (tx.type === 'promotion') {
    return 'Ad promotion boost';
  }
  if (tx.type === 'refund') {
    return 'Payment refund';
  }
  if (tx.type === 'withdrawal') {
    if (tx.status === 'success' || tx.status === 'completed') {
      return 'Withdrawal to bank account';
    }
    return 'Withdrawal request - pending';
  }
  return tx.description || `${tx.type} transaction`;
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

const pendingLike = ['pending', 'processing', 'awaiting_confirmation'];

interface WalletTransactionCardProps {
  transaction: WalletTransaction;
  index?: number;
  onRefreshTransaction?: (reference: string) => Promise<boolean>;
}

export default function WalletTransactionCard({ transaction, index = 0, onRefreshTransaction }: WalletTransactionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [flashGreen, setFlashGreen] = useState(false);

  const typeConfig = getTypeConfig(transaction.type);
  const Icon = typeConfig.icon;
  const formatted = formatDate(transaction.created_at);
  const txRef = transaction.reference || `TXN-${String(transaction.id).padStart(8, '0')}`;
  const amountNum = parseFloat(transaction.amount);
  const displayStatus = localStatus || transaction.status;
  const isPendingLike = pendingLike.includes(displayStatus);

  const isCoolingDown = cooldown > 0;

  useEffect(() => {
    if (!isCoolingDown) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [isCoolingDown]);

  useEffect(() => {
    setLocalStatus(null);
    setFlashGreen(false);
  }, [transaction.status]);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRefreshing || cooldown > 0 || !onRefreshTransaction || !txRef) return;

    setIsRefreshing(true);
    const confirmed = await onRefreshTransaction(txRef);
    setIsRefreshing(false);

    if (confirmed) {
      setLocalStatus('success');
      setFlashGreen(true);
      setTimeout(() => setFlashGreen(false), 1200);
      setCooldown(0);
    } else {
      setCooldown(5);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      layout
      className={clsx(
        'group rounded-xl border bg-white dark:bg-gray-800/80',
        'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:border-gray-200 dark:hover:border-gray-600',
        'transition-all duration-200',
        flashGreen
          ? 'border-emerald-300 dark:border-emerald-500/40 shadow-emerald-100 dark:shadow-emerald-500/10'
          : 'border-gray-100 dark:border-gray-700/60',
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 sm:p-4"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div
            animate={flashGreen ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className={clsx(
              'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0',
              flashGreen
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : typeConfig.bg,
            )}
          >
            <motion.div
              key={displayStatus}
              initial={flashGreen ? { scale: 0, rotate: -90 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {flashGreen ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Icon className={clsx('w-4 h-4 sm:w-5 sm:h-5', typeConfig.text)} />
              )}
            </motion.div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white capitalize">
                {typeConfig.label}
              </span>
              <StatusBadge status={displayStatus} size="sm" />
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate leading-tight">
              {getDescription(transaction)}
            </p>
            <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{formatted.full}</p>
          </div>

          <div className="text-right shrink-0">
            <p
              className={clsx(
                'text-xs sm:text-sm font-bold',
                flashGreen
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : typeConfig.sign === 'positive'
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
            className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors shrink-0"
          >
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            <div className={clsx(
              'px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t',
              flashGreen
                ? 'border-emerald-100 dark:border-emerald-500/20'
                : 'border-gray-50 dark:border-gray-700/40',
            )}>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
                <div>
                  <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reference</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <code className="text-[10px] sm:text-xs font-mono text-gray-700 dark:text-gray-300 truncate">{txRef}</code>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(txRef); }}
                      className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
                    >
                      <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Method</p>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5 capitalize">
                    {transaction.payment_method || 'Wallet'}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date</p>
                  <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mt-0.5">{formatted.date}</p>
                  <p className="text-[9px] sm:text-[11px] text-gray-500 dark:text-gray-400">{formatted.time}</p>
                </div>

                <div>
                  <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Amount</p>
                  <p
                    className={clsx(
                      'text-[10px] sm:text-xs font-bold mt-0.5',
                      flashGreen
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : typeConfig.sign === 'positive'
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

              <div className="flex items-center gap-2 mt-2 sm:mt-4">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (downloading) return;
                    setDownloading(true);
                    try {
                      await downloadReceipt({
                        reference: txRef,
                        type: transaction.type,
                        amount: transaction.amount,
                        status: displayStatus,
                        payment_method: transaction.payment_method,
                        created_at: transaction.created_at,
                        description: getDescription(transaction),
                      });
                      toast.success('Receipt downloaded successfully');
                    } catch {
                      toast.error('Failed to generate receipt, try again');
                    } finally {
                      setDownloading(false);
                    }
                  }}
                  disabled={downloading}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors disabled:opacity-60"
                >
                  {downloading ? (
                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  )}
                  {downloading ? 'Generating...' : 'Receipt'}
                </button>

                {isPendingLike && onRefreshTransaction && (
                  <div className="flex items-center gap-2 ml-auto">
                    {cooldown > 0 && !localStatus && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        Still awaiting confirmation...
                      </span>
                    )}
                    {localStatus !== 'success' && (
                      <motion.button
                        whileTap={cooldown === 0 ? { scale: 0.9 } : {}}
                        onClick={handleRefresh}
                        disabled={isRefreshing || cooldown > 0}
                        className={clsx(
                          'inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-all',
                          cooldown > 0
                            ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10',
                        )}
                        title={cooldown > 0 ? `Wait ${cooldown}s` : 'Check payment status'}
                      >
                        <motion.div
                          animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.2 }}
                        >
                          <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </motion.div>
                        {isRefreshing ? 'Checking...' : cooldown > 0 ? `${cooldown}s` : 'Refresh'}
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
