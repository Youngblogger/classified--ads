'use client';

import { useState } from 'react';

interface LoadMoreButtonProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function LoadMoreButton({ loading, hasMore, onLoadMore }: LoadMoreButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  if (!hasMore && !loading) {
    return (
      <div className="flex justify-center mt-4 sm:mt-6">
        <p className="text-gray-400 text-xs sm:text-sm">No more ads to load</p>
      </div>
    );
  }

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onLoadMore();
  };

  return (
    <div className="flex justify-center mt-4 sm:mt-6">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          flex items-center justify-center gap-2
          px-6 py-2.5 sm:px-8 sm:py-3
          bg-primary-600 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base
          hover:bg-primary-700 active:scale-95 transition-all duration-150
          disabled:opacity-70 disabled:cursor-not-allowed
          ${isPressed ? 'scale-95' : ''}
          ${loading ? 'animate-pulse' : ''}
        `}
      >
        {loading ? (
          <>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="hidden sm:inline">Loading...</span>
          </>
        ) : (
          <span>Load more</span>
        )}
      </button>
    </div>
  );
}
