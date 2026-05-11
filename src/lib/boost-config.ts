import { Zap, Crown, Diamond, LucideIcon } from 'lucide-react';

export type BoostType = 'silver' | 'gold' | 'platinum' | 'top' | 'featured' | 'highlight';

export interface BoostUIConfig {
  label: string;
  badgeLabel: string;
  displayName: string;
  icon: LucideIcon;
  svgIcon: string;
  gradient: string;
  borderGradient: string;
  glowColor: string;
  textColor: string;
  bgColor: string;
  cardBorder: string;
  cardGlow: string;
  animation: string;
  priority: number;
  accentColor: string;
  cardClasses: string;
  cardHoverClasses: string;
  badgeAnimation: string;
}

const BOOST_UI_CONFIG: Record<string, BoostUIConfig> = {
  platinum: {
    label: 'VIP',
    badgeLabel: 'VIP',
    displayName: 'Diamond',
    icon: Diamond,
    svgIcon: '/icons/prism-diamond.svg',
    gradient: 'from-blue-500 via-blue-400 to-blue-600',
    borderGradient: 'from-blue-400 to-blue-600',
    glowColor: 'shadow-blue-500/40',
    textColor: 'text-blue-900',
    bgColor: 'bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50',
    cardBorder: 'border-blue-300',
    cardGlow: 'shadow-lg shadow-blue-500/20',
    animation: 'animate-diamond-glow',
    priority: 3,
    accentColor: '#3b82f6',
    cardClasses: 'ring-2 ring-blue-400 shadow-lg shadow-blue-200/50 bg-gradient-to-b from-blue-50/40 to-transparent',
    cardHoverClasses: 'hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-300/30 hover:-translate-y-1',
    badgeAnimation: 'animate-diamond-glow',
  },
  gold: {
    label: 'FEATURED',
    badgeLabel: 'Featured',
    displayName: 'Platinum',
    icon: Crown,
    svgIcon: '/icons/shield.svg',
    gradient: 'from-slate-400 via-slate-300 to-slate-400',
    borderGradient: 'from-slate-300 to-slate-400',
    glowColor: 'shadow-slate-400/30',
    textColor: 'text-slate-900',
    bgColor: 'bg-gradient-to-r from-slate-50 to-gray-50',
    cardBorder: 'border-slate-300',
    cardGlow: 'shadow-lg shadow-slate-400/20',
    animation: 'animate-gold-shimmer',
    priority: 2,
    accentColor: '#94a3b8',
    cardClasses: 'ring-2 ring-slate-300 shadow-lg shadow-slate-200/40 bg-gradient-to-b from-slate-50/30 to-transparent',
    cardHoverClasses: 'hover:ring-slate-400 hover:shadow-xl hover:shadow-slate-300/30 hover:-translate-y-1',
    badgeAnimation: 'animate-gold-shimmer',
  },
  silver: {
    label: 'BOOSTED',
    badgeLabel: 'Boosted',
    displayName: 'Gold',
    icon: Zap,
    svgIcon: '/icons/crown.svg',
    gradient: 'from-amber-400 via-yellow-300 to-amber-400',
    borderGradient: 'from-amber-400 to-amber-600',
    glowColor: 'shadow-amber-400/30',
    textColor: 'text-amber-900',
    bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    cardBorder: 'border-amber-300',
    cardGlow: 'shadow-md shadow-amber-400/15',
    animation: 'animate-silver-glow',
    priority: 1,
    accentColor: '#f59e0b',
    cardClasses: 'ring-2 ring-amber-300 shadow-md shadow-amber-200/40 bg-gradient-to-b from-amber-50/20 to-transparent',
    cardHoverClasses: 'hover:ring-amber-400 hover:shadow-lg hover:shadow-amber-300/30 hover:-translate-y-0.5',
    badgeAnimation: 'animate-silver-glow',
  },
  top: {
    label: 'TOP DEAL',
    badgeLabel: 'Boosted',
    displayName: 'Gold',
    icon: Zap,
    svgIcon: '/icons/crown.svg',
    gradient: 'from-amber-400 via-yellow-300 to-amber-400',
    borderGradient: 'from-amber-400 to-amber-600',
    glowColor: 'shadow-amber-400/30',
    textColor: 'text-amber-900',
    bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    cardBorder: 'border-amber-300',
    cardGlow: 'shadow-lg shadow-amber-500/15',
    animation: 'animate-gold-shimmer',
    priority: 1,
    accentColor: '#f59e0b',
    cardClasses: 'ring-2 ring-amber-400 shadow-lg shadow-amber-200/50 bg-gradient-to-b from-amber-50/30 to-transparent',
    cardHoverClasses: 'hover:ring-amber-500 hover:shadow-xl hover:shadow-amber-300/30 hover:-translate-y-1',
    badgeAnimation: 'animate-gold-shimmer',
  },
  featured: {
    label: 'FEATURED',
    badgeLabel: 'Featured',
    displayName: 'Platinum',
    icon: Crown,
    svgIcon: '/icons/shield.svg',
    gradient: 'from-slate-400 via-slate-300 to-slate-400',
    borderGradient: 'from-slate-300 to-slate-400',
    glowColor: 'shadow-slate-400/30',
    textColor: 'text-slate-900',
    bgColor: 'bg-gradient-to-r from-slate-50 to-gray-50',
    cardBorder: 'border-slate-300',
    cardGlow: 'shadow-lg shadow-slate-400/20',
    animation: 'animate-gold-shimmer',
    priority: 2,
    accentColor: '#94a3b8',
    cardClasses: 'ring-2 ring-slate-300 shadow-lg shadow-slate-200/40 bg-gradient-to-b from-slate-50/30 to-transparent',
    cardHoverClasses: 'hover:ring-slate-400 hover:shadow-xl hover:shadow-slate-300/30 hover:-translate-y-1',
    badgeAnimation: 'animate-gold-shimmer',
  },
  highlight: {
    label: 'HIGHLIGHTED',
    badgeLabel: 'Highlighted',
    displayName: 'Gold',
    icon: Crown,
    svgIcon: '/icons/crown.svg',
    gradient: 'from-amber-400 via-yellow-300 to-amber-400',
    borderGradient: 'from-amber-400 to-amber-600',
    glowColor: 'shadow-amber-400/30',
    textColor: 'text-amber-900',
    bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    cardBorder: 'border-amber-300',
    cardGlow: 'shadow-lg shadow-amber-500/15',
    animation: 'animate-premium-sparkle',
    priority: 1,
    accentColor: '#f59e0b',
    cardClasses: 'ring-2 ring-amber-400 shadow-lg shadow-amber-200/50 bg-gradient-to-b from-amber-50/30 to-transparent',
    cardHoverClasses: 'hover:ring-amber-500 hover:shadow-xl hover:shadow-amber-300/30 hover:-translate-y-1',
    badgeAnimation: 'animate-premium-sparkle',
  },
};

