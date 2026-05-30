import { supabase, getServiceRoleClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { http, type RequestConfig } from '@/lib/http-client';
import type { Database, Tables } from '@/types/supabase';

type SupabaseResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, any>;
};

function sbResponse<T>(data: T, status = 200): SupabaseResponse<T> {
  return { data, status, statusText: 'OK', headers: {}, config: {} };
}

function sbError(error: any): SupabaseResponse<null> {
  return { data: null, status: error?.status || 500, statusText: error?.message || 'Error', headers: {}, config: {} };
}

function getUserId(): string | null {
  return useAuthStore.getState().user?.id || supabase.auth.getUser().then(r => r.data?.user?.id || null) as any || null;
}

async function ensureUserId(): Promise<string | null> {
  const storeId = useAuthStore.getState().user?.id;
  if (storeId) return String(storeId);
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

function transformListing(listing: any, includeImages = true): any {
  if (!listing) return listing;
  const result: any = {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    description: listing.description,
    short_description: listing.short_description,
    price: listing.price,
    currency: listing.currency || 'NGN',
    condition: listing.condition,
    status: listing.status,
    is_featured: listing.is_featured,
    is_boosted: listing.is_boosted,
    boost_type: listing.boost_type,
    negotiable: listing.negotiable,
    views: listing.views_count || 0,
    views_count: listing.views_count || 0,
    favorites_count: listing.favorites_count || 0,
    whatsapp: listing.whatsapp_number,
    phone: listing.phone_number,
    sellerPhone: listing.phone_number,
    phone_number: listing.phone_number,
    state: listing.state,
    lga: listing.lga,
    city: listing.city,
    location: listing.location,
    specifications: listing.specifications,
    attributes: listing.specifications,
    metadata: listing.metadata,
    created_at: listing.created_at,
    updated_at: listing.updated_at,
    expires_at: listing.expires_at,
    category_id: listing.category_id,
    subcategory_id: listing.subcategory_id,
    user_id: listing.user_id,
  };

  if (listing.category) {
    result.category = listing.category;
  }

  if (listing.subcategory) {
    result.subcategory = listing.subcategory;
  }

  if (listing.user) {
    result.user = {
      id: listing.user.id,
      name: listing.user.full_name || listing.user.username || '',
      full_name: listing.user.full_name,
      username: listing.user.username,
      email: listing.user.email,
      phone: listing.user.phone,
      avatar: listing.user.avatar_url,
      avatar_url: listing.user.avatar_url,
      full_avatar_url: listing.user.avatar_url,
      location: listing.user.location,
      created_at: listing.user.created_at,
      verified: listing.user.is_verified || false,
      is_verified_seller: listing.user.is_verified || false,
      is_verified_business: (listing.user as any)?.is_verified_business || false,
      rating_avg: listing.user.rating_avg,
      response_time: listing.user.response_time_avg,
      completed_transactions: listing.user.completed_transactions,
    };
    if (!result.sellerName) result.sellerName = result.user.name;
  }

  if (listing.profiles) {
    result.user = {
      id: listing.profiles.id,
      name: listing.profiles.full_name || listing.profiles.username || '',
      full_name: listing.profiles.full_name,
      username: listing.profiles.username,
      email: listing.profiles.email,
      phone: listing.profiles.phone,
      avatar: listing.profiles.avatar_url,
      avatar_url: listing.profiles.avatar_url,
      full_avatar_url: listing.profiles.avatar_url,
      location: listing.profiles.location,
      created_at: listing.profiles.created_at,
      verified: listing.profiles.is_verified || false,
      is_verified_seller: listing.profiles.is_verified || false,
      rating_avg: listing.profiles.rating_avg,
      response_time: listing.profiles.response_time_avg,
      completed_transactions: listing.profiles.completed_transactions,
    };
  }

  return result;
}

function transformListings(listings: any[]): any[] {
  return (listings || []).map(l => transformListing(l));
}

function imgAbs(url: string | undefined | null): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://')) return url || '';
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

function fromLaravelAd(ad: any): any {
  if (!ad) return ad;
  const images = (ad.images || []).map((img: any) => ({
    id: img.id,
    url: imgAbs(img.url),
    thumbnail_url: imgAbs(img.thumbnail_url || img.thumbnail),
    medium_url: imgAbs(img.medium_url),
    is_primary: img.is_primary,
  }));
  const singleImage = images.length > 0 ? images[0] : (ad.image ? {
    id: ad.image.id,
    url: imgAbs(ad.image.url),
    thumbnail_url: imgAbs(ad.image.thumbnail_url || ad.image.thumbnail),
    medium_url: imgAbs(ad.image.medium_url),
    is_primary: true,
  } : null);
  return {
    id: ad.id,
    title: ad.title,
    slug: ad.slug,
    description: ad.short_description || '',
    short_description: ad.short_description || '',
    price: ad.price,
    currency: ad.currency || 'NGN',
    condition: ad.condition,
    status: ad.status || 'active',
    negotiable: ad.negotiable,
    views: ad.views || 0,
    views_count: ad.views || 0,
    favorites_count: 0,
    is_featured: false,
    is_boosted: ad.is_boosted || false,
    boost_type: ad.boost_type || null,
    boost_status: ad.boost_status || null,
    boost_expires_at: ad.boost_expires_at || null,
    whatsapp: ad.whatsapp || ad.phone || '',
    phone: ad.phone || '',
    sellerPhone: ad.phone || '',
    phone_number: ad.phone || '',
    state: ad.state || '',
    lga: ad.lga || '',
    city: '',
    location: ad.location?.name || ad.state || '',
    specifications: [],
    attributes: [],
    metadata: null,
    created_at: ad.created_at,
    updated_at: ad.updated_at || ad.created_at,
    expires_at: null,
    category_id: ad.category?.id,
    subcategory_id: ad.subcategory?.id,
    user_id: ad.user?.id,
    category: ad.category || null,
    subcategory: ad.subcategory || null,
    user: ad.user ? {
      id: ad.user.id,
      name: ad.user.name || '',
      full_name: ad.user.name || '',
      username: '',
      email: ad.user.email || '',
      phone: ad.user.phone || '',
      avatar: imgAbs(ad.user.avatar || ad.user.avatar_url || ''),
      avatar_url: imgAbs(ad.user.avatar || ad.user.avatar_url || ''),
      full_avatar_url: imgAbs(ad.user.avatar || ad.user.avatar_url || ''),
      location: '',
      created_at: null,
      verified: ad.user.is_verified || false,
      is_verified: ad.user.is_verified || false,
      is_verified_seller: ad.user.is_verified || false,
      is_verified_business: false,
      rating_avg: null,
      response_time: null,
      completed_transactions: null,
    } : undefined,
    image_url: singleImage?.url || imgAbs(ad.image_url) || null,
    images_count: images.length || (singleImage ? 1 : 0),
    images: images.length > 0 ? images : (singleImage ? [singleImage] : []),
  };
}

function fromLaravelAdDetail(ad: any): any {
  if (!ad) return ad;
  const base = fromLaravelAd(ad);
  base.description = ad.description || base.description;
  base.specifications = ad.specifications || ad.attributes || [];
  base.attributes = ad.attributes || [];
  if (ad.user) {
    base.user = {
      ...base.user,
      full_avatar_url: ad.user.full_avatar_url || ad.user.avatar || ad.user.avatar_url,
      google_avatar: ad.user.google_avatar,
      facebook_avatar: ad.user.facebook_avatar,
      location: ad.user.location || '',
      created_at: ad.user.created_at,
      is_verified_seller: ad.user.is_verified || false,
      is_verified_business: ad.user.is_verified_business || false,
    };
  }
  return base;
}

const PAGE_SIZE = 20;

function buildMeta(total: number, page: number, perPage: number) {
  return {
    total,
    per_page: perPage,
    current_page: page,
    last_page: Math.ceil(total / perPage) || 1,
    from: (page - 1) * perPage + 1,
    to: Math.min(page * perPage, total),
  };
}

// ==============================
//  AUTH API
// ==============================
export const authApi = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return sbError(error);
    const profile = await supabase.from('profiles').select('*').eq('id', data.user?.id).single();
    const token = data.session?.access_token || '';
    return sbResponse({
      data: {
        user: { ...profile.data, id: data.user?.id },
        token,
        access_token: token,
      },
      message: 'Login successful',
    });
  },

  register: async (name: string, email: string, password: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone } },
    });
    if (error) return sbError(error);
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        email,
        phone: phone || null,
        username: email.split('@')[0],
      });
    }
    return sbResponse({ data: { user: data.user, session: data.session } });
  },

  logout: async () => {
    await supabase.auth.signOut();
    return sbResponse({ data: { message: 'Logged out' } });
  },

  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return sbError(error || { message: 'Not authenticated' });
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return sbResponse({
      data: {
        ...profile,
        id: user.id,
        email: user.email,
      },
    });
  },

  updateProfile: async (data: { name?: string; phone?: string; location?: string; avatar?: File }) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const updates: any = {};
    if (data.name) updates.full_name = data.name;
    if (data.phone) updates.phone = data.phone;
    if (data.location) updates.location = data.location;
    if (data.avatar) {
      const fileExt = data.avatar.name.split('.').pop();
      const filePath = `avatars/${userId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, data.avatar, { upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        updates.avatar_url = publicUrl;
      }
    }
    const { data: profile, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    if (error) return sbError(error);
    return sbResponse({ data: profile });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return sbError(error);
    return sbResponse({ data: { message: 'Password changed' } });
  },

  setup2FA: async () => sbResponse({ data: { message: '2FA not available', secret: '' } }),
  enable2FA: async (_code: string) => sbResponse({ data: { message: '2FA not available' } }),
  disable2FA: async (_code: string) => sbResponse({ data: { message: '2FA not available' } }),
  verify2FA: async (_code: string) => sbResponse({ data: { message: '2FA not available' } }),

  deleteAccount: async (password: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.rpc('delete_user', { password } as any);
    return error ? sbError(error) : sbResponse({ data: { message: 'Account deleted' } });
  },
};

// ==============================
//  CATEGORIES API
// ==============================
export const categoriesApi = {
  getAll: async () => {
    try {
      const res = await http.get('/categories');
      const raw = (res?.data?.data || []) as any[];
      const allCats = raw.map((cat: any) => ({
        ...cat,
        id: String(cat.id),
        children: (cat.activeChildren || []).map((s: any) => ({ ...s, id: String(s.id), parent_id: String(cat.id), ad_count: s.ad_count || 0 })),
      }));
      return sbResponse({ data: allCats });
    } catch {
      return sbResponse({ data: [] });
    }
  },

  getById: async (id: number) => {
    try {
      const res = await http.get(`/categories/${id}`);
      const cat = res?.data?.data || res?.data || null;
      return cat ? sbResponse({ data: cat }) : sbError({ message: 'Category not found' });
    } catch { return sbError({ message: 'Category not found' }); }
  },

  getBySlug: async (slug: string) => {
    try {
      const res = await http.get(`/categories/${slug}`);
      const cat = res?.data?.data || res?.data || null;
      return cat ? sbResponse({ data: cat }) : sbError({ message: 'Category not found' });
    } catch { return sbError({ message: 'Category not found' }); }
  },

  getSubcategories: async (_parentId: number) => {
    return sbResponse({ data: [] });
  },
};

// ==============================
//  LOCATIONS API
// ==============================
export const locationsApi = {
  getAll: async () => sbResponse({ data: [] }),
  getById: async (_id: number) => sbResponse({ data: null }),
  getBySlug: async (_slug: string) => sbResponse({ data: null }),
  getChildren: async (_parentId: number) => sbResponse({ data: [] }),
};

// ==============================
//  ADS API
// ==============================
export const adsApi = {
  get: async (id: number) => {
    try {
      const res = await http.get(`/ads/${id}`);
      const ad = res?.data?.data || res?.data || null;
      if (!ad) return sbError({ message: 'Ad not found' });
      return sbResponse({ data: fromLaravelAdDetail(ad) });
    } catch (e: any) {
      return sbError(e);
    }
  },

  getAll: async (params?: Record<string, any>) => {
    try {
      const res = await http.get('/ads', { params: params as any });
      const responseData = res?.data || { data: [], meta: null };
      return sbResponse({
        data: (responseData.data || []).map(fromLaravelAd),
        meta: responseData.meta || buildMeta(0, params?.page || 1, params?.per_page || params?.limit || PAGE_SIZE),
      });
    } catch (e: any) {
      return sbError(e);
    }
  },

  getById: async (id: number) => adsApi.get(id),

  getBySlug: async (slug: string) => {
    try {
      const res = await http.get(`/ads/${slug}`);
      const ad = res?.data?.data || res?.data || null;
      if (!ad) return sbError({ message: 'Ad not found' });
      return sbResponse({ data: fromLaravelAdDetail(ad) });
    } catch (e: any) {
      return sbError(e);
    }
  },

  getFeatured: async (limit = 10) => {
    try {
      const res = await http.get('/ads/featured');
      return sbResponse({ data: ((res?.data?.data || []).map(fromLaravelAd)) });
    } catch (e: any) {
      return sbError(e);
    }
  },

  getRecent: async (limit = 20) => {
    try {
      const res = await http.get('/ads/recent');
      return sbResponse({ data: ((res?.data?.data || []).map(fromLaravelAd)) });
    } catch (e: any) {
      return sbError(e);
    }
  },

  getSimilar: async (adId: number, limit = 8) => {
    try {
      const res = await http.get('/ads/similar', { params: { ad_id: adId, limit } as any });
      return sbResponse({ data: ((res?.data?.data || []).map(fromLaravelAd)) });
    } catch (e: any) {
      return sbError(e);
    }
  },

  create: async (formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const listing: any = { user_id: userId, status: 'active' };
    for (const [key, value] of Array.from(formData.entries())) {
      if (key !== 'images[]' && key !== 'image') {
        listing[key] = value;
      }
    }
    if (!listing.slug) listing.slug = listing.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const { data, error } = await supabase.from('listings').insert(listing).select().single();
    if (error) return sbError(error);

    const images = formData.getAll('images[]').concat(formData.getAll('image')).filter(Boolean);
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i] as File;
        const ext = file.name.split('.').pop();
        const path = `listings/${data.id}/${i}.${ext}`;
        await supabase.storage.from('listing-images').upload(path, file);
        const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path);
        await supabase.from('listing_images').insert({
          listing_id: data.id,
          url: publicUrl,
          storage_path: path,
          is_primary: i === 0,
          sort_order: i,
        });
      }
    }
    return sbResponse({ data });
  },

  update: async (id: number, formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const updates: any = {};
    for (const [key, value] of Array.from(formData.entries())) {
      if (key !== 'images[]' && key !== 'image' && key !== '_method') {
        updates[key] = value;
      }
    }
    const { data, error } = await supabase.from('listings').update(updates).eq('id', String(id)).eq('user_id', userId).select().single();
    return error ? sbError(error) : sbResponse({ data });
  },

  delete: async (slug: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { data: listing } = await supabase.from('listings').select('id').eq('slug', slug).single();
    if (!listing) return sbError({ message: 'Not found' });
    const { error } = await supabase.from('listings').delete().eq('id', listing.id).eq('user_id', userId);
    return error ? sbError(error) : sbResponse({ data: { message: 'Deleted' } });
  },

  deleteById: async (id: number) => {
    const { error } = await supabase.from('listings').delete().eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Deleted' } });
  },

  incrementViews: async (id: number) => {
    await supabase.rpc('increment_listing_views', { listing_id: String(id) } as any);
    return sbResponse({ data: { message: 'View counted' } });
  },

  getMyAds: async (params?: Record<string, any>) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    return adsApi.getAll({ ...params, user_id: userId });
  },

  pause: async (id: number) => {
    const { error } = await supabase.from('listings').update({ status: 'inactive' }).eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Ad paused' } });
  },

  reactivate: async (id: number) => {
    const { error } = await supabase.from('listings').update({ status: 'active' }).eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Ad reactivated' } });
  },

  sold: async (id: number) => {
    const { error } = await supabase.from('listings').update({ status: 'sold' }).eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Marked as sold' } });
  },

  renew: async (id: number) => {
    const { error } = await supabase.from('listings').update({ status: 'active', created_at: new Date().toISOString() }).eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Ad renewed' } });
  },
};

// ==============================
//  FAVORITES API
// ==============================
export const favoritesApi = {
  getAll: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('listing_favorites').select('*, listings(*, profiles(*))').eq('user_id', userId).limit(50);
    if (error) return sbError(error);
    return sbResponse({
      data: (data || []).map((f: any) => transformListing({ ...f.listings, user: f.listings?.profiles })),
    });
  },

  add: async (adId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('listing_favorites').insert({ user_id: userId, listing_id: String(adId) });
    return error ? sbError(error) : sbResponse({ data: { message: 'Added to favorites' } });
  },

  remove: async (adId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('listing_favorites').delete().eq('user_id', userId).eq('listing_id', String(adId));
    return error ? sbError(error) : sbResponse({ data: { message: 'Removed from favorites' } });
  },

  check: async (adId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { is_favorited: false } });
    const { data } = await supabase.from('listing_favorites').select('id').eq('user_id', userId).eq('listing_id', String(adId)).maybeSingle();
    return sbResponse({ data: { is_favorited: !!data } });
  },
};

// ==============================
//  MESSAGES API
// ==============================
export const messagesApi = {
  getConversations: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('conversations').select('*, listings(title, slug), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*)')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })
      .limit(50);
    if (error) return sbError(error);
    return sbResponse({ data: (data || []).map((c: any) => ({
      id: c.id,
      ad_id: c.listing_id,
      ad_title: c.listings?.title,
      ad: c.listings,
      other_user: c.buyer_id === userId ? c.seller : c.buyer,
      last_message: c.last_message_preview,
      last_message_at: c.last_message_at,
      unread_count: 0,
      is_blocked: c.is_blocked,
    })) });
  },

  getMessages: async (conversationId: number) => {
    const { data, error } = await supabase.from('messages').select('*, sender:profiles!messages_sender_id_fkey(*)').eq('conversation_id', String(conversationId)).order('created_at', { ascending: true }).limit(100);
    if (error) return sbError(error);
    return sbResponse({ data: (data || []).map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      sender: m.sender ? { id: m.sender.id, name: m.sender.full_name || m.sender.username, avatar: m.sender.avatar_url } : null,
      message: m.content,
      content: m.content,
      message_type: m.message_type,
      attachment: m.attachment_url,
      attachment_url: m.attachment_url,
      duration: m.duration,
      is_read: m.is_read,
      created_at: m.created_at,
    })) });
  },

  sendMessage: async (conversationId: number, content: string, attachment?: File | Blob, messageType?: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const msg: any = {
      conversation_id: String(conversationId),
      sender_id: userId,
      content,
      message_type: messageType || 'text',
    };
    if (attachment) {
      const isBlob = attachment instanceof Blob && !(attachment instanceof File);
      const fileName = isBlob ? `voice_${Date.now()}.webm` : (attachment as File).name;
      const path = `messages/${conversationId}/${Date.now()}_${fileName}`;
      await supabase.storage.from('message-attachments').upload(path, attachment);
      const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(path);
      msg.attachment_url = publicUrl;
    }
    const { data, error } = await supabase.from('messages').insert(msg).select().single();
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString(), last_message_preview: content }).eq('id', String(conversationId));
    return error ? sbError(error) : sbResponse({ data });
  },

  sendVoiceMessage: async (conversationId: number, audioBlob: Blob, duration: number, _onProgress?: (pct: number) => void) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const path = `messages/${conversationId}/voice_${Date.now()}.webm`;
    await supabase.storage.from('message-attachments').upload(path, audioBlob);
    const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(path);
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: String(conversationId),
      sender_id: userId,
      content: '',
      message_type: 'voice',
      attachment_url: publicUrl,
      duration,
    }).select().single();
    return error ? sbError(error) : sbResponse({ data });
  },

  sendMessageNew: async (receiverId: number, adId: number | null, content: string, _messageType?: string, _attachment?: File | Blob, _duration?: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    let convId: string | null = null;
    const { data: existing } = await supabase.from('conversations').select('id')
      .or(`and(buyer_id.eq.${userId},seller_id.eq.${String(receiverId)}),and(buyer_id.eq.${String(receiverId)},seller_id.eq.${userId})`)
      .maybeSingle();
    if (existing) {
      convId = existing.id;
    } else {
      const { data: newConv } = await supabase.from('conversations').insert({
        listing_id: adId ? String(adId) : null,
        buyer_id: userId,
        seller_id: String(receiverId),
      }).select().single();
      convId = newConv?.id || null;
    }
    if (!convId) return sbError({ message: 'Failed to create conversation' });
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: userId,
      content,
      message_type: 'text',
    }).select().single();
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString(), last_message_preview: content }).eq('id', convId);
    return error ? sbError(error) : sbResponse({ data });
  },

  startConversation: async (adId: number, content: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { data: listing } = await supabase.from('listings').select('user_id').eq('id', String(adId)).single();
    if (!listing) return sbError({ message: 'Ad not found' });
    return messagesApi.sendMessageNew(listing.user_id as any, adId, content);
  },

  markAsRead: async (conversationId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', String(conversationId)).neq('sender_id', userId);
    return error ? sbError(error) : sbResponse({ data: { message: 'Marked as read' } });
  },

  deleteMessage: async (messageId: number) => {
    const { error } = await supabase.from('messages').delete().eq('id', String(messageId));
    return error ? sbError(error) : sbResponse({ data: { message: 'Deleted' } });
  },
};

// ==============================
//  FOLLOW API
// ==============================
export const followApi = {
  follow: async (followingId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('follows' as any).insert({ follower_id: userId, following_id: String(followingId) } as any);
    return error ? sbError(error) : sbResponse({ data: { message: 'Followed' } });
  },
  unfollow: async (followingId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('follows' as any).delete().eq('follower_id', userId).eq('following_id', String(followingId)) as any;
    return error ? sbError(error) : sbResponse({ data: { message: 'Unfollowed' } });
  },
  checkFollow: async (followingId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { is_following: false } });
    const { data } = await supabase.from('follows' as any).select('id').eq('follower_id', userId).eq('following_id', String(followingId)).maybeSingle() as any;
    return sbResponse({ data: { is_following: !!data } });
  },
  getFollowers: async (_userId: number, _page = 1) => sbResponse({ data: [] }),
  getFollowing: async (_userId: number, _page = 1) => sbResponse({ data: [] }),
  getUserStats: async (_userId: number) => sbResponse({ data: { followers_count: 0, following_count: 0 } }),
  getFollowingFeed: async (_page = 1) => sbResponse({ data: [] }),
  getSuggestedSellers: async () => sbResponse({ data: [] }),
};

// ==============================
//  REVIEWS API
// ==============================
export const reviewsApi = {
  getUserReviews: async (userId: number) => {
    const { data, error } = await supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)').eq('target_user_id', String(userId)).order('created_at', { ascending: false }).limit(50);
    if (error) return sbError(error);
    return sbResponse({ data: (data || []).map((r: any) => ({ ...r, user: r.reviewer })) });
  },
  create: async (data: { user_id: number; rating: number; comment: string; ad_id?: number }) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('reviews').insert({
      reviewer_id: userId,
      buyer_id: userId,
      target_user_id: String(data.user_id),
      listing_id: data.ad_id ? String(data.ad_id) : null,
      rating: data.rating,
      comment: data.comment,
    });
    return error ? sbError(error) : sbResponse({ data: { message: 'Review created' } });
  },
  getMyReviews: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('reviews').select('*').eq('reviewer_id', userId).limit(50);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  getAdReviews: async (adId: number) => {
    const { data, error } = await supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)').eq('listing_id', String(adId)).limit(50);
    return error ? sbError(error) : sbResponse({ data: (data || []).map((r: any) => ({ ...r, user: r.reviewer })) });
  },
  getAdReviewSummary: async (adId: number) => {
    const { data } = await supabase.from('reviews').select('rating').eq('listing_id', String(adId));
    const ratings = (data || []).map((r: any) => r.rating);
    const avg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
    return sbResponse({ data: { average: avg, count: ratings.length, distribution: {} } });
  },
  getAdLatestReviews: async (adId: number) => {
    const { data, error } = await supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)').eq('listing_id', String(adId)).order('created_at', { ascending: false }).limit(5);
    return error ? sbError(error) : sbResponse({ data: (data || []).map((r: any) => ({ ...r, user: r.reviewer })) });
  },
};

// ==============================
//  SELLER REVIEWS API
// ==============================
export const sellerReviewsApi = {
  getReviews: async (sellerId: number, _params?: any) => {
    return reviewsApi.getUserReviews(sellerId);
  },
  getLatestReviews: async (sellerId: number) => {
    const { data, error } = await supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)').eq('target_user_id', String(sellerId)).order('created_at', { ascending: false }).limit(5);
    return error ? sbError(error) : sbResponse({ data: (data || []).map((r: any) => ({ ...r, user: r.reviewer })) });
  },
  getRatingSummary: async (sellerId: number) => {
    const { data } = await supabase.from('reviews').select('rating').eq('target_user_id', String(sellerId));
    const ratings = (data || []).map((r: any) => r.rating);
    const avg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
    return sbResponse({ data: { average: avg, count: ratings.length, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } } });
  },
  getSellerProfile: async (sellerId: number) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', String(sellerId)).single();
    return error ? sbError(error) : sbResponse({ data });
  },
  canReview: async (sellerId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { can_review: false } });
    const { data } = await supabase.from('reviews').select('id').eq('reviewer_id', userId).eq('target_user_id', String(sellerId)).maybeSingle();
    return sbResponse({ data: { can_review: !data } });
  },
  getMyReview: async (sellerId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: null });
    const { data, error } = await supabase.from('reviews').select('*').eq('reviewer_id', userId).eq('target_user_id', String(sellerId)).maybeSingle();
    return error ? sbError(error) : sbResponse({ data });
  },
  submitReview: async (sellerId: number, data: { rating: number; comment?: string; ad_id?: number }) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('reviews').insert({
      reviewer_id: userId, buyer_id: userId,
      target_user_id: String(sellerId),
      listing_id: data.ad_id ? String(data.ad_id) : null,
      rating: data.rating, comment: data.comment || null,
    });
    return error ? sbError(error) : sbResponse({ data: { message: 'Review submitted' } });
  },
  updateReview: async (reviewId: number, data: { rating: number; comment?: string }) => {
    const { error } = await supabase.from('reviews').update({ rating: data.rating, comment: data.comment }).eq('id', String(reviewId));
    return error ? sbError(error) : sbResponse({ data: { message: 'Review updated' } });
  },
  deleteReview: async (reviewId: number) => {
    const { error } = await supabase.from('reviews').delete().eq('id', String(reviewId));
    return error ? sbError(error) : sbResponse({ data: { message: 'Review deleted' } });
  },
  markHelpful: async (_reviewId: number) => sbResponse({ data: { message: 'Marked helpful' } }),
  reportReview: async (_reviewId: number, _reason: string) => sbResponse({ data: { message: 'Reported' } }),
};

// ==============================
//  REPORTS API
// ==============================
export const reportsApi = {
  create: async (data: { ad_id: number; reason: string; description: string }) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('reports').insert({
      reporter_id: userId,
      listing_id: String(data.ad_id),
      reason: data.reason,
      description: data.description,
    });
    return error ? sbError(error) : sbResponse({ data: { message: 'Report submitted' } });
  },
  getMyReports: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('reports').select('*').eq('reporter_id', userId);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
};

// ==============================
//  NOTIFICATIONS API
// ==============================
export const notificationsApi = {
  getAll: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  markAsRead: async (id: number) => {
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Marked as read' } });
  },
  getUnread: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).eq('is_read', false).order('created_at', { ascending: false }).limit(50);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  markAllAsRead: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).is('is_read', false);
    return error ? sbError(error) : sbResponse({ data: { message: 'All marked as read' } });
  },
  markAllRead: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).is('is_read', false);
    return error ? sbError(error) : sbResponse({ data: { message: 'All marked as read' } });
  },
  markRead: async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id);
    return error ? sbError(error) : sbResponse({ data: { message: 'Marked as read' } });
  },
  deleteAll: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('notifications').delete().eq('user_id', userId);
    return error ? sbError(error) : sbResponse({ data: { message: 'All deleted' } });
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    return error ? sbError(error) : sbResponse({ data: { message: 'Deleted' } });
  },
  getUnreadCount: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { count: 0 } });
    const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false);
    return error ? sbError(error) : sbResponse({ data: { count: count || 0 } });
  },
};

// ==============================
//  BANNERS API
// ==============================
export const bannersApi = {
  getAll: async (_position?: string) => sbResponse({ data: [] }),
  getActive: async (_position?: string) => sbResponse({ data: [] }),
};

// ==============================
//  DASHBOARD API
// ==============================
export const dashboardApi = {
  getStats: async () => sbResponse({ data: { total_ads: 0, active_ads: 0, total_views: 0, total_favorites: 0 } }),
  getRecentAds: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    try {
      const res = await http.get('/ads', { params: { user_id: userId, limit: 5 } as any });
      return sbResponse({ data: ((res?.data?.data || []).map(fromLaravelAd)) });
    } catch {
      return sbResponse({ data: [] });
    }
  },
  getAnalytics: async (_period?: string) => sbResponse({ data: { views: [], clicks: [] } }),
};

// ==============================
//  SEARCH API
// ==============================
export const searchApi = {
  search: async (params: Record<string, any>) => {
    try {
      const res = await http.get('/search', { params: params as any });
      const responseData = res?.data || { data: [], meta: null };
      return sbResponse({
        data: (responseData.data || []).map(fromLaravelAd),
        meta: responseData.meta || buildMeta(0, params.page || 1, params.per_page || PAGE_SIZE),
      });
    } catch (e: any) {
      return sbError(e);
    }
  },

  suggestions: async (keyword: string) => {
    if (!keyword) return sbResponse({ data: { categories: [], ads: [] } });
    try {
      const res = await http.get('/search/suggestions', { params: { q: keyword } as any });
      return sbResponse({ data: res?.data || { categories: [], ads: [] } });
    } catch {
      return sbResponse({ data: { categories: [], ads: [] } });
    }
  },

  trending: async () => {
    try {
      const res = await http.get('/ads', { params: { limit: 10, order_by: 'views' } as any });
      return sbResponse({ data: ((res?.data?.data || []).map(fromLaravelAd)) });
    } catch (e: any) {
      return sbError(e);
    }
  },
};

// ==============================
//  NOTIFICATIONS PREFERENCES API
// ==============================
export const notificationsPreferencesApi = {
  get: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: {} });
    const { data } = await supabase.from('profiles').select('notification_preferences').eq('id', userId).single();
    return sbResponse({ data: (data as any)?.notification_preferences || {} });
  },
  update: async (prefs: any) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('profiles').update({ notification_preferences: prefs } as any).eq('id', userId);
    return error ? sbError(error) : sbResponse({ data: prefs });
  },
};

// ==============================
//  PROMOTIONS API
// ==============================
export const promotionsApi = {
  getPlans: async () => {
    const { data, error } = await supabase.from('boost_plans').select('*').eq('is_active', true).order('sort_order');
    return error ? sbError(error) : sbResponse({ data: (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      price: p.price,
      duration_days: p.duration_days,
      priority_score: p.priority_score,
      badge_label: p.badge_label,
      badge_icon: p.badge_icon,
      color_scheme: p.color_scheme,
      features: p.features,
    })) });
  },
  buy: async (data: { ad_id: number; plan_id: number; payment_method: string }) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { data: plan } = await supabase.from('boost_plans').select('*').eq('id', String(data.plan_id)).single();
    if (!plan) return sbError({ message: 'Plan not found' });
    const { error } = await supabase.from('boosted_listings').insert({
      listing_id: String(data.ad_id),
      user_id: userId,
      plan_id: String(data.plan_id),
      boost_type: plan.type,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + plan.duration_days * 86400000).toISOString(),
      payment_amount: plan.price,
      payment_status: data.payment_method === 'wallet' ? 'completed' : 'pending',
      status: data.payment_method === 'wallet' ? 'active' : 'pending',
    });
    return error ? sbError(error) : sbResponse({ data: { message: 'Promotion purchased' } });
  },
  verifyPayment: async (_reference: string) => sbResponse({ data: { message: 'Payment verified' } }),
  getMyPromotions: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('boosted_listings').select('*, boost_plans(*)').eq('user_id', userId).limit(50);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  getAdPromotions: async (_adId: number) => sbResponse({ data: [] }),
  cancel: async (_promotionId: number) => sbResponse({ data: { message: 'Cancelled' } }),
};

// ==============================
//  WALLET API
// ==============================
export const walletApi = {
  getBalance: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { balance: 0 } });
    const { data, error } = await supabase.from('transactions').select('amount, type').eq('user_id', userId);
    if (error) return sbError(error);
    const balance = (data || []).reduce((acc: number, t: any) => t.type === 'credit' ? acc + (t.amount || 0) : acc - (t.amount || 0), 0);
    return sbResponse({ data: { balance, currency: 'NGN' } });
  },
  getTransactions: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  fundWallet: async (_amount: number, _method: string) => sbResponse({ data: { message: 'Funding initiated', reference: `REF-${Date.now()}` } }),
  verifyPayment: async (_reference: string) => sbResponse({ data: { message: 'Payment verified' } }),
  checkBalance: async (_amount: number) => sbResponse({ data: { sufficient: true } }),
  uploadBankProof: async (_reference: string, _proof: File) => sbResponse({ data: { message: 'Proof uploaded' } }),
};

// ==============================
//  IMAGE UPLOAD API
// ==============================
export const imageUploadApi = {
  upload: async (file: File, _onProgress?: (pct: number) => void) => {
    const path = `uploads/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file);
    if (error) return sbError(error);
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
    return sbResponse({ data: { url: publicUrl, path } });
  },
};

