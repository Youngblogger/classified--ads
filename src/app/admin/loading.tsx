'use client';

import { StatsCardSkeleton, CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
