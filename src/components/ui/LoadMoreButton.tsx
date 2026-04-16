'use client';

interface LoadMoreButtonProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function LoadMoreButton({ loading, hasMore, onLoadMore }: LoadMoreButtonProps) {
  if (!hasMore && !loading) {
    return (
      <div className="flex justify-center mt-6 sm:mt-8">
        <p className="text-gray-400 text-sm">No more ads to load</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-6 sm:mt-8">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className={`
          flex items-center justify-center gap-2
          px-8 py-3
          bg-primary-600 text-white rounded-xl font-medium
          hover:bg-primary-700 transition-all
          disabled:opacity-70 disabled:cursor-not-allowed
          shadow-sm hover:shadow-md
          ${loading ? 'animate-pulse' : ''}
        `}
      >
        {loading ? (
          <>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>Loading...</span>
          </>
        ) : (
          <span>Load More Ads</span>
        )}
      </button>
    </div>
  );
}