// ==============================
//  GROWTH & BOOST API
// ==============================
export const growthApi = {
  getBoostPrices: async () => sbResponse({ data: [] }),
  myBoosts: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('boosted_listings').select('*').eq('user_id', userId).limit(50);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  boostAd: async (_adId: number, _data: any) => sbResponse({ data: { message: 'Boosted' } }),
  postSubmissionBoost: async (_adId: number, _data: any) => sbResponse({ data: { message: 'Boosted' } }),
  getBoostStatus: async (_adId: number) => sbResponse({ data: { is_boosted: false } }),
  saveAd: async (adId: number) => favoritesApi.add(adId),
  unsaveAd: async (adId: number) => favoritesApi.remove(adId),
  checkSavedStatus: async (adId: number) => favoritesApi.check(adId),
  getSavedAds: async (_params?: any) => favoritesApi.getAll(),
  getShareLink: async (_adId: number) => sbResponse({ data: { url: '' } }),
  getRecentlyViewed: async (_params?: any) => sbResponse({ data: [] }),
  clearRecentlyViewed: async () => sbResponse({ data: { message: 'Cleared' } }),
};

// ==============================
//  PAYMENT API
// ==============================
export const paymentApi = {
  verifyPayment: async (_reference: string) => sbResponse({ data: { message: 'Verified' } }),
  getPaystackPublicKey: async () => sbResponse({ data: { public_key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '' } }),
  getPendingPayments: async () => sbResponse({ data: [] }),
  cancelPayment: async (_id: number) => sbResponse({ data: { message: 'Cancelled' } }),
};

