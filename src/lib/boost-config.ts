export interface BoostConfig {
  name: string;
  displayName: string;
  type: string;
  price: number;
  duration_days: number;
  priority_score: number;
  emoji: string;
  color_scheme: string;
  border_class: string;
  shadow_class: string;
  badge_icon: string;
}

const colorSchemeMap: Record<string, { bg: string; text: string }> = {
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-800' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-800' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-800' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-800' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-800' },
};

const BOOST_CONFIGS: BoostConfig[] = [
  {
    name: 'Basic',
    displayName: 'Basic',
    type: 'basic',
    price: 5,
    duration_days: 7,
    priority_score: 10,
    emoji: '⚡',
    color_scheme: 'amber',
    border_class: 'border-amber-300',
    shadow_class: 'shadow-[0_0_12px_-4px_rgba(251,191,36,0.5)]',
    badge_icon: 'Zap',
  },
  {
    name: 'Standard',
    displayName: 'Standard',
    type: 'standard',
    price: 10,
    duration_days: 14,
    priority_score: 25,
    emoji: '⭐',
    color_scheme: 'blue',
    border_class: 'border-blue-300',
    shadow_class: 'shadow-[0_0_14px_-4px_rgba(59,130,246,0.5)]',
    badge_icon: 'Star',
  },
  {
    name: 'Premium',
    displayName: 'Premium',
    type: 'premium',
    price: 25,
    duration_days: 30,
    priority_score: 50,
    emoji: '👑',
    color_scheme: 'purple',
    border_class: 'border-purple-300',
    shadow_class: 'shadow-[0_0_16px_-4px_rgba(147,51,234,0.5)]',
    badge_icon: 'Crown',
  },
  {
    name: 'Platinum',
    displayName: 'Platinum',
    type: 'platinum',
    price: 50,
    duration_days: 60,
    priority_score: 100,
    emoji: '💎',
    color_scheme: 'indigo',
    border_class: 'border-indigo-300',
    shadow_class: 'shadow-[0_0_20px_-4px_rgba(99,102,241,0.6)]',
    badge_icon: 'Gem',
  },
  {
    name: 'Gold',
    displayName: 'Gold',
    type: 'gold',
    price: 15,
    duration_days: 21,
    priority_score: 35,
    emoji: '🌟',
    color_scheme: 'yellow',
    border_class: 'border-yellow-300',
    shadow_class: 'shadow-[0_0_14px_-4px_rgba(234,179,8,0.5)]',
    badge_icon: 'Award',
  },
];

export const BOOST_PLANS: Record<string, BoostConfig> = {};
for (const c of BOOST_CONFIGS) {
  BOOST_PLANS[c.type] = c;
}

export const BOOST_PRICES: Record<string, number> = {};
for (const c of BOOST_CONFIGS) {
  BOOST_PRICES[c.type] = c.price;
}

export const BOOST_DURATIONS: Record<string, number> = {};
for (const c of BOOST_CONFIGS) {
  BOOST_DURATIONS[c.type] = c.duration_days;
}

export type BoostType = string;

export function getBoostPlan(id?: string): BoostConfig | null {
  if (!id) return null;
  return BOOST_PLANS[id] ?? null;
}

export function getBoostPrice(type?: string, duration?: string): number {
  if (!type) return 0;
  return BOOST_PLANS[type]?.price ?? 0;
}

export function sortAdsByBoostPriority<T extends Record<string, any>>(ads: T[]): T[] {
  return [...ads].sort((a, b) => {
    const aScore = calculateBoostScore(a);
    const bScore = calculateBoostScore(b);
    if (aScore !== bScore) return bScore - aScore;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
}

export function getBoostCardClasses(type?: string | null): string {
  if (!type) return '';
  const config = BOOST_PLANS[type];
  if (!config) return 'border-amber-300 shadow-[0_0_8px_-3px_rgba(251,191,36,0.4)]';
  return `${config.border_class} ${config.shadow_class}`;
}

export function getBoostConfig(type?: string | null): BoostConfig | null {
  if (!type) return null;
  return BOOST_PLANS[type] ?? null;
}

export function isBoostExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}

export function calculateBoostScore(ad: Record<string, any>): number {
  if (!ad) return 0;
  const boostType = ad.boost_type || ad.boostType;
  if (!boostType) return 0;
  if (ad.boost_status !== 'active') return 0;
  if (isBoostExpired(ad.boost_expires_at)) return 0;
  const config = BOOST_PLANS[boostType];
  const baseScore = config?.priority_score ?? 0;
  const boostAmount = Number(ad.boost_amount || ad.boostAmount || 0);
  return baseScore + boostAmount;
}

export function getBoostPlanEmoji(type?: string | null): string {
  if (!type) return '';
  return BOOST_PLANS[type]?.emoji ?? '⚡';
}
