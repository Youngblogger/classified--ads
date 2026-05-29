export type CategoryLabel = 'Trending' | 'Popular' | 'New' | 'Hot' | 'Featured' | 'Verified' | 'Best Seller' | null;

export interface CategoryLabelConfig {
  badge: CategoryLabel;
  icon: string;
  color: string;
  bgColor: string;
}

const LABEL_CONFIGS: Record<string, CategoryLabelConfig> = {
  Trending: { badge: 'Trending', icon: 'trending-up', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  Popular: { badge: 'Popular', icon: 'award', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  Hot: { badge: 'Hot', icon: 'flame', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  New: { badge: 'New', icon: 'sparkles', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  Featured: { badge: 'Featured', icon: 'star', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  Verified: { badge: 'Verified', icon: 'shield', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  'Best Seller': { badge: 'Best Seller', icon: 'trophy', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
};

const CATEGORY_LABELS: Record<string, { label: CategoryLabel; trending?: boolean }> = {
  'mobile-phones': { label: 'Trending', trending: true },
  smartphones: { label: 'Trending', trending: true },
  vehicles: { label: 'Popular' },
  cars: { label: 'Popular' },
  property: { label: 'Hot', trending: true },
  electronics: { label: 'Popular' },
  laptops: { label: 'Popular' },
  fashion: { label: 'Trending', trending: true },
  services: { label: 'Featured' },
  jobs: { label: 'New' },
  'health-beauty': { label: 'Popular' },
  'home-furniture': { label: 'Hot' },
  furniture: { label: 'Hot' },
  sports: { label: 'New' },
  'baby-kids': { label: 'New' },
  pets: { label: 'Popular' },
};

export function getCategoryLabel(slug: string): { label: CategoryLabel; config: CategoryLabelConfig | null; isTrending: boolean } {
  const mapping = CATEGORY_LABELS[slug];
  if (!mapping || !mapping.label) return { label: null, config: null, isTrending: false };
  const config = LABEL_CONFIGS[mapping.label] || null;
  return { label: mapping.label, config, isTrending: mapping.trending || false };
}

export function getCategoryConfig(label: CategoryLabel): CategoryLabelConfig | null {
  return label ? LABEL_CONFIGS[label] || null : null;
}

export const BADGE_STYLES: Record<string, string> = {
  Trending: 'bg-orange-100 text-orange-700',
  Popular: 'bg-blue-100 text-blue-700',
  Hot: 'bg-orange-100 text-orange-700',
  New: 'bg-emerald-100 text-emerald-700',
  Featured: 'bg-amber-100 text-amber-700',
  Verified: 'bg-purple-100 text-purple-700',
  'Best Seller': 'bg-yellow-100 text-yellow-700',
};