// ==============================
//  ADMIN BANK TRANSFERS API
// ==============================
export const adminBankTransfersApi = {
  getTransfers: async (_status?: string) => sbResponse({ data: [] }),
  getStats: async () => sbResponse({ data: { total: 0, pending: 0, approved: 0, rejected: 0 } }),
  approve: async (_id: number) => sbResponse({ data: { message: 'Approved' } }),
  reject: async (_id: number, _note?: string) => sbResponse({ data: { message: 'Rejected' } }),
};

// ==============================
//  STORE API
// ==============================
export const storeApi = {
  getMyStore: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return error ? sbError(error) : sbResponse({ data: { ...data, name: data?.full_name || data?.username } });
  },
  getBySlug: async (_slug: string) => sbResponse({ data: null }),
  getByUser: async (userId: number) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', String(userId)).single();
    return error ? sbError(error) : sbResponse({ data });
  },
  create: async (formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const updates: any = {};
    for (const [k, v] of Array.from(formData.entries())) updates[k] = v;
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    return error ? sbError(error) : sbResponse({ data });
  },
  update: async (formData: FormData) => storeApi.create(formData),
  uploadLogo: async (file: File) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const path = `stores/${userId}/logo_${Date.now()}`;
    await supabase.storage.from('store-assets').upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(path);
    return sbResponse({ data: { url: publicUrl } });
  },
  uploadBanner: async (file: File) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const path = `stores/${userId}/banner_${Date.now()}`;
    await supabase.storage.from('store-assets').upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(path);
    return sbResponse({ data: { url: publicUrl } });
  },
  follow: async (_storeId: number) => sbResponse({ data: { message: 'Followed' } }),
  unfollow: async (_storeId: number) => sbResponse({ data: { message: 'Unfollowed' } }),
  checkFollow: async (_storeId: number) => sbResponse({ data: { is_following: false } }),
  getFollowers: async (_storeId: number) => sbResponse({ data: [] }),
  getAnalytics: async (_period?: string) => sbResponse({ data: {} }),
  getDashboardAnalytics: async () => sbResponse({ data: {} }),
  checkSlug: async (_slug: string) => sbResponse({ data: { available: true } }),
};

