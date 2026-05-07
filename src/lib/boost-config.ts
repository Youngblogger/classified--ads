import { Gem, Star, Sparkles, LucideIcon } from 'lucide-react';

export type BoostType = 'top' | 'featured' | 'highlight';

export interface BoostUIConfig {
  label: string;
  icon: LucideIcon;
  gradient: string;
  borderGradient: string;
  glowColor: string;
  textColor: string;
  bgColor: string;
  animation: string;
  priority: number;
}

export const BOOST_UI_CONFIG: Record<BoostType, BoostUIConfig> = {
  top: {
    label: 'TOP DEAL',
    icon: Gem,
    gradient: 'from-amber-400 via-yellow-300 to-amber-400',
    borderGradient: 'from-amber-400 to-blue-400',
    glowColor: 'shadow-amber-400/30',
    textColor: 'text-amber-900',
    bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    animation: 'animate-premium-pulse',
    priority: 3,
  },
  featured: {
    label: 'FEATURED',
    icon: Star,
    gradient: 'from-blue-500 via-blue-400 to-blue-500',
    borderGradient: 'from-blue-400 to-blue-600',
    glowColor: 'shadow-blue-400/30',
    textColor: 'text-blue-900',
    bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    animation: 'animate-premium-shimmer',
    priority: 2,
  },
  highlight: {
    label: 'HIGHLIGHTED',
    icon: Sparkles,
    gradient: 'from-purple-500 via-purple-400 to-purple-500',
    borderGradient: 'from-purple-400 to-purple-600',
    glowColor: 'shadow-purple-400/30',
    textColor: 'text-purple-900',
    bgColor: 'bg-gradient-to-r from-purple-50 to-violet-50',
    animation: 'animate-premium-sparkle',
    priority: 1,
  },
};

export function getBoostConfig(boostType: BoostType | string | null | undefined): BoostUIConfig | null {
  if (!boostType || !(boostType in BOOST_UI_CONFIG)) {
    return null;
  }
  return BOOST_UI_CONFIG[boostType as BoostType];
}

export function sortAdsByBoostPriority(ads: Array<{ is_boosted?: boolean; boost_type?: string | null; [key: string]: any }>) {
  return [...ads].sort((a, b) => {
    const configA = getBoostConfig(a.boost_type);
    const configB = getBoostConfig(b.boost_type);
    
    if (!configA && !configB) return 0;
    if (!configA) return 1;
    if (!configB) return -1;
    
    return configB.priority - configA.priority;
  });
}
