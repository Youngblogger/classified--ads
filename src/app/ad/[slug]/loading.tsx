'use client';

import { AdDetailSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <AdDetailSkeleton />
    </div>
  );
}