// ==============================
//  SAVED SEARCHES API
// ==============================
export const savedSearchesApi = {
  getAll: async () => sbResponse({ data: [] }),
  getById: async (_id: number) => sbResponse({ data: null }),
  create: async (_data: any) => sbResponse({ data: { message: 'Saved' } }),
  update: async (_id: number, _data: any) => sbResponse({ data: { message: 'Updated' } }),
  delete: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),
  search: async (_id: number, _page?: number) => sbResponse({ data: [] }),
};

// ==============================
//  VERIFICATION API
// ==============================
export const verificationApi = {
  getMyVerifications: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('verification_requests').select('*').eq('user_id', userId).limit(20);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  submitPhone: async (phone: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const { error } = await supabase.from('profiles').update({ phone }).eq('id', userId);
    return error ? sbError(error) : sbResponse({ data: { message: 'Phone submitted' } });
  },
  submitEmail: async (_email: string) => sbResponse({ data: { message: 'Email submitted' } }),
  submitIdentity: async (formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const files: any[] = [];
    formData.forEach((v, k) => { if (v instanceof File) files.push({ key: k, file: v }); });
    const docs: Record<string, string> = {};
    for (const { key, file } of files) {
      const path = `verifications/${userId}/${Date.now()}_${file.name}`;
      await supabase.storage.from('verification-docs').upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from('verification-docs').getPublicUrl(path);
      docs[key] = publicUrl;
    }
    const { error } = await supabase.from('verification_requests').insert({
      user_id: userId,
      verification_type: 'identity',
      document_front_url: docs.document_front || docs.front || null,
      document_back_url: docs.document_back || docs.back || null,
      selfie_url: docs.selfie || null,
    });
    return error ? sbError(error) : sbResponse({ data: { message: 'Identity submitted' } });
  },
  getStatus: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { status: 'not_submitted' } });
    const { data } = await supabase.from('verification_requests').select('status').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    return sbResponse({ data: { status: data?.status || 'not_submitted' } });
  },
  uploadDocument: async (file: File, _type: string, field: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const path = `verifications/${userId}/${Date.now()}_${file.name}`;
    await supabase.storage.from('verification-docs').upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from('verification-docs').getPublicUrl(path);
    return sbResponse({ data: { url: publicUrl, field } });
  },
};

