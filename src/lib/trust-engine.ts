'use server';

import { supabase } from './supabase';

export interface TrustScoreParams {
  is_verified: boolean;
  rating_avg: number;
  completed_transactions: number;
  response_rate: number;
  account_age_days: number;
}

/**
 * TRUST SCORE FORMULA:
 *
 * Identity Verification × 0.4
 * + Rating Score × 0.25
 * + Transaction Volume × 0.2
 * + Response Rate × 0.1
 * + Account Age × 0.05
 */
export function calculateTrustScore(user: TrustScoreParams): number {
  const identityScore = user.is_verified ? 100 : 0;
  const ratingScore = Math.min(user.rating_avg * 20, 100);
  const transactionScore = Math.min(user.completed_transactions, 100);
  const responseScore = user.response_rate;
  const ageScore = Math.min(user.account_age_days, 100);

  const score =
    identityScore * 0.4 +
    ratingScore * 0.25 +
    transactionScore * 0.2 +
    responseScore * 0.1 +
    ageScore * 0.05;

  return Math.round(Math.min(score, 100) * 100) / 100;
}

/**
 * RANK SCORE FORMULA:
 *
 * trust_score × 0.5
 * + rating × 0.2
 * + response_rate × 0.2
 * + listing_freshness × 0.1
 */
export function calculateRankScore(params: {
  trust_score: number;
  rating_avg: number;
  response_rate: number;
  listing_age_days: number;
}): number {
  const freshness = Math.max(0, 1 - params.listing_age_days / 30);
  return (
    params.trust_score * 0.5 +
    params.rating_avg * 20 * 0.2 +
    params.response_rate * 0.2 +
    freshness * 0.1
  );
}

export async function recalculateTrustScore(userId: string): Promise<number> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_verified, rating_avg, completed_transactions, response_rate, account_age_days')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('[TrustEngine] Failed to fetch profile:', error);
    return 0;
  }

  const score = calculateTrustScore({
    is_verified: profile.is_verified ?? false,
    rating_avg: profile.rating_avg ?? 0,
    completed_transactions: profile.completed_transactions ?? 0,
    response_rate: profile.response_rate ?? 0,
    account_age_days: profile.account_age_days ?? 0,
  });

  await supabase
    .from('profiles')
    .update({ trust_score: score })
    .eq('id', userId);

  return score;
}

export async function getUserTrustData(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      username,
      avatar_url,
      is_verified,
      trust_score,
      rating_avg,
      review_count,
      completed_transactions,
      response_rate,
      response_time_avg,
      created_at,
      account_age_days
    `)
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    account_age_days: data.account_age_days ?? Math.floor(
      (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
  };
}