export function getBoostConfig(boostType: string | null | undefined): BoostUIConfig | null {
  if (!boostType) return null;
  const key = boostType.toLowerCase();
  return BOOST_UI_CONFIG[key] || null;
}

export function getBoostCardClasses(boostType: string | null | undefined): string {
  const config = getBoostConfig(boostType);
  if (!config) return '';
  return `${config.cardClasses} ${config.cardHoverClasses}`;
}

export function getBoostBadgeAnimation(boostType: string | null | undefined): string {
  const config = getBoostConfig(boostType);
  return config?.badgeAnimation ?? '';
}

/** Boost plan display name → weight mapping */
const BOOST_WEIGHT: Record<string, number> = {
  diamond: 3,
  platinum: 2,
  gold: 1,
};

/** Convert internal boost_type to numeric weight */
function getBoostWeight(boostType: string | null | undefined): number {
  if (!boostType) return BOOST_WEIGHT.gold;
  const plan = PLAN_FROM_TYPE[boostType.toLowerCase()] || 'gold';
  return BOOST_WEIGHT[plan] || BOOST_WEIGHT.gold;
}

/** Internal boost_type → display plan mapping (matches what PremiumBadge uses) */
const PLAN_FROM_TYPE: Record<string, string> = {
  platinum: 'diamond',
  gold: 'platinum',
  silver: 'gold',
  top: 'gold',
  featured: 'platinum',
  highlight: 'gold',
};

/** Scorable ad interface for dynamic ranking */
interface ScorableAd {
  is_boosted?: boolean;
  boost_type?: string | null;
  boost_plan?: string | null;
  boost_status?: string | null;
  boost_expires_at?: string | null;
  boost_views_today?: number;
  max_daily_boost_views?: number;
  views?: number;
  created_at?: string;
  category?: string | { name?: string; slug?: string } | null;
  price?: number | string | null;
  age_hours?: number;
}

/**
 * Recommended Boost Plan Engine
 * Suggests the best plan based on ad category and price
 */
export function recommendBoostPlan(ad: ScorableAd): string {
  const price = typeof ad.price === 'string' ? parseFloat(ad.price) : (ad.price || 0);
  const cat = ad.category
    ? (typeof ad.category === 'string' ? ad.category.toLowerCase() : (ad.category.name || ad.category.slug || '').toLowerCase())
    : '';

  if (cat.includes('property') || cat.includes('land') || cat.includes('house') || cat.includes('real') || price > 1000000) {
    return 'diamond';
  }
  if (cat.includes('vehicle') || cat.includes('car') || cat.includes('auto') || cat.includes('bike')) {
    return 'platinum';
  }
  return 'gold';
}