// ==============================
//  EMAIL VERIFICATION API
// ==============================
export const emailVerificationApi = {
  send: async (_email: string) => sbResponse({ data: { message: 'Email sent' } }),
  verify: async (_token: string) => sbResponse({ data: { message: 'Verified' } }),
  resend: async () => sbResponse({ data: { message: 'Resent' } }),
  status: async () => sbResponse({ data: { verified: true } }),
};

// ==============================
//  BUSINESS VERIFICATION API
// ==============================
export const businessVerificationApi = {
  getMyVerification: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: null });
    const { data, error } = await supabase.from('verification_requests').select('*').eq('user_id', userId).eq('verification_type', 'business').maybeSingle();
    return error ? sbError(error) : sbResponse({ data });
  },
  submit: async (formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const files: any[] = [];
    formData.forEach((v, k) => { if (v instanceof File) files.push({ key: k, file: v }); });
    const docs: Record<string, string> = {};
    for (const { key, file } of files) {
      const path = `business-verifications/${userId}/${Date.now()}_${file.name}`;
      await supabase.storage.from('verification-docs').upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from('verification-docs').getPublicUrl(path);
      docs[key] = publicUrl;
    }
    const { error } = await supabase.from('verification_requests').insert({
      user_id: userId,
      verification_type: 'business',
      business_document_url: docs.business_document || docs.document || null,
    });
    return error ? sbError(error) : sbResponse({ data: { message: 'Business verification submitted' } });
  },
  getStatus: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { status: 'not_submitted' } });
    const { data } = await supabase.from('verification_requests').select('status').eq('user_id', userId).eq('verification_type', 'business').order('created_at', { ascending: false }).limit(1).maybeSingle();
    return sbResponse({ data: { status: data?.status || 'not_submitted' } });
  },
  uploadDocument: async (file: File, _field: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    const path = `business-verifications/${userId}/${Date.now()}_${file.name}`;
    await supabase.storage.from('verification-docs').upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from('verification-docs').getPublicUrl(path);
    return sbResponse({ data: { url: publicUrl } });
  },
};

