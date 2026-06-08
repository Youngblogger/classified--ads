'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { sortAdsByBoostPriority } from '@/lib/boost-config';
import { computeFinalRankingScore } from '@/lib/ranking-engine';

const RE_RANK_INTERVAL = 300000;

function idsChanged<T extends { id?: number | string }>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.id !== b[i]?.id) return true;
  }
  return false;
}

interface RankableAd {
  id?: number | string;
  is_boosted?: boolean;
  boost_type?: string | null;
  boost_plan?: string | null;
  boost_status?: string | null;
  boost_expires_at?: string | null;
  boost_views_today?: number;
  max_daily_boost_views?: number;
  views?: number;
  saves?: number;
  messages?: number;
  created_at?: string;
  condition?: string;
  images?: unknown[];
  image_url?: string;
  description?: string;
  price?: number | string;
  phone?: string;
  sellerPhone?: string;
  whatsapp?: string;
  specifications?: unknown[];
  attributes?: Record<string, unknown>;
  user?: {
    trust_score?: number;
    rating_avg?: number;
    response_rate?: number;
    is_verified_seller?: boolean;
  };
  seller?: {
    trust_score?: number;
    rating_avg?: number;
    response_rate?: number;
  };
};

export function useAdRanking<T extends RankableAd>(ads: T[]): T[] {
  const [ranked, setRanked] = useState<T[]>(() => {
    const withScores = ads.map(ad => ({
      ...ad,
      _rankingScore: computeFinalRankingScore(ad),
    }));
    return sortAdsByBoostPriority(withScores as any) as T[];
  });
  const dataRef = useRef(ads);

  useEffect(() => {
    if (idsChanged(ads, dataRef.current)) {
      dataRef.current = ads;
      const withScores = ads.map(ad => ({
        ...ad,
        _rankingScore: computeFinalRankingScore(ad),
      }));
      const sorted = sortAdsByBoostPriority(withScores as any) as T[];

      sorted.sort((a: any, b: any) => {
        const boostDiff = (b.is_boosted ? 1 : 0) - (a.is_boosted ? 1 : 0);
        if (boostDiff !== 0) return boostDiff;
        return (b._rankingScore ?? 0) - (a._rankingScore ?? 0);
      });

      setRanked(sorted);
    }
  }, [ads]);

  const reRank = useCallback(() => {
    setRanked(prev => {
      const withScores = prev.map(ad => ({
        ...ad,
        _rankingScore: computeFinalRankingScore(ad),
      }));
      const sorted = sortAdsByBoostPriority(withScores as any) as T[];
      sorted.sort((a: any, b: any) => {
        const boostDiff = (b.is_boosted ? 1 : 0) - (a.is_boosted ? 1 : 0);
        if (boostDiff !== 0) return boostDiff;
        return (b._rankingScore ?? 0) - (a._rankingScore ?? 0);
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
