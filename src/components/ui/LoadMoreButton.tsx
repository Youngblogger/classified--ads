'use client';

interface LoadMoreButtonProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function LoadMoreButton({ loading, hasMore, onLoadMore }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  const handleClick = () => {
    if (!loading && hasMore) {
      onLoadMore();
    }
  };

  return (
    <div className="flex justify-center mt-6 sm:mt-8">
      <button
        onClick={handleClick}
        disabled={loading}
        className="
          group relative flex items-center justify-center gap-1.5 sm:gap-2
          px-5 sm:px-8 py-2.5 sm:py-3
          min-w-[120px] sm:min-w-[160px]
          bg-white border-2 border-gray-200 sm:border-slate-200 rounded-lg sm:rounded-xl
          text-xs sm:text-sm font-medium sm:font-semibold text-gray-600 sm:text-slate-700
          hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-60
          transition-all duration-200 shadow-sm hover:shadow-md
          active:scale-[0.98]
        "
      >
        {loading ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <span className="block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-bounce-seq" style={{ animationDelay: '0s' }} />
              <span className="block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-bounce-seq" style={{ animationDelay: '0.15s' }} />
              <span className="block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-bounce-seq" style={{ animationDelay: '0.3s' }} />
            </div>
            <span className="text-primary-600 font-medium">Loading...</span>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 sm:gap-2">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:rotate-180 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Load More
          </span>
        )}
      </button>
    </div>
  );
}