// ==============================
//  ANALYTICS API
// ==============================
export const analyticsApi = {
  getOverview: async (_period?: string) => sbResponse({ data: {} }),
  getAdPerformance: async (_period?: string) => sbResponse({ data: [] }),
  getSingleAdPerformance: async (_adId: number, _period?: string) => sbResponse({ data: {} }),
  getDailyBreakdown: async (_period?: string) => sbResponse({ data: [] }),
  getTrends: async (_period?: string) => sbResponse({ data: [] }),
  getTopAds: async () => sbResponse({ data: [] }),
  getStorePerformance: async (_period?: string) => sbResponse({ data: {} }),
  recordView: async (adId: number) => adsApi.incrementViews(adId),
  recordClick: async (adId: number, _type: string) => sbResponse({ data: { message: 'Click recorded' } }),
  recordShare: async (_adId: number) => sbResponse({ data: { message: 'Share recorded' } }),
};

// ==============================
//  ADMIN VERIFICATION API
// ==============================
export const adminVerificationApi = {
  getAll: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),
  getById: async (_id: number) => sbResponse({ data: null }),
  approve: async (_id: number) => sbResponse({ data: { message: 'Approved' } }),
  reject: async (_id: number, _reason: string) => sbResponse({ data: { message: 'Rejected' } }),
  getStats: async () => sbResponse({ data: { total: 0, pending: 0, approved: 0, rejected: 0 } }),
};

