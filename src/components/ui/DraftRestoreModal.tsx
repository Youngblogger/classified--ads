'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, RefreshCw, Trash2, Clock } from 'lucide-react';
import { getDraft, type PostAdDraft } from '@/hooks/usePostAdDraft';

interface DraftRestoreModalProps {
  isOpen: boolean;
  draft: PostAdDraft | null;
  onContinue: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

function calcCompletion(draft: PostAdDraft): { pct: number } {
  let score = 0;
  const total = 4;
  if (draft.categoryId) score++;
  if (draft.title && draft.title.length > 5) score++;
  if (draft.images && draft.images.length > 0) score++;
  if (draft.description && draft.description.length > 20) score++;
  return { pct: Math.round((score / total) * 100) };
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DraftRestoreModal({ isOpen, draft, onContinue, onDiscard }: DraftRestoreModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleContinue = useCallback(() => {
    setIsVisible(false);
    setTimeout(onContinue, 200);
  }, [onContinue]);

  const handleDiscard = useCallback(() => {
    setIsVisible(false);
    setTimeout(onDiscard, 200);
  }, [onDiscard]);

  if (!isOpen || !draft) return null;

  const { pct } = calcCompletion(draft);
  const checks = [
    { label: 'Category selected', done: !!draft.categoryId },
    { label: 'Title entered', done: !!(draft.title && draft.title.length > 5) },
    { label: 'Photos uploaded', done: !!(draft.images && draft.images.length > 0) },
    { label: 'Description written', done: !!(draft.description && draft.description.length > 20) },
  ];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleDiscard(); }}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full mx-auto overflow-hidden transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-1">
            Continue your draft?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
            You have an unfinished listing from {timeAgo(draft.savedAt)}. Pick up where you left off?
          </p>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion</span>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="space-y-1.5">
              {checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    check.done ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-600 text-gray-400'
                  }`}>
                    {check.done ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-[10px] font-bold">&bull;</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${check.done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDiscard}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Discard
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Continue
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1.5 justify-center">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              Draft auto-expires after 3 days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
