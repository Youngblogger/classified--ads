'use client';

import { memo, type ComponentType } from 'react';
import { Inbox, Search, FileText, PackageOpen, RefreshCw } from 'lucide-react';

type EmptyIcon = 'inbox' | 'search' | 'file' | 'package' | 'refresh';

const ICON_MAP: Record<EmptyIcon, ComponentType<{ className?: string }>> = {
  inbox: Inbox,
  search: Search,
  file: FileText,
  package: PackageOpen,
  refresh: RefreshCw,
};

interface EmptyStateProps {
  icon?: EmptyIcon;
  customIcon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

function EmptyStateComponent({
  icon = 'inbox',
  customIcon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  const Icon = customIcon || ICON_MAP[icon];

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.97]"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-all active:scale-[0.97]"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export const EmptyState = memo(EmptyStateComponent);