// ==============================
//  ADMIN BUSINESS VERIFICATION API
// ==============================
export const adminBusinessVerificationApi = {
  getAll: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),
  getById: async (_id: number) => sbResponse({ data: null }),
  approve: async (_id: number) => sbResponse({ data: { message: 'Approved' } }),
  reject: async (_id: number, _reason: string) => sbResponse({ data: { message: 'Rejected' } }),
  getStats: async () => sbResponse({ data: { total: 0, pending: 0, approved: 0, rejected: 0 } }),
};

// ==============================
//  ADMIN STORE API
// ==============================
export const adminStoreApi = {
  getAll: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),
  getById: async (_id: number) => sbResponse({ data: null }),
  verify: async (_id: number) => sbResponse({ data: { message: 'Verified' } }),
  suspend: async (_id: number) => sbResponse({ data: { message: 'Suspended' } }),
  activate: async (_id: number) => sbResponse({ data: { message: 'Activated' } }),
  delete: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),
};

// ==============================
//  ADMIN API  (legacy admin endpoints)
// ==============================
const STEALTH_PREFIX = '/secure-control-9ja';

export const adminApi = {
  getDashboard: async () => sbResponse({ stats: { total_users: 0, total_ads: 0, total_revenue: 0, pending_verifications: 0, active_boosts: 0, expired_boosts: 0, boost_revenue: 0 } }),
  getPaymentStats: async () => sbResponse({ data: {} }),
  getPayments: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),
  getFinancialSummary: async () => sbResponse({ data: {} }),
  approvePayment: async (_id: number) => sbResponse({ data: { message: 'Approved' } }),
  rejectPayment: async (_id: number) => sbResponse({ data: { message: 'Rejected' } }),

  getBoosts: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),
  getBoostActiveAds: async () => sbResponse({ data: [] }),
  deactivateBoost: async (_id: number) => sbResponse({ data: { message: 'Deactivated' } }),
  extendBoost: async (_id: number, _days: number) => sbResponse({ data: { message: 'Extended' } }),

  getUsers: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),
  suspendUser: async (_id: number) => sbResponse({ data: { message: 'Suspended' } }),
  banUser: async (_id: number, _reason: string) => sbResponse({ data: { message: 'Banned' } }),
  activateUser: async (_id: number) => sbResponse({ data: { message: 'Activated' } }),
  deleteUser: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),

  getAds: async (params?: any) => {
    try {
      const res = await http.get(`${STEALTH_PREFIX}/ads`, { params: params as any });
      const responseData = res?.data || { data: [], meta: null };
      return sbResponse({
        data: (responseData.data || []).map(fromLaravelAd),
        meta: responseData.meta || buildMeta(0, params?.page || 1, params?.per_page || 20),
      });
    } catch (e: any) {
      return sbError(e);
    }
  },
  getPublicAds: async (params?: any) => {
    try {
      const res = await http.get('/ads', { params: params as any });
      const responseData = res?.data || { data: [], meta: null };
      return sbResponse({
        data: (responseData.data || []).map(fromLaravelAd),
        meta: responseData.meta || buildMeta(0, params?.page || 1, params?.per_page || 20),
      });
    } catch (e: any) {
      return sbError(e);
    }
  },
  approveAd: async (_id: number) => sbResponse({ data: { message: 'Approved' } }),
  rejectAd: async (_id: number) => sbResponse({ data: { message: 'Rejected' } }),
  verifyAd: async (_id: number) => sbResponse({ data: { message: 'Verified' } }),
  featureAd: async (_id: number) => sbResponse({ data: { message: 'Featured' } }),
  promoteAd: async (_id: number) => sbResponse({ data: { message: 'Promoted' } }),
  deleteAd: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),
  bulkDeleteAds: async (_ids: number[]) => sbResponse({ data: { message: 'Deleted' } }),
  updateAd: async (_id: number, _data: any) => sbResponse({ data: { message: 'Updated' } }),

  getCategories: async () => sbResponse({ tree: [], all: [], data: [] }),
  createCategory: async (_data: any) => sbResponse({ data: { message: 'Created' } }),
  updateCategory: async (_id: number, _data: any) => sbResponse({ data: { message: 'Updated' } }),
  deleteCategory: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),
  uploadCategoryImage: async (_file: File) => sbResponse({ url: '' }),
  reorderCategories: async (_items: any[]) => sbResponse({ data: { message: 'Reordered' } }),

  getReports: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),
  resolveReport: async (_id: number) => sbResponse({ data: { message: 'Resolved' } }),
  dismissReport: async (_id: number) => sbResponse({ data: { message: 'Dismissed' } }),

  getAdminWallet: async () => sbResponse({ data: { balance: 0 } }),
  creditUser: async (_userId: number, _amount: number, _description: string) => sbResponse({ data: { message: 'Credited' } }),
  debitUser: async (_userId: number, _amount: number, _description: string) => sbResponse({ data: { message: 'Debited' } }),
  adminWithdraw: async (_amount: number, _bankName: string, _accountNumber: string, _accountName: string, _description?: string) => sbResponse({ data: { message: 'Withdrawal initiated' } }),
  getTransactions: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),

  getWallets: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),
  creditWallet: async (_id: number, _amount: number, _description: string) => sbResponse({ data: { message: 'Credited' } }),
  debitWallet: async (_id: number, _amount: number, _description: string) => sbResponse({ data: { message: 'Debited' } }),

  getPromotions: async () => sbResponse({ data: [] }),
  createPromotion: async (_data: any) => sbResponse({ data: { message: 'Created' } }),
  updatePromotion: async (_id: number, _data: any) => sbResponse({ data: { message: 'Updated' } }),
  deletePromotion: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),

  getPromotionPlans: async () => sbResponse({ data: [] }),
  createPromotionPlan: async (_data: any) => sbResponse({ data: { message: 'Created' } }),
  updatePromotionPlan: async (_id: number, _data: any) => sbResponse({ data: { message: 'Updated' } }),
  deletePromotionPlan: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),

  getBanners: async () => sbResponse({ data: [] }),
  createBanner: async (_data: FormData) => sbResponse({ data: { message: 'Created' } }),
  updateBanner: async (_id: number, _data: FormData) => sbResponse({ data: { message: 'Updated' } }),
  deleteBanner: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),

  getBroadcasts: async (_params?: any) => sbResponse({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 1 } }),
  getBroadcast: async (_id: number) => sbResponse({ data: null }),
  createBroadcast: async (_data: any) => sbResponse({ data: { message: 'Created' } }),
  resendBroadcast: async (_id: number) => sbResponse({ data: { message: 'Resent' } }),
  deleteBroadcast: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),

  getSettings: async () => sbResponse({ auto_approval_enabled: false, approval_duration_minutes: 2, max_images_per_ad: 10, ad_expiration_days: 30 }),
  updateSettings: async (_data: any) => sbResponse({ data: { message: 'Updated' } }),

  getWatermarkSettings: async () => sbResponse({ data: {} }),
  updateWatermarkSettings: async (_data: any) => sbResponse({ data: { message: 'Updated' } }),
  uploadWatermarkLogo: async (_file: File) => sbResponse({ data: { url: '' } }),

  getCategoryFields: async (_params?: any) => sbResponse([]),
  createCategoryField: async (_categoryId: number, _data: any) => sbResponse({ data: { message: 'Created' } }),
  updateCategoryField: async (_id: number, _data: any) => sbResponse({ data: { message: 'Updated' } }),
  deleteCategoryField: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),

  getFonts: async () => sbResponse({ data: [] }),
  uploadFont: async (_file: File, _name: string) => sbResponse({ data: { message: 'Uploaded' } }),
  deleteFont: async (_id: number) => sbResponse({ data: { message: 'Deleted' } }),
  setDefaultFont: async (_id: number) => sbResponse({ data: { message: 'Set as default' } }),

  addAdImages: async (_adId: number, _files: File[]) => sbResponse({ data: { message: 'Added' } }),
  updateAdImage: async (_adId: number, _imageId: number, _data: any) => sbResponse({ data: { message: 'Updated' } }),
  deleteAdImage: async (_adId: number, _imageId: number) => sbResponse({ data: { message: 'Deleted' } }),

  getAnalytics: async (_params?: any) => sbResponse({}),
  getStatesAnalytics: async (_params?: any) => sbResponse([]),

  getReviewSummary: async (adId: number) => reviewsApi.getAdReviewSummary(adId),
  getLatestReviews: async (adId: number) => reviewsApi.getAdLatestReviews(adId),
  getReviews: async (adId: number, _params?: any) => reviewsApi.getAdReviews(adId),
  createReview: async (adId: number, data: any) => reviewsApi.create({ ...data, user_id: 0, ad_id: adId }),
  updateReview: async (id: number, data: any) => sellerReviewsApi.updateReview(id, data),
  deleteReview: async (id: number) => sellerReviewsApi.deleteReview(id),
  markReviewHelpful: async (id: number) => sellerReviewsApi.markHelpful(id),
  reportReview: async (id: number, reason: string) => sellerReviewsApi.reportReview(id, reason),
};

