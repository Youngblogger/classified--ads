export interface TrustData {
  isVerified?: boolean;
  averageRating?: number;
  totalReviews?: number;
  totalTransactions?: number;
  activeAds?: number;
  responseRate?: number;
  memberSinceDays?: number;
}

export interface TrustScoreResult {
  overall: number;
  identity: number;
  behavior: number;
  activity: number;
  tier: 'highly_trusted' | 'trusted' | 'new_seller';
  tierLabel: string;
}

/**
 * TRUST SCORE FORMULA (from spec):
 *
 * Identity Verification × 0.4
 * + Rating Score × 0.25
 * + Transaction Volume × 0.2
 * + Response Rate × 0.1
 * + Account Age × 0.05
 */
export function calculateTrustScore(data: TrustData): TrustScoreResult {
  const identity = calculateIdentityScore(data);
  const behavior = calculateBehaviorScore(data);
  const activity = calculateActivityScore(data);

  const overall = Math.round(identity * 0.4 + behavior * 0.25 + activity * 0.2 + (data.responseRate ?? 0) * 0.1 + Math.min((data.memberSinceDays ?? 0), 100) * 0.05);

  let tier: TrustScoreResult['tier'];
  let tierLabel: string;

  if (overall >= 80) {
    tier = 'highly_trusted';
    tierLabel = 'Highly Trusted Seller';
  } else if (overall >= 50) {
    tier = 'trusted';
    tierLabel = 'Trusted Seller';
  } else {
    tier = 'new_seller';
    tierLabel = 'New Seller';
  }

  return { overall, identity, behavior, activity, tier, tierLabel };
}

function calculateIdentityScore(data: TrustData): number {
  return data.isVerified ? 100 : 0;
}

function calculateBehaviorScore(data: TrustData): number {
  let score = 0;

  if (data.averageRating && data.averageRating > 0) {
    score += Math.min(data.averageRating * 20, 100);
  }

  const transactionScore = Math.min((data.totalTransactions || 0), 100);
  score += transactionScore;

  return Math.round(Math.min(score, 100) / 2);
}

function calculateActivityScore(data: TrustData): number {
  let score = 0;

  const adScore = Math.min((data.activeAds || 0) * 10, 30);
  score += adScore;

  if (data.responseRate !== undefined) {
    score += Math.min(data.responseRate, 40);
  }

  if (data.memberSinceDays !== undefined) {
    if (data.memberSinceDays >= 365) score += 30;
    else if (data.memberSinceDays >= 180) score += 20;
    else if (data.memberSinceDays >= 30) score += 10;
  }

  return Math.min(score, 100);
}

export function getTrustTierColor(tier: TrustScoreResult['tier']): string {
  switch (tier) {
    case 'highly_trusted': return 'text-emerald-600';
    case 'trusted': return 'text-blue-600';
    case 'new_seller': return 'text-gray-500';
  }
}

export function getTrustTierBg(tier: TrustScoreResult['tier']): string {
  switch (tier) {
    case 'highly_trusted': return 'bg-emerald-50 border-emerald-200';
    case 'trusted': return 'bg-blue-50 border-blue-200';
    case 'new_seller': return 'bg-gray-50 border-gray-200';
  }
}

export function estimateMemberSinceDays(createdAt?: string): number {
  if (!createdAt) return 0;
  try {
    const created = new Date(createdAt);
    if (isNaN(created.getTime())) return 0;
    return Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}
