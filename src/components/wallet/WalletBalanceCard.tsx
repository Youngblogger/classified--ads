'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Wallet, ArrowUpRight, TrendingUp } from 'lucide-react';

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
  totalTransactions: number;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export default function WalletBalanceCard({
  balance,
  totalTransactions,
  loading,
  title,
  subtitle,
}: WalletBalanceCardProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-1 pb-1 bg-bg/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      {title && (
        <div className="mb-1">
          <h1 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="flex sm:grid sm:grid-cols-2 gap-1.5 sm:gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 p-2.5 sm:p-5 text-white shadow-lg shadow-primary-500/20 shrink-0 w-[45vw] sm:w-auto snap-start"
        >
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-32 sm:h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-24 sm:h-24 bg-white/[0.03] rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
              <div className="p-0.5 sm:p-1.5 rounded-lg bg-white/15">
                <Wallet className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[9px] sm:text-[11px] font-medium text-primary-100/80 tracking-wide uppercase">
                Balance
              </span>
            </div>

            {loading ? (
              <div className="h-4 sm:h-9 w-20 sm:w-48 bg-white/10 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-sm sm:text-2xl md:text-3xl font-bold font-display tracking-tight mt-0.5">
                <CountUp value={balance} />
              </p>
            )}

            <div className="flex items-center gap-1 mt-0.5 sm:mt-1.5">
              <div className="flex items-center gap-0.5 px-1 sm:px-2 py-0.5 rounded-full bg-white/10 text-[9px] sm:text-[11px] text-emerald-100">
                <ArrowUpRight className="w-2 h-2.5 sm:w-3 sm:h-3" />
                <span>Ready</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-2.5 sm:p-5 shadow-sm shrink-0 w-[45vw] sm:w-auto snap-start"
        >
          <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
            <div className="p-0.5 sm:p-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <TrendingUp className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-[9px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
              Transactions
            </span>
          </div>

          {loading ? (
            <div className="h-4 sm:h-9 w-12 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-0.5" />
          ) : (
            <p className="text-sm sm:text-xl md:text-2xl font-bold font-display text-gray-900 dark:text-white tracking-tight mt-0.5">
              {totalTransactions}
            </p>
          )}

          <p className="text-[9px] sm:text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1.5">All time</p>
        </motion.div>
      </div>
    </div>
  );
}