// ==============================
//  HTTP CLIENT (fetch-based, makes real HTTP requests)
// ==============================

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

class HttpClient {
  async get<T = any>(url: string, config?: RequestConfig): Promise<any> {
    return http.get<T>(url, config);
  }
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<any> {
    return http.post<T>(url, data, config);
  }
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<any> {
    return http.put<T>(url, data, config);
  }
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<any> {
    return http.patch<T>(url, data, config);
  }
  async delete<T = any>(url: string, config?: RequestConfig): Promise<any> {
    return http.delete<T>(url, config);
  }
  async upload<T = any>(url: string, formData: FormData, onProgress?: (p: number) => void, timeoutOverride?: number): Promise<any> {
    return http.upload<T>(url, formData, onProgress, timeoutOverride);
  }
}

export const api = new HttpClient();

export const adminApiClient = {
  get: async (url: string, config?: RequestConfig) => http.get(url, config),
  post: async (url: string, data?: any, config?: RequestConfig) => http.post(url, data, config),
  put: async (url: string, data?: any, config?: RequestConfig) => http.put(url, data, config),
  patch: async (url: string, data?: any, config?: RequestConfig) => http.patch(url, data, config),
  delete: async (url: string, config?: RequestConfig) => http.delete(url, config),
  upload: async (url: string, formData: FormData, onProgress?: (p: number) => void) => http.upload(url, formData, onProgress),
};

export default api;
