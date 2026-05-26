export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      subcategories: {
        Row: Subcategory
        Insert: SubcategoryInsert
        Update: SubcategoryUpdate
      }
      listings: {
        Row: Listing
        Insert: ListingInsert
        Update: ListingUpdate
      }
      listing_images: {
        Row: ListingImage
        Insert: ListingImageInsert
        Update: ListingImageUpdate
      }
      listing_favorites: {
        Row: ListingFavorite
        Insert: ListingFavoriteInsert
        Update: ListingFavoriteUpdate
      }
      listing_views: {
        Row: ListingView
        Insert: ListingViewInsert
        Update: ListingViewUpdate
      }
      conversations: {
        Row: Conversation
        Insert: ConversationInsert
        Update: ConversationUpdate
      }
      messages: {
        Row: Message
        Insert: MessageInsert
        Update: MessageUpdate
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      boost_plans: {
        Row: BoostPlan
        Insert: BoostPlanInsert
        Update: BoostPlanUpdate
      }
      boosted_listings: {
        Row: BoostedListing
        Insert: BoostedListingInsert
        Update: BoostedListingUpdate
      }
      reports: {
        Row: Report
        Insert: ReportInsert
        Update: ReportUpdate
      }
      reviews: {
        Row: Review
        Insert: ReviewInsert
        Update: ReviewUpdate
      }
      transactions: {
        Row: Transaction
        Insert: TransactionInsert
        Update: TransactionUpdate
      }
      verification_requests: {
        Row: VerificationRequest
        Insert: VerificationRequestInsert
        Update: VerificationRequestUpdate
      }
      audit_logs: {
        Row: AuditLog
        Insert: AuditLogInsert
        Update: AuditLogUpdate
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      listing_status: 'active' | 'inactive' | 'sold' | 'expired' | 'draft' | 'pending' | 'rejected'
      verification_status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
      boost_plan_type: 'gold' | 'platinum' | 'diamond'
      report_status: 'pending' | 'resolved' | 'dismissed'
      transaction_status: 'pending' | 'completed' | 'failed' | 'refunded'
      transaction_type: 'credit' | 'debit'
    }
  }
}

export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  is_verified: boolean
  verification_status: verification_status
  created_at: string
  updated_at: string
}

type verification_status = Database['public']['Enums']['verification_status']

export interface ProfileInsert {
  id: string
  full_name?: string | null
  username?: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  is_verified?: boolean
  verification_status?: verification_status
  created_at?: string
  updated_at?: string
}

