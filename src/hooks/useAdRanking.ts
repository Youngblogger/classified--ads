'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { sortAdsByBoostPriority } from '@/lib/boost-config';

const RE_RANK_INTERVAL = 300000;

function idsChanged<T extends { id?: number | string }>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.id !== b[i]?.id) return true;
  }
  return false;
}

export function useAdRanking<T extends {
  id?: number | string;
  is_boosted?: boolean;
  boost_type?: string | null;
  boost_plan?: string | null;
  boost_status?: string | null;
  boost_expires_at?: string | null;
  boost_views_today?: number;
  max_daily_boost_views?: number;
  views?: number;
  created_at?: string;
}>(ads: T[]): T[] {
  const [ranked, setRanked] = useState<T[]>(() => sortAdsByBoostPriority(ads));
  const dataRef = useRef(ads);

  useEffect(() => {
    if (idsChanged(ads, dataRef.current)) {
      dataRef.current = ads;
      setRanked(sortAdsByBoostPriority(ads));
    }
  }, [ads]);

  const reRank = useCallback(() => {
    setRanked(prev => sortAdsByBoostPriority(prev));
  }, []);

  useEffect(() => {
    const id = setInterval(reRank, RE_RANK_INTERVAL);
    return () => clearInterval(id);
  }, [reRank]);

  return ranked;
}
