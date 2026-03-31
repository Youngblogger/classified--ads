'use client';

import { memo } from 'react';

const shimmerClass = "relative overflow-hidden bg-gray-200";
const shimmerOverlay = "absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200";

export const AdCardSkeleton = memo(function AdCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className={`aspect-[4/3] ${shimmerClass}`}>
        <div className={shimmerOverlay} />
      </div>
      <div className="p-4 space-y-3">
        <div className={`h-6 ${shimmerClass} rounded-lg w-3/4`}>
          <div className={shimmerOverlay} />
        </div>
        <div className={`h-5 ${shimmerClass} rounded-lg w-1/2`}>
          <div className={shimmerOverlay} />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className={`h-4 w-4 ${shimmerClass} rounded-full`}>
            <div className={shimmerOverlay} />
          </div>
          <div className={`h-4 ${shimmerClass} rounded-lg w-20`}>
            <div className={shimmerOverlay} />
          </div>
        </div>
      </div>
    </div>
  );
});

export const AdGridSkeleton = memo(function AdGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: number }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns] || 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  
  return (
    <div className={`grid ${gridCols} gap-4 md:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <AdCardSkeleton key={i} />
      ))}
    </div>
  );
});

export const CategorySkeleton = memo(function CategorySkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="text-3xl mb-2">
        <div className={`h-8 w-8 ${shimmerClass} rounded-lg mx-auto`}>
          <div className={shimmerOverlay} />
        </div>
      </div>
      <div className={`h-5 ${shimmerClass} rounded-lg w-20 mx-auto`}>
        <div className={shimmerOverlay} />
      </div>
      <div className={`h-4 ${shimmerClass} rounded-lg w-12 mx-auto mt-2`}>
        <div className={shimmerOverlay} />
      </div>
    </div>
  );
});

export const CategoryGridSkeleton = memo(function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  );
});

export function BannerSkeleton() {
  return (
    <div className={`w-full h-48 md:h-64 ${shimmerClass} rounded-xl`}>
      <div className={shimmerOverlay} />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 h-[400px] md:h-[500px]">
      <div className={`absolute inset-0 ${shimmerClass} opacity-20`}>
        <div className={shimmerOverlay} />
      </div>
    </div>
  );
}

export function AdDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-1">
      <div className="mb-4 flex items-center gap-2">
        <div className={`h-4 ${shimmerClass} rounded w-16`}>
          <div className={shimmerOverlay} />
        </div>
        <div className={`h-4 w-4 ${shimmerClass} rounded`}>
          <div className={shimmerOverlay} />
        </div>
        <div className={`h-4 ${shimmerClass} rounded w-24`}>
          <div className={shimmerOverlay} />
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`aspect-[4/3] ${shimmerClass} rounded-t-2xl`}>
              <div className={shimmerOverlay} />
            </div>
            <div className="flex gap-2 p-2 overflow-x-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-20 h-16 flex-shrink-0 ${shimmerClass} rounded-xl`}>
                  <div className={shimmerOverlay} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="space-y-4">
              <div className={`h-8 ${shimmerClass} rounded-lg w-3/4`}>
                <div className={shimmerOverlay} />
              </div>
              <div className="flex items-center gap-4">
                <div className={`h-5 ${shimmerClass} rounded-lg w-32`}>
                  <div className={shimmerOverlay} />
                </div>
                <div className={`h-5 ${shimmerClass} rounded-lg w-24`}>
                  <div className={shimmerOverlay} />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className={`h-6 ${shimmerClass} rounded-lg w-1/4 mb-3`}>
                  <div className={shimmerOverlay} />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`h-4 ${shimmerClass} rounded-lg w-full`}>
                      <div className={shimmerOverlay} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="space-y-4">
              <div className={`h-10 ${shimmerClass} rounded-xl w-full`}>
                <div className={shimmerOverlay} />
              </div>
              <div className={`h-10 ${shimmerClass} rounded-xl w-full`}>
                <div className={shimmerOverlay} />
              </div>
              <div className={`h-12 ${shimmerClass} rounded-xl w-full`}>
                <div className={shimmerOverlay} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 ${shimmerClass} rounded-full`}>
                <div className={shimmerOverlay} />
              </div>
              <div className="flex-1">
                <div className={`h-5 ${shimmerClass} rounded-lg w-32 mb-2`}>
                  <div className={shimmerOverlay} />
                </div>
                <div className={`h-4 ${shimmerClass} rounded-lg w-24`}>
                  <div className={shimmerOverlay} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className={`h-4 ${shimmerClass} rounded`}>
            <div className={shimmerOverlay} />
          </div>
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="py-3 px-4 text-left">
                <div className={`h-4 ${shimmerClass} rounded w-20`}>
                  <div className={shimmerOverlay} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}>
      <div className="space-y-4">
        <div className={`h-6 ${shimmerClass} rounded-lg w-1/3`}>
          <div className={shimmerOverlay} />
        </div>
        <div className={`h-4 ${shimmerClass} rounded-lg w-full`}>
          <div className={shimmerOverlay} />
        </div>
        <div className={`h-4 ${shimmerClass} rounded-lg w-3/4`}>
          <div className={shimmerOverlay} />
        </div>
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className={`h-4 ${shimmerClass} rounded-lg w-16`}>
            <div className={shimmerOverlay} />
          </div>
          <div className={`h-8 ${shimmerClass} rounded-lg w-24`}>
            <div className={shimmerOverlay} />
          </div>
        </div>
        <div className={`w-12 h-12 ${shimmerClass} rounded-xl`}>
          <div className={shimmerOverlay} />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
      <div className={`w-12 h-12 ${shimmerClass} rounded-lg`}>
        <div className={shimmerOverlay} />
      </div>
      <div className="flex-1 space-y-2">
        <div className={`h-4 ${shimmerClass} rounded-lg w-3/4`}>
          <div className={shimmerOverlay} />
        </div>
        <div className={`h-3 ${shimmerClass} rounded-lg w-1/2`}>
          <div className={shimmerOverlay} />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className={`h-4 ${shimmerClass} rounded-lg w-24`}>
          <div className={shimmerOverlay} />
        </div>
        <div className={`h-10 ${shimmerClass} rounded-lg w-full`}>
          <div className={shimmerOverlay} />
        </div>
      </div>
      <div className="space-y-2">
        <div className={`h-4 ${shimmerClass} rounded-lg w-24`}>
          <div className={shimmerOverlay} />
        </div>
        <div className={`h-10 ${shimmerClass} rounded-lg w-full`}>
          <div className={shimmerOverlay} />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className={`w-20 h-20 ${shimmerClass} rounded-full`}>
          <div className={shimmerOverlay} />
        </div>
        <div className="space-y-2">
          <div className={`h-6 ${shimmerClass} rounded-lg w-32`}>
            <div className={shimmerOverlay} />
          </div>
          <div className={`h-4 ${shimmerClass} rounded-lg w-24`}>
            <div className={shimmerOverlay} />
          </div>
        </div>
      </div>
      <FormSkeleton />
    </div>
  );
}
