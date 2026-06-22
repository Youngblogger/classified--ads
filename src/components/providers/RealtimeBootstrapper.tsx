'use client';

import { useBoostedListingsRealtime, useRealtimeAds, useRealtimeHomepage } from '@/hooks/useRealtime';

export default function RealtimeBootstrapper() {
  useRealtimeAds();
  useRealtimeHomepage();
  useBoostedListingsRealtime();

  return null;
}
