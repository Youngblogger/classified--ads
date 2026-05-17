'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  RefreshCw,
  AlertTriangle,
  LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';

type StatusVariant =
  | 'completed'
  | 'success'
  | 'pending'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'expired';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const statusConfig: Record<
  StatusVariant,
  { icon: LucideIcon; bg: string; text: string; dot: string; label: string }
> = {
  completed: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'Completed',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'Successful',
  },
  pending: {
    icon: Clock,
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  failed: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    label: 'Failed',
  },
  cancelled: {
    icon: Ban,
    bg: 'bg-gray-100 dark:bg-gray-500/10',
    text: 'text-gray-600 dark:text-gray-400',
    dot: 'bg-gray-400',
    label: 'Cancelled',
  },
  refunded: {
    icon: RefreshCw,
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
    label: 'Refunded',
  },
  expired: {
    icon: AlertTriangle,
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
    label: 'Expired',
  },
};

function getConfig(status: string) {
  if (statusConfig[status as StatusVariant]) {
    return statusConfig[status as StatusVariant];
  }
  const lower = status.toLowerCase();
  if (['successful', 'approved', 'confirmed', 'credited'].includes(lower)) {
    return statusConfig.success;
  }
  if (['failed', 'declined', 'rejected'].includes(lower)) {
    return statusConfig.failed;
  }
  if (['cancelled', 'canceled'].includes(lower)) {
    return statusConfig.cancelled;
  }
  return {
    icon: Clock,
    bg: 'bg-gray-100 dark:bg-gray-500/10',
    text: 'text-gray-600 dark:text-gray-400',
    dot: 'bg-gray-400',
    label: status.charAt(0).toUpperCase() + status.slice(1),
  };
}

export default function StatusBadge({ status, size = 'sm', showIcon = true }: StatusBadgeProps) {
  const config = getConfig(status);
  const Icon = config.icon;
  const isPending = status === 'pending';

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        isPending && 'animate-pulse',
      )}
    >
      <span className={clsx('rounded-full', config.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {config.label}
    </motion.span>
  );
}
