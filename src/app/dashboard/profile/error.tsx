'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-8 text-center" role="alert">
      <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h3>
      <p className="text-sm text-gray-500 mb-4">{error.message || 'An unexpected error occurred on this page'}</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
