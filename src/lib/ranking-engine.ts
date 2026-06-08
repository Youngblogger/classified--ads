export interface RankingSignal {
  label: string;
  weight: number;
  score: number;
}

export interface RankingResult {
  organicScore: number;
  finalScore: number;
  signals: RankingSignal[];
  completeness: number;
  freshness: number;
  engagement: number;
  sellerTrust: number;
}

type AdSignal = {
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
  user?: {
    trust_score?: number;
    rating_avg?: number;
    response_rate?: number;
    is_verified_seller?: boolean;
  };
  specifications?: unknown[];
  attributes?: Record<string, unknown>;
  boost_type?: string | null;
  is_boosted?: boolean;
  boost_status?: string | null;
  boost_expires_at?: string | null;
  status?: string;
};

const SIGNAL_CONFIG = [
  { key: 'completeness', weight: 0.20, label: 'Listing completeness' },
  { key: 'freshness', weight: 0.25, label: 'Listing freshness' },
  { key: 'engagement', weight: 0.20, label: 'Engagement signals' },
  { key: 'sellerTrust', weight: 0.20, label: 'Seller trust score' },
  { key: 'imageQuality', weight: 0.15, label: 'Image quality proxy' },
];

function calcCompleteness(ad: AdSignal): number {
  let score = 0;
  if (ad.images?.length || ad.image_url) score += 25;
  if (ad.description && ad.description.length >= 20) score += 20;
  if (ad.price && Number(ad.price) > 0) score += 20;
  if (ad.phone || ad.sellerPhone || ad.whatsapp) score += 15;
  if (ad.specifications?.length || (ad.attributes && Object.keys(ad.attributes).length > 0)) score += 10;
  if (ad.condition) score += 10;
  return score;
}

function calcFreshness(createdAt?: string): number {
  if (!createdAt) return 0;
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  if (ageHours < 1) return 100;
  if (ageHours < 6) return 90;
  if (ageHours < 24) return 75;
  if (ageHours < 72) return 55;
  if (ageHours < 168) return 35;
  if (ageHours < 720) return 15;
  return Math.max(0, 10 - ageHours / 720);
}

function calcEngagement(ad: AdSignal): number {
  const views = ad.views || 0;
  const saves = ad.saves || 0;
  const messages = ad.messages || 0;
  const viewScore = Math.min(views * 1.5, 50);
  const saveScore = Math.min(saves * 10, 30);
  const messageScore = Math.min(messages * 15, 20);
  return Math.min(viewScore + saveScore + messageScore, 100);
}

function calcSellerTrust(user: AdSignal['user']): number {
  if (!user) return 0;
  const trustScore = user.trust_score ?? 0;
  const ratingScore = (user.rating_avg ?? 0) * 20;
  const responseScore = user.response_rate ?? 0;
  const verifiedBonus = user.is_verified_seller ? 15 : 0;
  return Math.min(trustScore * 0.4 + ratingScore * 0.25 + responseScore * 0.2 + verifiedBonus, 100);
}

function calcImageQuality(ad: AdSignal): number {
  const count = ad.images?.length || (ad.image_url ? 1 : 0);
  if (count >= 5) return 100;
  if (count >= 3) return 75;
  if (count >= 1) return 50;
  return 0;
}

export function computeOrganicRankingScore(ad: AdSignal): RankingResult {
  const completeness = calcCompleteness(ad);
  const freshness = calcFreshness(ad.created_at);
  const engagement = calcEngagement(ad);
  const sellerTrust = calcSellerTrust(ad.user);
  const imageQuality = calcImageQuality(ad);

  const signals: RankingSignal[] = [
    { label: SIGNAL_CONFIG[0].label, weight: SIGNAL_CONFIG[0].weight, score: completeness },
    { label: SIGNAL_CONFIG[1].label, weight: SIGNAL_CONFIG[1].weight, score: freshness },
    { label: SIGNAL_CONFIG[2].label, weight: SIGNAL_CONFIG[2].weight, score: engagement },
    { label: SIGNAL_CONFIG[3].label, weight: SIGNAL_CONFIG[3].weight, score: sellerTrust },
    { label: SIGNAL_CONFIG[4].label, weight: SIGNAL_CONFIG[4].weight, score: imageQuality },
  ];

  const organicScore = signals.reduce((sum, s) => sum + s.score * s.weight, 0);
  const normalized = Math.min(Math.max(organicScore, 0), 100);

  return {
    organicScore: Math.round(normalized * 100) / 100,
    finalScore: Math.round(normalized * 100) / 100,
    signals,
    completeness,
    freshness,
    engagement,
    sellerTrust,
  };
}

export function computeFinalRankingScore(ad: AdSignal): number {
  const organic = computeOrganicRankingScore(ad);
  return organic.finalScore;
}

export function rankAds<T extends AdSignal>(ads: T[]): T[] {
  const withScores = ads.map(ad => ({
    ...ad,
    _rankingScore: computeFinalRankingScore(ad),
    _isBoosted: !!(ad.is_boosted && ad.boost_status === 'active' && ad.boost_expires_at && new Date(ad.boost_expires_at).getTime() > Date.now()),
  }));

  return withScores.sort((a, b) => {
    const boostA = a._isBoosted ? 1 : 0;
    const boostB = b._isBoosted ? 1 : 0;
    if (boostA !== boostB) return boostB - boostA;
    return (b._rankingScore ?? 0) - (a._rankingScore ?? 0);
  });
}

export function getSellerPerformanceSignals(ads: AdSignal[]): {
  avgCompleteness: number;
  avgEngagement: number;
  totalViews: number;
  listingCount: number;
  weakListings: number;
} {
  if (!ads.length) return { avgCompleteness: 0, avgEngagement: 0, totalViews: 0, listingCount: 0, weakListings: 0 };

  let totalCompleteness = 0;
  let totalEngagement = 0;
  let totalViews = 0;
  let weak = 0;

  for (const ad of ads) {
    const c = calcCompleteness(ad);
    const e = calcEngagement(ad);
    totalCompleteness += c;
    totalEngagement += e;
    totalViews += ad.views || 0;
    if (c < 50) weak++;
  }

  return {
    avgCompleteness: Math.round(totalCompleteness / ads.length),
    avgEngagement: Math.round(totalEngagement / ads.length),
    totalViews,
    listingCount: ads.length,
    weakListings: weak,
  };
}
