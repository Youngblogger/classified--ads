'use client';

interface LoadMoreButtonProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function LoadMoreButton({ loading, hasMore, onLoadMore }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-10">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="
          group relative flex items-center justify-center gap-2.5
          px-8 py-3.5 min-w-[180px] h-12
          bg-white border-2 border-slate-200 rounded-xl
          font-semibold text-slate-700
          hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-70
          transition-all duration-200 shadow-sm hover:shadow-md
          active:scale-[0.98]
        "
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="block w-2 h-2 bg-primary-500 rounded-full animate-bounce-seq" style={{ animationDelay: '0s' }} />
              <span className="block w-2 h-2 bg-primary-500 rounded-full animate-bounce-seq" style={{ animationDelay: '0.15s' }} />
              <span className="block w-2 h-2 bg-primary-500 rounded-full animate-bounce-seq" style={{ animationDelay: '0.3s' }} />
            </div>
            <span className="text-primary-600 font-medium">Loading...</span>
          </div>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Load More
          </span>
        )}
      </button>
    </div>
  );
}
