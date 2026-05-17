'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Wallet, ArrowUpRight, Clock, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

function formatAmount(value: number | string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function CountUp({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const started = useRef(false);

  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;

    const startTime = performance.now();
    const from = 0;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (value - from) * eased;
      setDisplayed(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayed(value);
      }
    }

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{formatAmount(displayed)}</span>;
}

interface WalletBalanceCardProps {
  balance: number;
  pendingBalance: number;
  totalTransactions: number;
  currency?: string;
  loading?: boolean;
}

export default function WalletBalanceCard({
  balance,
  pendingBalance,
  totalTransactions,
  loading,
}: WalletBalanceCardProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-4 bg-bg/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 p-5 text-white shadow-lg shadow-primary-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/[0.03] rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-white/15">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-primary-100/80 tracking-wide uppercase">
                Available Balance
              </span>
            </div>

            {loading ? (
              <div className="h-9 w-48 bg-white/10 rounded-lg animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold font-display tracking-tight mt-1">
                <CountUp value={balance} />
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[11px] text-emerald-100">
                <ArrowUpRight className="w-3 h-3" />
                <span>Ready to use</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
              Pending Balance
            </span>
          </div>

          {loading ? (
            <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold font-display text-gray-900 dark:text-white tracking-tight mt-1">
              {formatAmount(pendingBalance)}
            </p>
          )}

          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">Awaiting confirmation</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
              Total Transactions
            </span>
          </div>

          {loading ? (
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold font-display text-gray-900 dark:text-white tracking-tight mt-1">
              {totalTransactions}
            </p>
          )}

          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">All time history</p>
        </motion.div>
      </div>
    </div>
  );
}
