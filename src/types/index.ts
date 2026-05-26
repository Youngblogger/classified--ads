// User Types
export interface User {
  id: number;
  supabase_user_id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  full_avatar_url?: string;
  google_avatar?: string;
  facebook_avatar?: string;
  location?: string;
  location_id?: number;
  created_at: string;
  verified: boolean;
  email_verified_at?: string;
  phone_verified_at?: string;
  role?: string;
  has_store?: boolean;
  is_verified_seller?: boolean;
  seller_verified_at?: string;
  is_verified_business?: boolean;
  business_verified_at?: string;
  verification_progress?: {
    phone_verified: boolean;
    email_verified: boolean;
    identity_verified: boolean;
    completed: number;
    total: number;
    is_full_verified_seller: boolean;
  };
  notification_settings?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parent_id?: number;
  children?: Category[];
  ad_count?: number;
}

// Location Types
export interface Location {
  id: number;
  name: string;
  slug?: string;
  parent_id?: number;
  children?: Location[];
}

// Ad Types
export interface Ad {
  id: number | string;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  currency?: string;
  condition?: string;
  status?: string;
  views?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  user?: Partial<User>;
  category?: Category | string;
  subcategory?: string;
  location?: Location | string;
  state?: string;
  lga?: string;
  images: AdImage[] | string[];
  specifications?: AdSpecification[];
  is_favorited?: boolean;
  is_verified?: boolean;
  // For seeded ads / alternative format
  main_image?: string | AdImage;
  slider_images?: (string | AdImage)[];
  seller?: string;
  sellerName?: string;
  phone?: string;
  sellerPhone?: string;
  featured?: boolean;
  is_featured?: boolean;
  is_boosted?: boolean;
  boost_type?: 'silver' | 'gold' | 'platinum' | 'top' | 'featured' | 'highlight' | null;
  boost_plan?: string | null;
  boost_status?: string | null;
  boost_expires_at?: string | null;
  boost_end_time?: string | null;
  boost_priority_score?: number;
  plan_name?: string | null;
  badge_label?: string | null;
  badge_icon?: string | null;
  negotiable?: boolean;
}

export interface AdImage {
  id?: number;
  url?: string;
  full_url?: string;
  full_thumbnail_url?: string;
  thumbnail_url?: string;
  display_url?: string;
  thumbnail?: string;
  is_primary?: boolean;
  order?: number;
  src?: string;
  original_url?: string;
  image?: string;
  path?: string;
  file?: string;
}

export interface AdSpecification {
  id: number;
  name: string;
  value: string;
}

export interface CreateAdPayload {
  title: string;
  description: string;
  price: number;
  currency?: string;
  condition: 'new' | 'used' | 'refurbished';
  category_id: number;
  location_id: number;
  specifications?: Record<string, string>;
  images: File[];
}

// Search & Filter Types
export interface SearchFilters {
  keyword?: string;
  category_id?: number;
  location_id?: number;
  min_price?: number;
  max_price?: number;
  condition?: string;
  sort_by?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// Messaging Types
export interface Conversation {
  id: number;
  ad: Ad;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  image_url?: string;
  read_at?: string;
  created_at: string;
}

// Favorite Types
export interface Favorite {
  id: number;
  user_id: number;
  ad_id: number;
  ad: Ad;
  created_at: string;
}

// Review Types
export interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer: User;
  user: User;
  ad_id?: number;
  ad?: { id: number; title: string; slug: string };
  helpful_count?: number;
  created_at: string;
}

// Seller Review Types
export interface SellerReview {
  id: number;
  rating: number;
  comment: string;
  user: User;
  ad?: { id: number; title: string; slug: string };
  helpful_count?: number;
  like_count?: number;
  is_liked_by_user?: boolean;
  created_at: string;
}

export interface SellerRatingSummary {
  average_rating: number;
  total_reviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  counts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface SellerProfile {
  seller: User;
  rating: SellerRatingSummary;
  ads_count: number;
  member_since: string;
}

export interface CanReviewResponse {
  allowed: boolean;
  reason: string;
  requires: string[];
}

// Report Types
export interface Report {
  id: number;
  ad_id: number;
  user_id: number;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
}

// Notification Types
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
}

