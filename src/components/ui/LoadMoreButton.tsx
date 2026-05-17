'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
}

export default function LoadMoreButton({ onClick, loading, hasMore }: LoadMoreButtonProps) {
  const btnRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);

  // Auto-trigger when button scrolls into view (like Jiji.ng)
  useEffect(() => {
    const el = btnRef.current;
    if (!el || !hasMore || loading || triggeredRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !triggeredRef.current) {
          triggeredRef.current = true;
          onClick();
        }
      },
      { rootMargin: '300px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onClick]);

  // Reset trigger when loading finishes
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => { triggeredRef.current = false; }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (!hasMore) {
    return (
      <div className="flex justify-center py-6 animate-fade-in">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="w-8 h-px bg-gray-200" />
          <span>You&apos;ve reached the end</span>
          <span className="w-8 h-px bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div ref={btnRef} className="flex justify-center py-6 animate-fade-in">
      <button
        onClick={onClick}
        disabled={loading}
        className="
          group relative inline-flex items-center gap-2.5
          h-[50px] px-8
          bg-white border-2 border-primary-500
          text-primary-600 font-semibold text-sm
          rounded-full
          hover:bg-primary-50
          hover:scale-[1.02]
          active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
          transition-all duration-200 ease-out
          will-change-transform
          cursor-pointer
        "
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more ads...</span>
          </>
        ) : (
          <>
            <span>Show more ads</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
          </>
        )}
      </button>
    </div>
  );
}
