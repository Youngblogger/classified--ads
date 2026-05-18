'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CreditCard, Banknote } from 'lucide-react';
import clsx from 'clsx';

function formatCommas(value: string): string {
  const parts = value.replace(/[^\d.]/g, '').split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

interface FundWalletCardProps {
  onFund: (amount: number) => Promise<void>;
  loading?: boolean;
}

const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

export default function FundWalletCard({ onFund, loading }: FundWalletCardProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const raw = parseFloat(amount.replace(/,/g, ''));
    if (!raw || raw < 100) {
      setError('Minimum amount is ₦100');
      return;
    }

    await onFund(raw);
  };

  const handleQuickAmount = (val: number) => {
    setAmount(String(val));
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-3.5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10">
          <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Fund Wallet</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-semibold text-sm">
              ₦
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0.00"
              value={formatCommas(amount)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
                  setAmount(raw);
                  setError('');
                }
              }}
              className={clsx(
                'w-full pl-8 pr-4 py-3 text-lg font-normal rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all',
                error ? 'border-red-300 dark:border-red-500' : 'border-gray-200 dark:border-gray-600',
              )}
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-red-500 dark:text-red-400 mt-1.5"
            >
              {error}
            </motion.p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quickAmounts.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleQuickAmount(val)}
              className={clsx(
                'px-4 py-2 text-base font-normal rounded-xl border transition-all',
                amount === String(val)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50',
              )}
            >
              ₦{val.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !amount}
          className={clsx(
            'w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
            'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Banknote className="w-4 h-4" />
              Fund Wallet
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
