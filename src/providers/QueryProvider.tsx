'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query-client';
import { useState, useEffect } from 'react';
import { listenForCrossTabSync, syncAllCaches } from '@/lib/cache-sync';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  useEffect(() => {
    const cleanup = listenForCrossTabSync(() => {
      syncAllCaches(queryClient);
    });
    return cleanup;
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
