'use client';

interface SkeletonProps {
  className?: string;
}

export function AdCardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`card ${className}`}>
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="flex items-center gap-2 pt-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
        </div>
      </div>
    </div>
  );
}

export function AdGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AdCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="text-3xl mb-2">
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>
      <div className="h-5 bg-gray-200 rounded animate-pulse w-20 mx-auto" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto mt-2" />
    </div>
  );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  );
}
