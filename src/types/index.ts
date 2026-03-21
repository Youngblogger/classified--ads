// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  google_avatar?: string;
  facebook_avatar?: string;
  location?: string;
  location_id?: number;
  created_at: string;
  verified: boolean;
  email_verified_at?: string;
  phone_verified_at?: string;
  role?: string;
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
  id: number;
  title: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  condition?: string;
  status?: string;
  views?: number;
  created_at: string;
  updated_at?: string;
  user?: Partial<User>;
  category?: Category;
  location?: Location;
  images: AdImage[];
  specifications?: AdSpecification[];
  is_favorited?: boolean;
  is_verified?: boolean;
}

export interface AdImage {
  id: number;
  url: string;
  is_primary: boolean;
  order?: number;
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
  created_at: string;
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
