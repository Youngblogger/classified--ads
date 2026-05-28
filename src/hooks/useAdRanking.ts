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

/**
 * Ranking formula:
 * rank_score = trust_score * 0.5 + rating * 0.2 + response_rate * 0.2 + listing_freshness * 0.1
 */
function calculateRankScore(ad: any): number {
  const trustScore = ad.user?.trust_score ?? ad.seller?.trust_score ?? 0;
  const rating = ad.user?.rating_avg ?? ad.seller?.rating_avg ?? 0;
  const responseRate = ad.user?.response_rate ?? ad.seller?.response_rate ?? 0;
  const freshnessDays = ad.created_at
    ? Math.floor((Date.now() - new Date(ad.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  const freshness = Math.max(0, 1 - freshnessDays / 30);

  return (
    trustScore * 0.5 +
    rating * 20 * 0.2 +
    responseRate * 0.2 +
    freshness * 0.1
  );
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
  user?: { trust_score?: number; rating_avg?: number; response_rate?: number };
}>(ads: T[]): T[] {
  const [ranked, setRanked] = useState<T[]>(() => {
    const withScores = ads.map(ad => ({
      ...ad,
      _trustRankScore: calculateRankScore(ad),
    }));
    return sortAdsByBoostPriority(withScores as any) as T[];
  });
  const dataRef = useRef(ads);

  useEffect(() => {
    if (idsChanged(ads, dataRef.current)) {
      dataRef.current = ads;
      const withScores = ads.map(ad => ({
        ...ad,
        _trustRankScore: calculateRankScore(ad),
      }));
      const sorted = sortAdsByBoostPriority(withScores as any) as T[];

      sorted.sort((a: any, b: any) => {
        const boostDiff = (b.is_boosted ? 1 : 0) - (a.is_boosted ? 1 : 0);
        if (boostDiff !== 0) return boostDiff;
        return (b._trustRankScore ?? 0) - (a._trustRankScore ?? 0);
      });

      setRanked(sorted);
    }
  }, [ads]);

  const reRank = useCallback(() => {
    setRanked(prev => {
      const withScores = prev.map(ad => ({
        ...ad,
        _trustRankScore: calculateRankScore(ad),
      }));
      const sorted = sortAdsByBoostPriority(withScores as any) as T[];
      sorted.sort((a: any, b: any) => {
        const boostDiff = (b.is_boosted ? 1 : 0) - (a.is_boosted ? 1 : 0);
        if (boostDiff !== 0) return boostDiff;
        return (b._trustRankScore ?? 0) - (a._trustRankScore ?? 0);
      });
      return sorted;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(reRank, RE_RANK_INTERVAL);
    return () => clearInterval(id);
  }, [reRank]);

  return ranked;
}
