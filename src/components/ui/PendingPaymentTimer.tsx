'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface PendingPaymentTimerProps {
  expiresAt: string;
  created_at: string;
  onExpired?: () => void;
  compact?: boolean;
}

export default function PendingPaymentTimer({ expiresAt, created_at, onExpired, compact }: PendingPaymentTimerProps) {
  const [remaining, setRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    const calcRemaining = () => {
      const expires = new Date(expiresAt).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((expires - now) / 1000));
    };

    setRemaining(calcRemaining());

    const interval = setInterval(() => {
      const secs = calcRemaining();
      setRemaining(secs);
      if (secs <= 0 && !isExpired) {
        setIsExpired(true);
        onExpiredRef.current?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (isExpired) {
    return (
      <span className={`inline-flex items-center gap-1 ${compact ? 'text-[10px]' : 'text-xs'} text-red-600 font-medium`}>
        <AlertTriangle className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        Expired
      </span>
    );
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const isUrgent = remaining <= 120;

  const formatCreated = () => {
    const d = new Date(created_at);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 ${isUrgent ? 'text-red-500' : 'text-amber-600'} text-[10px] font-medium`}>
        <Clock className="w-3 h-3" />
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      isUrgent ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' : 'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>
      <Clock className="w-3.5 h-3.5" />
      <span>{mins}:{secs.toString().padStart(2, '0')} remaining</span>
      <span className="text-gray-400">·</span>
      <span className="text-gray-500">Pending since {formatCreated()}</span>
    </div>
  );
}
