import { Zap, Crown, Diamond, LucideIcon } from 'lucide-react';

export type BoostType = 'silver' | 'gold' | 'platinum' | 'top' | 'featured' | 'highlight';

export interface BoostUIConfig {
  label: string;
  badgeLabel: string;
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
    icon: Diamond,
    svgIcon: '/icons/diamond.svg',
    gradient: 'from-violet-500 via-purple-400 to-fuchsia-500',
    borderGradient: 'from-violet-400 to-fuchsia-500',
    glowColor: 'shadow-violet-500/40',
    textColor: 'text-violet-900',
    bgColor: 'bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50',
    cardBorder: 'border-violet-300',
    cardGlow: 'shadow-lg shadow-violet-500/20',
    animation: 'animate-diamond-glow',
    priority: 3,
    accentColor: '#8b5cf6',
    cardClasses: 'ring-2 ring-violet-400 shadow-lg shadow-violet-200/50 bg-gradient-to-b from-violet-50/40 to-transparent',
    cardHoverClasses: 'hover:ring-violet-500 hover:shadow-xl hover:shadow-violet-300/30 hover:-translate-y-1',
    badgeAnimation: 'animate-diamond-glow',
  },
  gold: {
    label: 'FEATURED',
    badgeLabel: 'Featured',
    icon: Crown,
    svgIcon: '/icons/platinum.svg',
    gradient: 'from-amber-400 via-yellow-300 to-amber-400',
    borderGradient: 'from-amber-400 to-amber-600',
    glowColor: 'shadow-amber-400/30',
    textColor: 'text-amber-900',
    bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    cardBorder: 'border-amber-300',
    cardGlow: 'shadow-lg shadow-amber-500/15',
    animation: 'animate-gold-shimmer',
    priority: 2,
    accentColor: '#f59e0b',
    cardClasses: 'ring-2 ring-amber-400 shadow-lg shadow-amber-200/50 bg-gradient-to-b from-amber-50/30 to-transparent',
    cardHoverClasses: 'hover:ring-amber-500 hover:shadow-xl hover:shadow-amber-300/30 hover:-translate-y-1',
    badgeAnimation: 'animate-gold-shimmer',
  },
  silver: {
    label: 'BOOSTED',
    badgeLabel: 'Boosted',
    icon: Zap,
    svgIcon: '/icons/gold.svg',
    gradient: 'from-slate-400 via-slate-300 to-slate-400',
    borderGradient: 'from-slate-300 to-slate-400',
    glowColor: 'shadow-slate-400/30',
    textColor: 'text-slate-900',
    bgColor: 'bg-gradient-to-r from-slate-50 to-gray-50',
    cardBorder: 'border-slate-300',
    cardGlow: 'shadow-md shadow-slate-400/10',
    animation: 'animate-silver-glow',
    priority: 1,
    accentColor: '#94a3b8',
    cardClasses: 'ring-1 ring-slate-300 shadow-md shadow-slate-200/40 bg-gradient-to-b from-slate-50/20 to-transparent',
    cardHoverClasses: 'hover:ring-slate-400 hover:shadow-lg hover:shadow-slate-300/30 hover:-translate-y-0.5',
    badgeAnimation: 'animate-silver-glow',
  },
  top: {
    label: 'TOP DEAL',
    badgeLabel: 'Boosted',
    icon: Zap,
    svgIcon: '/icons/gold.svg',
    gradient: 'from-amber-400 via-yellow-300 to-amber-400',
    borderGradient: 'from-amber-400 to-blue-400',
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
    icon: Crown,
    svgIcon: '/icons/platinum.svg',
    gradient: 'from-blue-500 via-blue-400 to-blue-500',
    borderGradient: 'from-blue-400 to-blue-600',
    glowColor: 'shadow-blue-400/30',
    textColor: 'text-blue-900',
    bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    cardBorder: 'border-blue-300',
    cardGlow: 'shadow-lg shadow-blue-500/15',
    animation: 'animate-gold-shimmer',
    priority: 2,
    accentColor: '#3b82f6',
    cardClasses: 'ring-2 ring-blue-400 shadow-lg shadow-blue-200/50 bg-gradient-to-b from-blue-50/30 to-transparent',
    cardHoverClasses: 'hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-300/30 hover:-translate-y-1',
    badgeAnimation: 'animate-gold-shimmer',
  },
  highlight: {
    label: 'HIGHLIGHTED',
    badgeLabel: 'Highlighted',
    icon: Crown,
    svgIcon: '/icons/gold.svg',
    gradient: 'from-purple-500 via-purple-400 to-purple-500',
    borderGradient: 'from-purple-400 to-purple-600',
    glowColor: 'shadow-purple-400/30',
    textColor: 'text-purple-900',
    bgColor: 'bg-gradient-to-r from-purple-50 to-violet-50',
    cardBorder: 'border-purple-300',
    cardGlow: 'shadow-lg shadow-purple-500/15',
    animation: 'animate-premium-sparkle',
    priority: 1,
    accentColor: '#8b5cf6',
    cardClasses: 'ring-2 ring-purple-400 shadow-lg shadow-purple-200/50 bg-gradient-to-b from-purple-50/30 to-transparent',
    cardHoverClasses: 'hover:ring-purple-500 hover:shadow-xl hover:shadow-purple-300/30 hover:-translate-y-1',
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

export function sortAdsByBoostPriority<T extends { is_boosted?: boolean; boost_type?: string | null; boost_priority_score?: number }>(ads: T[]): T[] {
  return [...ads].sort((a, b) => {
    if (a.boost_priority_score !== undefined && b.boost_priority_score !== undefined) {
      return b.boost_priority_score - a.boost_priority_score;
    }
    const configA = getBoostConfig(a.boost_type);
    const configB = getBoostConfig(b.boost_type);
    if (!configA && !configB) return 0;
    if (!configA) return 1;
    if (!configB) return -1;
    return configB.priority - configA.priority;
  });
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