// Banner Types
export interface Banner {
  id: number;
  title: string;
  image: string;
  link?: string;
  position: 'home' | 'category' | 'sidebar';
  status: 'active' | 'inactive';
  start_date?: string;
  end_date?: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  total_ads: number;
  active_ads: number;
  total_views: number;
  total_favorites: number;
  unread_messages: number;
  pending_ads: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Store Types
export interface Store {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logo_url?: string;
  banner?: string;
  banner_url?: string;
  email?: string;
  phone?: string;
  address?: string;
  location_id?: number;
  website?: string;
  social_links?: Record<string, string>;
  is_verified: boolean;
  verification_status: string;
  verification_document?: string;
  verified_at?: string;
  verified_by?: number;
  status: string;
  settings?: Record<string, any>;
  user?: User;
  location?: Location;
  followers_count?: number;
  active_ads_count?: number;
  created_at: string;
  updated_at: string;
}

export interface StoreFollower {
  id: number;
  store_id: number;
  user_id: number;
  user?: User;
  created_at: string;
}

export interface StoreAnalytic {
  id: number;
  store_id: number;
  date: string;
  views: number;
  unique_visitors: number;
  followers_count: number;
  ad_count: number;
  contact_clicks: number;
  whatsapp_clicks: number;
  phone_clicks: number;
}

// Saved Search Types
export interface SavedSearch {
  id: number;
  user_id: number;
  name: string;
  search_params: Record<string, any>;
  frequency: 'instant' | 'daily' | 'weekly';
  notify_email: boolean;
  notify_in_app: boolean;
  last_notified_at?: string;
  created_at: string;
  updated_at: string;
}

// Business Verification Types
export interface BusinessVerification {
  id: number;
  user_id: number;
  business_name: string;
  cac_number: string;
  cac_document: string;
  address_document?: string;
  utility_bill?: string;
  tax_registration?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  admin_notes?: string;
  verified_at?: string;
  reviewed_by?: number;
  user?: User;
  created_at: string;
  updated_at: string;
}

// Verification Types
export interface UserVerification {
  id: number;
  user_id: number;
  type: 'phone' | 'email' | 'identity' | 'business';
  status: 'pending' | 'approved' | 'rejected' | 'none';
  document_type?: string;
  document_number?: string;
  document_front?: string;
  document_back?: string;
  document_selfie?: string;
  verified_at?: string;
  verified_by?: number;
  rejection_reason?: string;
  notes?: string;
  expires_at?: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface VerificationStatus {
  is_phone_verified: boolean;
  is_email_verified: boolean;
  is_identity_verified: boolean;
  is_business_verified: boolean;
  verification_badges: string[];
}

// Analytics Types
export interface AdAnalytic {
  id: number;
  ad_id: number;
  date: string;
  views: number;
  unique_views: number;
  favorites: number;
  messages: number;
  phone_clicks: number;
  whatsapp_clicks: number;
  shares: number;
}

export interface AnalyticsOverview {
  total_views: number;
  total_unique_views: number;
  total_favorites: number;
  total_messages: number;
  total_phone_clicks: number;
  total_whatsapp_clicks: number;
  total_shares: number;
  total_ads: number;
  active_ads: number;
  total_clicks: number;
  ctr: number;
  engagement_rate: number;
}

export interface AdPerformance {
  id: number;
  title: string;
  slug: string;
  price: number;
  created_at: string;
  total_views: number;
  total_unique_views: number;
  total_favorites: number;
  total_messages: number;
  total_phone_clicks: number;
  total_whatsapp_clicks: number;
  total_shares: number;
}

// Boost Flow Types
export interface BoostPackage {
  id: number;
  name: string;
  type: string;
  price: number;
  formatted_price: string;
  duration_days: number;
  priority_score: number;
  badge_label: string;
  badge_icon: string;
  color_scheme: {
    gradient: string;
    border: string;
    glow: string;
    text: string;
    bg: string;
    accent: string;
  };
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export interface BoostOrderRequest {
  plan_type: 'silver' | 'gold' | 'platinum';
  payment_method?: 'wallet' | 'paystack';
}

export interface BoostOrderResponse {
  success: boolean;
  data: {
    payment_intent?: string;
    authorization_url?: string;
    access_code?: string;
    amount: number;
    plan?: {
      id: number;
      type: string;
      name: string;
      price: number;
      duration_days: number;
    };
    boost_id?: number;
    paid_from?: string;
    message?: string;
  };
}

// Upload Image Types
export type ImageUploadStatus = 'pending' | 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  hash: string;
  imageHash?: string;
  status: ImageUploadStatus;
  progress: number;
  retryCount: number;
  uploadedUrl?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  originalUrl?: string;
  errorMessage?: string;
}