/**
 * Boost Impact Preview
 */
export const BOOST_IMPACT: Record<string, { views: string; badge: string; description: string }> = {
  gold: {
    views: 'Up to 3x more views',
    badge: 'Gold Boost',
    description: 'Appear above normal listings and get noticed faster',
  },
  platinum: {
    views: 'Up to 6x more views',
    badge: 'Platinum VIP',
    description: 'Homepage exposure with premium card styling',
  },
  diamond: {
    views: 'Up to 10x more visibility',
    badge: 'Diamond VIP',
    description: 'Top homepage placement and highest search priority',
  },
};

/**
 * Smart Upsell Trigger
 * Suggests boosting when ad has low views and is older than 24h
 */
export function shouldShowBoostSuggestion(ad: ScorableAd): boolean {
  if (ad.is_boosted || ad.boost_status === 'active') return false;
  const ageMs = ad.created_at ? Date.now() - new Date(ad.created_at).getTime() : 0;
  const ageHours = ageMs / 3600000;
  return (ad.views || 0) < 10 && ageHours > 24;
}

export function getBoostPlan(boostType: string | null | undefined): string | null {
  if (!boostType) return null;
  return PLAN_FROM_TYPE[boostType.toLowerCase()] || 'gold';
}

export function isBoostExpired(ad: { boost_status?: string | null; boost_expires_at?: string | null; boost_end_time?: string | null }): boolean {
  if (ad.boost_status !== 'active') return true;
  const expiresAt = ad.boost_expires_at || ad.boost_end_time;
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

/**
 * Dynamic Boost Score Formula
 *
 * score = (weight * 10 * timeFactor) + freshness + (engagement * exposurePenalty)
 */
export function calculateBoostScore(ad: ScorableAd): number {
  const expired = isBoostExpired(ad);
  const weight = expired ? 0 : getBoostWeight(ad.boost_type);

  const hour = new Date().getHours();
  const timeFactor = hour >= 18 && hour <= 23 ? 1.3 : hour >= 9 ? 1.0 : 0.8;

  const ageMs = ad.created_at ? Date.now() - new Date(ad.created_at).getTime() : 0;
  const ageHours = ageMs / 3600000;
  const freshness = Math.max(0, 10 / (1 + ageHours));

  const engagement = (ad.views || 0) * 0.01;

  const viewsToday = ad.boost_views_today || 0;
  const maxViews = ad.max_daily_boost_views || 100;
  const exposurePenalty = viewsToday > maxViews ? 0.5 : 1.0;

  return weight * 10 * timeFactor + freshness + engagement * exposurePenalty;
}

/**
 * Conversion-Based Ranking Boost
 * Higher plans get a revenue multiplier for more visibility stability
 */
export function revenuePriorityBoost(ad: ScorableAd): number {
  const base = calculateBoostScore(ad);
  const plan = getBoostPlan(ad.boost_type);
  const revenueFactor = plan === 'diamond' ? 1.5 : plan === 'platinum' ? 1.2 : 1;
  return base * revenueFactor;
}

export function sortAdsByBoostPriority<T extends ScorableAd>(ads: T[]): T[] {
  return [...ads].sort((a, b) => revenuePriorityBoost(b) - revenuePriorityBoost(a));
}

export function getPromotedLabelClasses(boostType: string | null | undefined): string {
  const config = getBoostConfig(boostType);
  if (!config) return 'text-amber-600 bg-amber-50';
  if (boostType === 'platinum') return 'text-violet-700 bg-violet-50';
  if (boostType === 'gold' || boostType === 'featured' || boostType === 'top') return 'text-amber-700 bg-amber-50';
  if (boostType === 'silver') return 'text-slate-600 bg-slate-100';
  return 'text-amber-600 bg-amber-50';
}

export const TIER_INFO = {
  silver: {
    name: 'Silver Boost',
    price: 2000,
    duration: '3 days',
    durationDays: 3,
    features: [
      'Appears above normal listings',
      'Highlighted ad card',
      'Better search ranking',
      '"Boosted" badge',
      'Increased impressions',
    ],
  },
  gold: {
    name: 'Gold Featured',
    price: 5000,
    duration: '7 days',
    durationDays: 7,
    features: [
      'Homepage exposure',
      'Priority category placement',
      'Higher search visibility',
      '"Featured" badge',
      'More impressions than Silver',
    ],
  },
  platinum: {
    name: 'Platinum VIP',
    price: 10000,
    duration: '14 days',
    durationDays: 14,
    features: [
      'Top homepage placement',
      'Always pinned above lower tiers',
      'Highest search priority',
      'VIP animated badge',
      'Priority in recommended ads',
      'Increased click visibility',
      'Extra premium styling',
    ],
  },
} as const;