export interface ProfileUpdate {
  full_name?: string | null
  username?: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  is_verified?: boolean
  verification_status?: verification_status
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  image: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryInsert {
  id?: string
  name: string
  slug: string
  icon?: string | null
  image?: string | null
  parent_id?: string | null
  sort_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface CategoryUpdate {
  name?: string
  slug?: string
  icon?: string | null
  image?: string | null
  parent_id?: string | null
  sort_order?: number
  is_active?: boolean
  updated_at?: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  icon: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SubcategoryInsert {
  id?: string
  category_id: string
  name: string
  slug: string
  icon?: string | null
  is_active?: boolean
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export interface SubcategoryUpdate {
  name?: string
  slug?: string
  icon?: string | null
  is_active?: boolean
  sort_order?: number
  updated_at?: string
}

type listing_status = Database['public']['Enums']['listing_status']

export interface Listing {
  id: string
  user_id: string
  category_id: string | null
  subcategory_id: string | null
  title: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  currency: string
  condition: string | null
  status: listing_status
  is_featured: boolean
  is_boosted: boolean
  boost_type: string | null
  boost_plan: string | null
  boost_status: string | null
  boost_expires_at: string | null
  boost_priority_score: number
  negotiable: boolean
  views_count: number
  favorites_count: number
  whatsapp_number: string | null
  phone_number: string | null
  state: string | null
  lga: string | null
  city: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  specifications: Json | null
  metadata: Json | null
  created_at: string
  updated_at: string
  expires_at: string | null
}

export interface ListingInsert {
  id?: string
  user_id: string
  category_id?: string | null
  subcategory_id?: string | null
  title: string
  slug?: string
  description?: string | null
  short_description?: string | null
  price: number
  currency?: string
  condition?: string | null
  status?: listing_status
  is_featured?: boolean
  is_boosted?: boolean
  boost_type?: string | null
  boost_plan?: string | null
  boost_status?: string | null
  boost_expires_at?: string | null
  boost_priority_score?: number
  negotiable?: boolean
  views_count?: number
  favorites_count?: number
  whatsapp_number?: string | null
  phone_number?: string | null
  state?: string | null
  lga?: string | null
  city?: string | null
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  specifications?: Json | null
  metadata?: Json | null
  created_at?: string
  updated_at?: string
  expires_at?: string | null
}

export interface ListingUpdate {
  title?: string
  slug?: string
  description?: string | null
  short_description?: string | null
  price?: number
  currency?: string
  condition?: string | null
  status?: listing_status
  is_featured?: boolean
  is_boosted?: boolean
  boost_type?: string | null
  boost_plan?: string | null
  boost_status?: string | null
  boost_expires_at?: string | null
  boost_priority_score?: number
  negotiable?: boolean
  whatsapp_number?: string | null
  phone_number?: string | null
  state?: string | null
  lga?: string | null
  city?: string | null
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  specifications?: Json | null
  metadata?: Json | null
  updated_at?: string
  expires_at?: string | null
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  thumbnail_url: string | null
  medium_url: string | null
  storage_path: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface ListingImageInsert {
  id?: string
  listing_id: string
  url: string
  thumbnail_url?: string | null
  medium_url?: string | null
  storage_path: string
  is_primary?: boolean
  sort_order?: number
  created_at?: string
}

export interface ListingImageUpdate {
  url?: string
  thumbnail_url?: string | null
  medium_url?: string | null
  storage_path?: string
  is_primary?: boolean
  sort_order?: number
}

export interface ListingFavorite {
  id: string
  user_id: string
  listing_id: string
  created_at: string
}

export interface ListingFavoriteInsert {
  id?: string
  user_id: string
  listing_id: string
  created_at?: string
}

export interface ListingFavoriteUpdate {
  created_at?: string
}

export interface ListingView {
  id: string
  listing_id: string
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface ListingViewInsert {
  id?: string
  listing_id: string
  user_id?: string | null
  ip_address?: string | null
  user_agent?: string | null
  created_at?: string
}

export interface ListingViewUpdate {
  user_id?: string | null
  user_agent?: string | null
}

export interface Conversation {
  id: string
  listing_id: string | null
  buyer_id: string
  seller_id: string
  last_message_at: string | null
  last_message_preview: string | null
  is_blocked: boolean
  created_at: string
  updated_at: string
}

export interface ConversationInsert {
  id?: string
  listing_id?: string | null
  buyer_id: string
  seller_id: string
  last_message_at?: string | null
  last_message_preview?: string | null
  is_blocked?: boolean
  created_at?: string
  updated_at?: string
}

export interface ConversationUpdate {
  listing_id?: string | null
  last_message_at?: string | null
  last_message_preview?: string | null
  is_blocked?: boolean
  updated_at?: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  message_type: string
  attachment_url: string | null
  attachment_type: string | null
  duration: number | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface MessageInsert {
  id?: string
  conversation_id: string
  sender_id: string
  content?: string | null
  message_type?: string
  attachment_url?: string | null
  attachment_type?: string | null
  duration?: number | null
  is_read?: boolean
  read_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface MessageUpdate {
  content?: string | null
  message_type?: string
  attachment_url?: string | null
  attachment_type?: string | null
  duration?: number | null
  is_read?: boolean
  read_at?: string | null
  updated_at?: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data: Json | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface NotificationInsert {
  id?: string
  user_id: string
  type: string
  title: string
  message: string
  data?: Json | null
  is_read?: boolean
  read_at?: string | null
  created_at?: string
}

export interface NotificationUpdate {
  is_read?: boolean
  read_at?: string | null
}

type boost_plan_type = Database['public']['Enums']['boost_plan_type']

export interface BoostPlan {
  id: string
  name: string
  type: boost_plan_type
  price: number
  duration_days: number
  priority_score: number
  badge_label: string
  badge_icon: string | null
  color_scheme: Json | null
  features: Json | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BoostPlanInsert {
  id?: string
  name: string
  type: boost_plan_type
  price: number
  duration_days: number
  priority_score?: number
  badge_label?: string
  badge_icon?: string | null
  color_scheme?: Json | null
  features?: Json | null
  is_active?: boolean
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export interface BoostPlanUpdate {
  name?: string
  type?: boost_plan_type
  price?: number
  duration_days?: number
  priority_score?: number
  badge_label?: string
  badge_icon?: string | null
  color_scheme?: Json | null
  features?: Json | null
  is_active?: boolean
  sort_order?: number
  updated_at?: string
}

export interface BoostedListing {
  id: string
  listing_id: string
  user_id: string
  plan_id: string
  boost_type: boost_plan_type
  status: string
  start_date: string
  end_date: string
  payment_amount: number
  payment_reference: string | null
  payment_status: string
  auto_renew: boolean
  created_at: string
  updated_at: string
}

export interface BoostedListingInsert {
  id?: string
  listing_id: string
  user_id: string
  plan_id: string
  boost_type: boost_plan_type
  status?: string
  start_date: string
  end_date: string
  payment_amount: number
  payment_reference?: string | null
  payment_status?: string
  auto_renew?: boolean
  created_at?: string
  updated_at?: string
}

export interface BoostedListingUpdate {
  status?: string
  payment_status?: string
  auto_renew?: boolean
  updated_at?: string
}

type report_status = Database['public']['Enums']['report_status']

export interface Report {
  id: string
  reporter_id: string
  listing_id: string | null
  reported_user_id: string | null
  reason: string
  description: string | null
  status: report_status
  reviewed_by: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface ReportInsert {
  id?: string
  reporter_id: string
  listing_id?: string | null
  reported_user_id?: string | null
  reason: string
  description?: string | null
  status?: report_status
  reviewed_by?: string | null
  admin_notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface ReportUpdate {
  status?: report_status
  reviewed_by?: string | null
  admin_notes?: string | null
  updated_at?: string
}

export interface Review {
  id: string
  reviewer_id: string
  listing_id: string | null
  target_user_id: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface ReviewInsert {
  id?: string
  reviewer_id: string
  listing_id?: string | null
  target_user_id: string
  rating: number
  comment?: string | null
  is_approved?: boolean
  created_at?: string
  updated_at?: string
}

export interface ReviewUpdate {
  rating?: number
  comment?: string | null
  is_approved?: boolean
  updated_at?: string
}

type transaction_status = Database['public']['Enums']['transaction_status']
type transaction_type = Database['public']['Enums']['transaction_type']

export interface Transaction {
  id: string
  user_id: string
  type: transaction_type
  amount: number
  currency: string
  reference: string | null
  description: string | null
  status: transaction_status
  metadata: Json | null
  created_at: string
  updated_at: string
}

export interface TransactionInsert {
  id?: string
  user_id: string
  type: transaction_type
  amount: number
  currency?: string
  reference?: string | null
  description?: string | null
  status?: transaction_status
  metadata?: Json | null
  created_at?: string
  updated_at?: string
}

export interface TransactionUpdate {
  status?: transaction_status
  metadata?: Json | null
  updated_at?: string
}

export interface VerificationRequest {
  id: string
  user_id: string
  verification_type: string
  status: verification_status
  document_front_url: string | null
  document_back_url: string | null
  selfie_url: string | null
  business_document_url: string | null
  rejection_reason: string | null
  reviewed_by: string | null
  submitted_at: string
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface VerificationRequestInsert {
  id?: string
  user_id: string
  verification_type: string
  status?: verification_status
  document_front_url?: string | null
  document_back_url?: string | null
  selfie_url?: string | null
  business_document_url?: string | null
  rejection_reason?: string | null
  reviewed_by?: string | null
  submitted_at?: string
  reviewed_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface VerificationRequestUpdate {
  status?: verification_status
  document_front_url?: string | null
  document_back_url?: string | null
  selfie_url?: string | null
  business_document_url?: string | null
  rejection_reason?: string | null
  reviewed_by?: string | null
  submitted_at?: string
  reviewed_at?: string | null
  updated_at?: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_values: Json | null
  new_values: Json | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AuditLogInsert {
  id?: string
  user_id?: string | null
  action: string
  entity_type: string
  entity_id?: string | null
  old_values?: Json | null
  new_values?: Json | null
  ip_address?: string | null
  user_agent?: string | null
  created_at?: string
}

export interface AuditLogUpdate {
  old_values?: Json | null
  new_values?: Json | null
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
