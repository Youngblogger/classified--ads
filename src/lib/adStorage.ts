// Ad storage utility for localStorage
const STORAGE_KEY = 'classified_ads';

export interface StoredAd {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    location?: string;
    created_at: string;
    verified: boolean;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
  location: {
    id: number;
    name: string;
    slug: string;
  };
  images: {
    id: number;
    url: string;
    is_primary: boolean;
    order: number;
  }[];
  is_favorited?: boolean;
}

// Get all ads from localStorage
export function getStoredAds(): StoredAd[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save a new ad to localStorage
export function saveAd(ad: StoredAd): void {
  const ads = getStoredAds();
  ads.unshift(ad); // Add to beginning (newest first)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
}

// Generate a unique ID
export function generateAdId(): number {
  const ads = getStoredAds();
  if (ads.length === 0) return 1000;
  const maxId = Math.max(...ads.map(a => a.id));
  return maxId + 1;
}

// Generate a slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Get a single ad by ID
export function getStoredAd(id: number): StoredAd | null {
  const ads = getStoredAds();
  return ads.find(ad => ad.id === id) || null;
}

// Update an existing ad
export function updateAd(updatedAd: StoredAd): void {
  const ads = getStoredAds();
  const index = ads.findIndex(ad => ad.id === updatedAd.id);
  if (index !== -1) {
    ads[index] = updatedAd;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
  }
}

// Delete an ad
export function deleteAd(id: number): void {
  const ads = getStoredAds();
  const filtered = ads.filter(ad => ad.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
