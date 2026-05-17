'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, CreditCard, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

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

function formatAmount(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(value);
}

interface PendingPaymentCardProps {
  payment: PendingPayment;
  onExpired?: (payment: PendingPayment) => void;
}

export default function PendingPaymentCard({ payment, onExpired }: PendingPaymentCardProps) {
  const [remaining, setRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
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
        onExpired?.(payment);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [payment.expires_at, payment, onExpired]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 120 && remaining > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
      layout
      className={clsx(
        'flex items-center justify-between rounded-xl p-3 border',
        isExpired
          ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
          : isUrgent
            ? 'bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
            : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20',
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
            isExpired
              ? 'bg-red-100 dark:bg-red-500/10'
              : isUrgent
                ? 'bg-red-100 dark:bg-red-500/10'
                : 'bg-amber-100 dark:bg-amber-500/10',
          )}
        >
          {isExpired ? (
            <AlertTriangle className={clsx('w-4 h-4', isExpired ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')} />
          ) : (
            <CreditCard className={clsx('w-4 h-4', isUrgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')} />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
            {payment.type === 'wallet_funding' ? 'Wallet Funding' : `${payment.type.replace('_', ' ')} Payment`}
          </p>
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">{formatAmount(payment.amount)}</p>
          {isExpired ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
              <AlertTriangle className="w-3 h-3" />
              Expired
            </span>
          ) : (
            <span
              className={clsx(
                'inline-flex items-center gap-1 text-[11px] font-medium',
                isUrgent ? 'text-red-500 dark:text-red-400' : 'text-amber-600 dark:text-amber-400',
              )}
            >
              <Clock className={clsx('w-3 h-3', isUrgent && 'animate-pulse')} />
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {!isExpired && (
        <span
          className={clsx(
            'px-2 py-0.5 text-[10px] font-medium rounded-full',
            isUrgent
              ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
              : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
            'animate-pulse',
          )}
        >
          Pending
        </span>
      )}
    </motion.div>
  );
}
