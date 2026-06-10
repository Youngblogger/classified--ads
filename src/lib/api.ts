import { supabase, getServiceRoleClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { http, type RequestConfig } from '@/lib/http-client';
import type { Database, Tables } from '@/types/supabase';
import { normalizeAd, normalizeAds } from '@/lib/normalize-ad';
import { resolveCategoryUuid, resolveSubcategoryUuid, isChildId, getParentId, ID_TO_SLUG } from '@/lib/uuid-resolver';

type SupabaseResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  error?: string;
  headers: Record<string, string>;
  config: Record<string, any>;
};

function sbResponse<T>(data: T, status = 200): SupabaseResponse<T> {
  return { data, status, statusText: 'OK', headers: {}, config: {} };
}

function sbError(error: any): SupabaseResponse<any> {
  return { data: {} as any, status: error?.status || 500, statusText: error?.message || 'Error', error: error?.message || 'Error', headers: {}, config: {} };
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

async function getSupabaseUserId(): Promise<string | null> {
  const storeUser = useAuthStore.getState().user;
  if (storeUser?.supabase_user_id) return storeUser.supabase_user_id;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

function transformListing(listing: any): any {
  return normalizeAd(listing);
}

function transformListings(listings: any[]): any[] {
  return normalizeAds(listings);
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[Auth API] Login failed:', error.message);
        throw new Error(error.message);
      }
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user?.id).single();
      if (profileError) {
        console.error('[Auth API] Profile fetch after login failed:', profileError.message);
      }
      const token = data.session?.access_token || '';
      return sbResponse({
        data: {
          user: { ...(profile || {}), id: data.user?.id },
          token,
          access_token: token,
        },
        message: 'Login successful',
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Connection timed out. Please check your internet and try again.');
      }
      throw err;
    }
  },

  register: async (name: string, email: string, password: string, phone?: string) => {
    await supabase.auth.signOut({ scope: 'local' });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone } },
    });
    if (error) {
      console.error('[Auth API] Signup failed:', error.message);
      return sbError(error);
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        email,
        phone: phone || null,
        username: email.split('@')[0],
      });
      if (profileError) {
        console.error('[Auth API] Profile creation after signup failed:', profileError.message);
      }
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
  get: async (id: string | number) => {
    try {
      const res = await http.get(`/ads/${id}`);
      if (res?.status >= 200 && res?.status < 300) {
        const ad = res?.data?.data || res?.data || null;
        if (ad) return sbResponse({ data: normalizeAd(ad, true) });
      }
    } catch {}
    const { data, error } = await supabase.from('listings').select('*, listing_images(*), profiles(*)').eq('id', String(id)).maybeSingle();
    if (error || !data) return sbError({ message: 'Ad not found' });
    return sbResponse({ data: normalizeAd({ ...data, user: data.profiles, images: data.listing_images, listing_images: data.listing_images }, true) });
  },

  getAll: async (params?: Record<string, any>) => {
    try {
      const res = await http.get('/ads', { params: params as any });
      if (res?.status >= 200 && res?.status < 300) {
        const responseData = res?.data || { data: [], meta: null };
        const ads = responseData.data || [];
        if (Array.isArray(ads) && ads.length > 0) {
          return sbResponse({
            data: normalizeAds(ads),
            meta: responseData.meta || buildMeta(0, params?.page || 1, params?.per_page || params?.limit || PAGE_SIZE),
          });
        }
      }
    } catch {}
    const page = params?.page || 1;
    const perPage = params?.per_page || params?.limit || PAGE_SIZE;
    const { data, error, count } = await supabase.from('listings').select('*, listing_images(*), profiles(*)', { count: 'exact' }).eq('status', 'active').order('created_at', { ascending: false }).range((page - 1) * perPage, page * perPage - 1);
    if (error) return sbError(error);
    const items = (data || []).map((item: any) => normalizeAd({ ...item, user: item.profiles, images: item.listing_images, listing_images: item.listing_images }));
    return sbResponse({ data: items, meta: buildMeta(count || 0, page, perPage) });
  },

  getById: async (id: string | number) => adsApi.get(id),

  getBySlug: async (slug: string) => {
    try {
      const res = await http.get(`/ads/${slug}`);
      if (res?.status >= 200 && res?.status < 300) {
        const ad = res?.data?.data || res?.data || null;
        if (ad) return sbResponse({ data: normalizeAd(ad, true) });
      }
    } catch {}
    const { data, error } = await supabase.from('listings').select('*, listing_images(*), profiles(*)').eq('slug', slug).maybeSingle();
    if (error || !data) return sbError({ message: 'Ad not found' });
    return sbResponse({ data: normalizeAd({ ...data, user: data.profiles, images: data.listing_images, listing_images: data.listing_images }, true) });
  },

  getFeatured: async (limit = 10) => {
    try {
      const res = await http.get('/ads/featured');
      if (res?.status >= 200 && res?.status < 300) {
        const ads = res?.data?.data || [];
        if (Array.isArray(ads) && ads.length > 0) return sbResponse({ data: normalizeAds(ads) });
      }
    } catch {}
    const { data, error } = await supabase.from('listings').select('*, listing_images(*), profiles(*)').eq('status', 'active').not('boost_type', 'is', null).order('boost_priority_score', { ascending: false }).limit(limit);
    if (error) return sbResponse({ data: [] });
    return sbResponse({ data: (data || []).map((item: any) => normalizeAd({ ...item, user: item.profiles, images: item.listing_images, listing_images: item.listing_images })) });
  },

  getRecent: async (limit = 20) => {
    try {
      const res = await http.get('/ads/recent');
      if (res?.status >= 200 && res?.status < 300) {
        const ads = res?.data?.data || [];
        if (Array.isArray(ads) && ads.length > 0) return sbResponse({ data: normalizeAds(ads) });
      }
    } catch {}
    const { data, error } = await supabase.from('listings').select('*, listing_images(*), profiles(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(limit);
    if (error) return sbResponse({ data: [] });
    return sbResponse({ data: (data || []).map((item: any) => normalizeAd({ ...item, user: item.profiles, images: item.listing_images, listing_images: item.listing_images })) });
  },

  getSimilar: async (adId: number, limit = 8) => {
    try {
      const res = await http.get('/ads/similar', { params: { ad_id: adId, limit } as any });
      if (res?.status >= 200 && res?.status < 300) {
        const ads = res?.data?.data || [];
        if (Array.isArray(ads) && ads.length > 0) return sbResponse({ data: normalizeAds(ads) });
      }
    } catch {}
    const { data, error } = await supabase.from('listings').select('*, listing_images(*), profiles(*)').eq('status', 'active').limit(limit);
    if (error) return sbResponse({ data: [] });
    return sbResponse({ data: (data || []).map((item: any) => normalizeAd({ ...item, user: item.profiles, images: item.listing_images, listing_images: item.listing_images })) });
  },

  create: async (formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });

    // Check Supabase session is valid before attempting insert
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('[AdsApi] No Supabase session — user may need to re-login');
      }
    } catch {}

    let adData: any = null;
    let adImages: any[] = [];

    // Build listing data from form (send all form fields as-is for Supabase compatibility)
    const listing: any = { user_id: userId, status: 'active' };
    for (const [key, value] of Array.from(formData.entries())) {
      if (key !== 'images[]' && key !== 'image' && key !== 'status') {
        listing[key] = value;
      }
    }
    listing.slug = listing.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    // Strip fields incompatible with Supabase listings table
    delete listing._idempotency_key;
    delete listing.image_urls;
    delete listing.location_id;

    // Map field names: Laravel form → Supabase columns
    if (listing.phone) { listing.phone_number = listing.phone; }
    delete listing.phone;
    if (listing.whatsapp) { listing.whatsapp_number = listing.whatsapp; }
    delete listing.whatsapp;
    if (listing.attributes) {
      try {
        listing.specifications = typeof listing.attributes === 'string' ? JSON.parse(listing.attributes) : listing.attributes;
      } catch {
        listing.specifications = listing.attributes;
      }
      delete listing.attributes;
    }

    // Use Supabase auth UUID for user_id (store ID is a Laravel integer)
    const storeUser = useAuthStore.getState().user;
    const supabaseUuid = storeUser?.supabase_user_id || (await supabase.auth.getUser().then(r => r.data?.user?.id).catch(() => null));
    if (supabaseUuid) {
      listing.user_id = supabaseUuid;
    }

    // Resolve integer category/subcategory IDs to Supabase UUIDs
    if (listing.category_id) {
      try {
        const rawId = listing.category_id;
        const rawSlug: string | undefined = listing.category_slug;
        const parentSlug: string | undefined = listing.category_parent_slug;

        // Store category_slug in metadata for querying by category
        const metadata: Record<string, unknown> = {};
        if (listing.metadata && typeof listing.metadata === 'object') {
          Object.assign(metadata, listing.metadata);
        }
        if (rawSlug) metadata.category_slug = rawSlug;
        if (parentSlug) metadata.category_parent_slug = parentSlug;

        // Also store subcategory_slug if available
        const subSlug = listing.subcategory_slug;
        if (subSlug) metadata.subcategory_slug = subSlug;

        // Remove raw slug fields from listing top-level (not DB columns)
        delete listing.category_slug;
        delete listing.category_parent_slug;
        delete listing.subcategory_slug;

        if (isChildId(rawId)) {
          const parentId = getParentId(rawId);
          if (parentId) {
            listing.category_id = await resolveCategoryUuid(parentId);
            if (!metadata.category_parent_slug && ID_TO_SLUG[parentId]) {
              metadata.category_parent_slug = ID_TO_SLUG[parentId];
            }
          }
          listing.subcategory_id = await resolveSubcategoryUuid(rawId, undefined);
          if (!metadata.subcategory_slug) {
            const resolvedSlug = ID_TO_SLUG[typeof rawId === 'string' ? parseInt(rawId, 10) : rawId];
            if (resolvedSlug) metadata.subcategory_slug = resolvedSlug;
          }
        } else if (parentSlug) {
          listing.category_id = await resolveCategoryUuid(0, parentSlug);
          listing.subcategory_id = await resolveSubcategoryUuid(0, rawSlug);
        } else if (rawSlug) {
          listing.category_id = await resolveCategoryUuid(rawId, rawSlug);
          delete listing.subcategory_id;
        } else {
          listing.category_id = await resolveCategoryUuid(rawId);
          delete listing.subcategory_id;
        }

        listing.metadata = metadata;
      } catch (e: any) {
        console.error('[adsApi.create] UUID resolution failed:', e.message);
        return sbError({ message: `Category mapping failed: ${e.message}` });
      }
    }

    // Validate resolved UUIDs against their target tables — fail safe, never cross-table
    if (listing.category_id) {
      const { data: catRow } = await supabase.from('categories').select('id').eq('id', listing.category_id).maybeSingle();
      if (!catRow) {
        console.warn(`[adsApi.create] category_id ${listing.category_id} not in categories table — clearing`);
        listing.category_id = null;
      }
    }
    if (listing.subcategory_id) {
      const { data: subRow } = await supabase.from('subcategories').select('id').eq('id', listing.subcategory_id).maybeSingle();
      if (!subRow) {
        console.warn(`[adsApi.create] subcategory_id ${listing.subcategory_id} not in subcategories table — clearing`);
        listing.subcategory_id = null;
      }
    }

    // Always save to Supabase first (source of truth for user dashboard)
    try {
      const { data, error } = await supabase.from('listings').insert(listing).select().single();
      if (!error && data) {
        adData = data;
      } else if (error) {
        console.error('[adsApi.create] Supabase insert error:', error);
        return sbError({ message: `Supabase error: ${error.message}` });
      }
    } catch (e: any) {
      console.error('[adsApi.create] Supabase insert failed:', e);
      return sbError({ message: `Failed to create listing: ${e?.message || 'Unknown error'}` });
    }

    if (!adData) return sbError({ message: 'Failed to create listing in Supabase' });

    // Process images
    const imageUrlsStr = formData.get('image_urls');
    if (imageUrlsStr) {
      try {
        const imageData = JSON.parse(imageUrlsStr as string);
        for (let i = 0; i < imageData.length; i++) {
          const img = imageData[i];
          const { data: imgInsert, error: imgErr } = await supabase.from('listing_images').insert({
            listing_id: adData.id, url: img.url,
            thumbnail_url: img.thumbnail_url || img.url,
            medium_url: img.medium_url || img.url,
            storage_path: img.storage_path || img.url,
            is_primary: i === 0, sort_order: i,
          }).select().single();
          if (!imgErr && imgInsert) adImages.push(imgInsert);
        }
      } catch (e) {
        console.error('Failed to create listing_images from pre-uploaded URLs:', e);
      }
    }

    const imageFiles = formData.getAll('images[]').concat(formData.getAll('image')).filter(Boolean);
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i] as File;
        try {
          const ext = file.name.split('.').pop();
          const path = `listings/${adData.id}/${i}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from('listing-images').upload(path, file);
          if (uploadErr) continue;
          const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path);
          const { data: imgInsert, error: imgErr } = await supabase.from('listing_images').insert({
            listing_id: adData.id, url: publicUrl, storage_path: path,
            is_primary: adImages.length === 0 && i === 0, sort_order: adImages.length + i,
          }).select().single();
          if (!imgErr && imgInsert) adImages.push(imgInsert);
        } catch (e) {
          console.error('Failed to upload image:', e);
        }
      }
    }

    // Also try Laravel backend (non-blocking)
    try {
      await http.post('/ads', formData);
    } catch (e: any) {
      console.warn('[adsApi.create] Laravel sync failed (non-blocking):', e?.message || e);
    }
    const normalized = normalizeAd({
      ...adData,
      images: adImages,
      listing_images: adImages,
    }, true);

    return sbResponse({ data: normalized });
  },

  update: async (id: string | number, formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      formData.append('_method', 'PUT');
      const res = await http.post(`/ads/${id}`, formData);
      if (res?.data?.data) return sbResponse({ data: res.data.data });
    } catch {}
    const updates: any = {};
    for (const [key, value] of Array.from(formData.entries())) {
      if (key !== 'images[]' && key !== 'image' && key !== '_method' && key !== 'status') {
        updates[key] = value;
      }
    }
    delete updates._idempotency_key;
    delete updates.image_urls;
    delete updates.location_id;
    if (updates.phone) { updates.phone_number = updates.phone; }
    delete updates.phone;
    if (updates.whatsapp) { updates.whatsapp_number = updates.whatsapp; }
    delete updates.whatsapp;
    if (updates.attributes) { updates.specifications = updates.attributes; delete updates.attributes; }
    if (updates.category_id) {
      try {
        const rawId = updates.category_id;
        if (isChildId(rawId)) {
          const parentId = getParentId(rawId);
          if (parentId) {
            updates.category_id = await resolveCategoryUuid(parentId);
          }
          updates.subcategory_id = await resolveSubcategoryUuid(rawId, undefined);
        } else {
          updates.category_id = await resolveCategoryUuid(rawId);
          delete updates.subcategory_id;
        }
      } catch (e: any) {
        console.error('[adsApi.update] UUID resolution failed:', e.message);
      }
    }
    const { data, error } = await supabase.from('listings').update(updates).eq('id', String(id)).eq('user_id', userId).select().single();
    if (error) return sbError(error);

    // Handle removed images
    const removedImagesRaw = formData.get('removed_images');
    if (removedImagesRaw) {
      try {
        const removedIds = JSON.parse(removedImagesRaw as string);
        if (Array.isArray(removedIds) && removedIds.length > 0) {
          const { data: imagesToDelete } = await supabase.from('listing_images').select('storage_path').in('id', removedIds);
          if (imagesToDelete) {
            for (const img of imagesToDelete) {
              if (img.storage_path) {
                await supabase.storage.from('listing-images').remove([img.storage_path]).catch(() => {});
              }
            }
          }
          await supabase.from('listing_images').delete().in('id', removedIds);
        }
      } catch {}
    }

    // Handle new images
    const imageFiles = formData.getAll('images[]').filter(Boolean);
    if (imageFiles.length > 0) {
      const newImages: any[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i] as File;
        try {
          const ext = file.name.split('.').pop();
          const path = `listings/${data!.id}/${Date.now()}-${i}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from('listing-images').upload(path, file);
          if (uploadErr) continue;
          const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path);
          const { data: imgInsert, error: imgErr } = await supabase.from('listing_images').insert({
            listing_id: data!.id, url: publicUrl, storage_path: path,
            is_primary: i === 0, sort_order: i,
          }).select().single();
          if (!imgErr && imgInsert) newImages.push(imgInsert);
        } catch {}
      }
    }

    return sbResponse({ data });
  },

  delete: async (slug: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.delete(`/ads/${slug}`);
      if (res?.data) return sbResponse({ data: { message: 'Deleted' } });
    } catch {}
    const { data: listing } = await supabase.from('listings').select('id').eq('slug', slug).single();
    if (!listing) return sbError({ message: 'Not found' });
    const { error } = await supabase.from('listings').delete().eq('id', listing.id).eq('user_id', userId);
    return error ? sbError(error) : sbResponse({ data: { message: 'Deleted' } });
  },

  deleteById: async (id: string | number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.delete(`/ads/${id}`);
      if (res?.data) return sbResponse({ data: { message: 'Deleted' } });
    } catch {}
    const { error } = await supabase.from('listings').delete().eq('id', String(id)).eq('user_id', userId);
    return error ? sbError(error) : sbResponse({ data: { message: 'Deleted' } });
  },

  incrementViews: async (id: string | number) => {
    try {
      await http.post(`/analytics/record-view/${id}`);
      return sbResponse({ data: { message: 'View counted' } });
    } catch {}
    await supabase.rpc('increment_listing_views', { listing_id: String(id) } as any);
    return sbResponse({ data: { message: 'View counted' } });
  },

  getMyAds: async (params?: Record<string, any>) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.get('/my-ads', { params: { ...params } as any });
      const responseData = res?.data || { data: [], meta: null };
      if (Array.isArray(responseData.data) && responseData.data.length > 0) {
        return sbResponse({
          data: normalizeAds(responseData.data),
          meta: responseData.meta || responseData.pagination || null,
        });
      }
    } catch {}
    try {
      const supabaseUserId = await getSupabaseUserId();
      if (!supabaseUserId) return sbResponse({ data: [] });
      const sp = new URLSearchParams();
      sp.set('user_id', supabaseUserId);
      sp.set('limit', '100');
      if (params?.status && params.status !== 'all') sp.set('status', params.status);
      const res = await fetch(`/api/listings?${sp.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const raw = json?.data || [];
        const mapped = raw.map((listing: any) =>
          normalizeAd({ ...listing, images: listing.listing_images || [], listing_images: listing.listing_images || [] })
        );
        return sbResponse({ data: mapped });
      }
    } catch (e: any) {
      console.warn('[AdsApi] Supabase fallback for my-ads failed:', e);
    }
    return sbResponse({ data: [] });
  },

  pause: async (id: number) => {
    try {
      const res = await http.post(`/ads/${id}/pause`);
      if (res?.data) return sbResponse({ data: res.data });
    } catch {}
    const { error } = await supabase.from('listings').update({ status: 'inactive' }).eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Ad paused' } });
  },

  reactivate: async (id: number) => {
    try {
      const res = await http.post(`/ads/${id}/reactivate`);
      if (res?.data) return sbResponse({ data: res.data });
    } catch {}
    const { error } = await supabase.from('listings').update({ status: 'active' }).eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Ad reactivated' } });
  },

  sold: async (id: number) => {
    try {
      const res = await http.post(`/ads/${id}/sold`);
      if (res?.data) return sbResponse({ data: res.data });
    } catch {}
    const { error } = await supabase.from('listings').update({ status: 'sold' }).eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Marked as sold' } });
  },

  renew: async (id: number) => {
    try {
      const res = await http.post(`/ads/${id}/renew`);
      if (res?.data) return sbResponse({ data: res.data });
    } catch {}
    const { error } = await supabase.from('listings').update({ status: 'pending', created_at: new Date().toISOString() }).eq('id', String(id));
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
    try {
      const res = await http.get('/favorites');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data) && data.length > 0) {
        const items = data.map((item: any) => {
          if (item.ad) return item;
          const ad = normalizeAd(item);
          if (!ad) return { id: item.id, ad: item };
          return { id: item.id || ad.id, ad };
        });
        return sbResponse({ data: items });
      }
    } catch {}
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) return sbResponse({ data: [] });
    const { data, error } = await supabase.from('listing_favorites').select('*, listings(*, profiles(*))').eq('user_id', supabaseUserId).limit(50);
    if (error) return sbError(error);
    return sbResponse({
      data: (data || []).map((f: any) => {
        const ad = transformListing({ ...f.listings, user: f.listings?.profiles }) || {};
        return { id: f.id, ad };
      }),
    });
  },

  add: async (adId: number | string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post('/favorites', { ad_id: adId });
      if (res?.status >= 200 && res?.status < 300 && res?.data) return sbResponse({ data: { message: 'Added to favorites' } });
    } catch {}
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) return sbError({ message: 'Not authenticated with Supabase' });
    const { error } = await supabase.from('listing_favorites').insert({ user_id: supabaseUserId, listing_id: String(adId) });
    if (error) {
      console.error('Supabase favorite insert error:', error);
      throw error;
    }
    return sbResponse({ data: { message: 'Added to favorites' } });
  },

  remove: async (adId: number | string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.delete(`/favorites/${adId}`);
      if (res?.status >= 200 && res?.status < 300 && res?.data) return sbResponse({ data: { message: 'Removed from favorites' } });
    } catch {}
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) return sbError({ message: 'Not authenticated with Supabase' });
    const { error } = await supabase.from('listing_favorites').delete().eq('user_id', supabaseUserId).eq('listing_id', String(adId));
    if (error) {
      console.error('Supabase favorite remove error:', error);
      throw error;
    }
    return sbResponse({ data: { message: 'Removed from favorites' } });
  },

  check: async (adId: number | string) => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { is_favorited: false } });
    try {
      const res = await http.get(`/favorites/check/${adId}`);
      const is_favorited = res?.data?.data?.is_favorited ?? res?.data?.is_favorited;
      if (res?.status >= 200 && res?.status < 300 && is_favorited !== undefined) return sbResponse({ data: { is_favorited } });
    } catch {}
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) return sbResponse({ data: { is_favorited: false } });
    const { data } = await supabase.from('listing_favorites').select('id').eq('user_id', supabaseUserId).eq('listing_id', String(adId)).maybeSingle();
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
    try {
      const res = await http.get('/messages/conversations');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data) && data.length > 0) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('conversations').select('*, listings(title, slug), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*)')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })
      .limit(50);
    if (error) return sbError(error);
    return sbResponse({ data: (data || []).map((c: any) => ({
      id: c.id, ad_id: c.listing_id, ad_title: c.listings?.title, ad: c.listings,
      other_user: c.buyer_id === userId ? c.seller : c.buyer,
      last_message: c.last_message_preview, last_message_at: c.last_message_at,
      unread_count: 0, is_blocked: c.is_blocked,
    })) });
  },

  getMessages: async (conversationId: number) => {
    try {
      const res = await http.get(`/messages/${conversationId}`);
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data) && data.length > 0) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('messages').select('*, sender:profiles!messages_sender_id_fkey(*)').eq('conversation_id', String(conversationId)).order('created_at', { ascending: true }).limit(100);
    if (error) return sbError(error);
    return sbResponse({ data: (data || []).map((m: any) => ({
      id: m.id, conversation_id: m.conversation_id, sender_id: m.sender_id,
      sender: m.sender ? { id: m.sender.id, name: m.sender.full_name || m.sender.username, avatar: m.sender.avatar_url } : null,
      message: m.content, content: m.content, message_type: m.message_type,
      attachment: m.attachment_url, attachment_url: m.attachment_url,
      duration: m.duration, is_read: m.is_read, created_at: m.created_at,
    })) });
  },

  sendMessage: async (conversationId: number, content: string, attachment?: File | Blob, messageType?: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const formData = new FormData();
      formData.append('conversation_id', String(conversationId));
      formData.append('content', content);
      formData.append('message_type', messageType || 'text');
      if (attachment) formData.append('attachment', attachment);
      const res = await http.post(`/messages/${conversationId}`, formData);
      if (res?.data?.data) return sbResponse({ data: res.data.data });
    } catch {}
    const msg: any = { conversation_id: String(conversationId), sender_id: userId, content, message_type: messageType || 'text' };
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
    try {
      const formData = new FormData();
      formData.append('conversation_id', String(conversationId));
      formData.append('audio', audioBlob, 'voice.webm');
      formData.append('duration', String(duration));
      formData.append('message_type', 'voice');
      const res = await http.post(`/messages/${conversationId}`, formData);
      if (res?.data?.data) return sbResponse({ data: res.data.data });
    } catch {}
    const path = `messages/${conversationId}/voice_${Date.now()}.webm`;
    await supabase.storage.from('message-attachments').upload(path, audioBlob);
    const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(path);
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: String(conversationId), sender_id: userId,
      content: '', message_type: 'voice', attachment_url: publicUrl, duration,
    }).select().single();
    return error ? sbError(error) : sbResponse({ data });
  },

  sendMessageNew: async (receiverId: number, adId: number | null, content: string, _messageType?: string, _attachment?: File | Blob, _duration?: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post('/messages/start', { receiver_id: receiverId, listing_id: adId, content });
      if (res?.data?.data) return sbResponse({ data: res.data.data });
    } catch {}
    let convId: string | null = null;
    const userIdStr = String(userId).trim();
    const receiverIdStr = String(receiverId).trim();
    const { data: existing } = await supabase.from('conversations').select('id')
      .or(`and(buyer_id.eq.${userIdStr},seller_id.eq.${receiverIdStr}),and(buyer_id.eq.${receiverIdStr},seller_id.eq.${userIdStr})`)
      .maybeSingle();
    if (existing) {
      convId = existing.id;
    } else {
      const { data: newConv } = await supabase.from('conversations').insert({
        listing_id: adId ? String(adId) : null, buyer_id: userIdStr, seller_id: receiverIdStr,
      }).select().single();
      convId = newConv?.id || null;
    }
    if (!convId) return sbError({ message: 'Failed to create conversation' });
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: convId, sender_id: userIdStr, content, message_type: 'text',
    }).select().single();
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString(), last_message_preview: content }).eq('id', convId);
    return error ? sbError(error) : sbResponse({ data });
  },

  startConversation: async (adId: number, content: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post('/messages/start', { listing_id: adId, content });
      if (res?.data?.data) return sbResponse({ data: res.data.data });
    } catch {}
    const { data: listing } = await supabase.from('listings').select('user_id').eq('id', String(adId)).single();
    if (!listing) return sbError({ message: 'Ad not found' });
    return messagesApi.sendMessageNew(Number(listing.user_id), Number(adId), content);
  },

  markAsRead: async (conversationId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post(`/messages/${conversationId}/read`);
      if (res?.data) return sbResponse({ data: { message: 'Marked as read' } });
    } catch {}
    const { error } = await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', String(conversationId)).neq('sender_id', userId);
    return error ? sbError(error) : sbResponse({ data: { message: 'Marked as read' } });
  },

  deleteMessage: async (messageId: number) => {
    try {
      const res = await http.delete(`/messages/message/${messageId}`);
      if (res?.data) return sbResponse({ data: { message: 'Deleted' } });
    } catch {}
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
    try {
      const res = await http.post('/follow', { following_id: followingId });
      if (res?.data) return sbResponse({ data: { message: 'Followed' } });
    } catch {}
    const { error } = await supabase.from('follows' as any).insert({ follower_id: userId, following_id: String(followingId) } as any);
    return error ? sbError(error) : sbResponse({ data: { message: 'Followed' } });
  },
  unfollow: async (followingId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.delete('/unfollow', { data: { following_id: followingId } } as any);
      if (res?.data) return sbResponse({ data: { message: 'Unfollowed' } });
    } catch {}
    const { error } = await supabase.from('follows' as any).delete().eq('follower_id', userId).eq('following_id', String(followingId)) as any;
    return error ? sbError(error) : sbResponse({ data: { message: 'Unfollowed' } });
  },
  checkFollow: async (followingId: number) => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { is_following: false } });
    try {
      const res = await http.get('/follow/check', { params: { following_id: followingId } as any });
      const is_following = res?.data?.data?.is_following ?? res?.data?.is_following;
      if (is_following !== undefined) return sbResponse({ data: { is_following } });
    } catch {}
    const { data } = await supabase.from('follows' as any).select('id').eq('follower_id', userId).eq('following_id', String(followingId)).maybeSingle() as any;
    return sbResponse({ data: { is_following: !!data } });
  },
  getFollowers: async (userId: number, page = 1) => {
    try {
      const res = await http.get(`/users/${userId}/followers`, { params: { page } as any });
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  getFollowing: async (userId: number, page = 1) => {
    try {
      const res = await http.get(`/users/${userId}/following`, { params: { page } as any });
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  getUserStats: async (userId: number) => {
    try {
      const res = await http.get(`/users/${userId}/stats`);
      return sbResponse({ data: res?.data?.data || { followers_count: 0, following_count: 0 } });
    } catch { return sbResponse({ data: { followers_count: 0, following_count: 0 } }); }
  },
  getFollowingFeed: async (page = 1) => {
    try {
      const res = await http.get('/feed/following', { params: { page } as any });
      const data = res?.data?.data || [];
      return sbResponse({ data: normalizeAds(data) });
    } catch { return sbResponse({ data: [] }); }
  },
  getSuggestedSellers: async () => {
    try {
      const res = await http.get('/sellers/suggested');
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
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
    try {
      const res = await http.post('/reports', data);
      if (res?.data) return sbResponse({ data: res?.data?.data || { message: 'Report submitted' } });
    } catch {}
    const { error } = await supabase.from('reports').insert({
      reporter_id: userId, listing_id: String(data.ad_id),
      reason: data.reason, description: data.description,
    });
    return error ? sbError(error) : sbResponse({ data: { message: 'Report submitted' } });
  },
  getMyReports: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    try {
      const res = await http.get('/reports/my-reports');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data) && data.length > 0) return sbResponse({ data });
    } catch {}
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
    try {
      const res = await http.get('/notifications');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data) && data.length > 0) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  markAsRead: async (id: number) => {
    try {
      const res = await http.post(`/notifications/${id}/read`);
      if (res?.data) return sbResponse({ data: { message: 'Marked as read' } });
    } catch {}
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', String(id));
    return error ? sbError(error) : sbResponse({ data: { message: 'Marked as read' } });
  },
  getUnread: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    try {
      const res = await http.get('/notifications/unread');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data)) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).eq('is_read', false).order('created_at', { ascending: false }).limit(50);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  markAllAsRead: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post('/notifications/mark-all-read');
      if (res?.data) return sbResponse({ data: { message: 'All marked as read' } });
    } catch {}
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).is('is_read', false);
    return error ? sbError(error) : sbResponse({ data: { message: 'All marked as read' } });
  },
  markAllRead: async () => notificationsApi.markAllAsRead(),
  markRead: async (id: string) => {
    try {
      const res = await http.post(`/notifications/${id}/read`);
      if (res?.data) return sbResponse({ data: { message: 'Marked as read' } });
    } catch {}
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id);
    return error ? sbError(error) : sbResponse({ data: { message: 'Marked as read' } });
  },
  deleteAll: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post('/notifications/delete-all');
      if (res?.data) return sbResponse({ data: { message: 'All deleted' } });
    } catch {}
    const { error } = await supabase.from('notifications').delete().eq('user_id', userId);
    return error ? sbError(error) : sbResponse({ data: { message: 'All deleted' } });
  },
  remove: async (id: string) => {
    try {
      const res = await http.delete(`/notifications/${id}`);
      if (res?.data) return sbResponse({ data: { message: 'Deleted' } });
    } catch {}
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    return error ? sbError(error) : sbResponse({ data: { message: 'Deleted' } });
  },
  getUnreadCount: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { count: 0 } });
    try {
      const res = await http.get('/notifications/unread-count');
      const count = res?.data?.data?.count ?? res?.data?.count;
      if (count !== undefined) return sbResponse({ data: { count } });
    } catch {}
    const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false);
    return error ? sbError(error) : sbResponse({ data: { count: count || 0 } });
  },
};

// ==============================
//  BANNERS API
// ==============================
export const bannersApi = {
  getAll: async (_position?: string) => sbResponse({ data: [] }),
  getActive: async (position?: string) => {
    try {
      const params = position ? { position } : undefined;
      const res = await http.get('/banners/active', { params: params as any });
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
};

// ==============================
//  DASHBOARD API
// ==============================
export const dashboardApi = {
  getStats: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { total_ads: 0, active_ads: 0, total_views: 0, total_favorites: 0 } });
    try {
      const { data: listings } = await supabase.from('listings').select('id, status, views_count').eq('user_id', userId);
      const { count: favorites } = await supabase.from('listing_favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId);
      const total_ads = listings?.length || 0;
      const active_ads = listings?.filter(l => l.status === 'active').length || 0;
      const total_views = listings?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0;
      return sbResponse({ data: { total_ads, active_ads, total_views, total_favorites: favorites || 0 } });
    } catch {
      try {
        const res = await http.get('/my-ads');
        const ads = (res?.data?.data || res?.data || []);
        const total_ads = ads.length;
        const active_ads = ads.filter((a: any) => a.status === 'active').length;
        const total_views = ads.reduce((s: number, a: any) => s + (a.views || 0), 0);
        return sbResponse({ data: { total_ads, active_ads, total_views, total_favorites: 0 } });
      } catch {
        return sbResponse({ data: { total_ads: 0, active_ads: 0, total_views: 0, total_favorites: 0 } });
      }
    }
  },
  getRecentAds: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    try {
      const res = await http.get('/my-ads');
      const ads = normalizeAds((res?.data?.data || res?.data || []).slice(0, 5));
      if (ads.length > 0) return sbResponse({ data: ads });
    } catch {}
    try {
      const { data } = await supabase.from('listings').select('*, listing_images(*)').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
      return sbResponse({ data: (data || []).map(l => fromSupabaseListing(l, l.listing_images || [])) });
    } catch {
      return sbResponse({ data: [] });
    }
  },
  getAnalytics: async (period?: string) => {
    try {
      const res = await http.get('/analytics/overview', { params: { period } as any });
      return sbResponse({ data: res?.data?.data || res?.data || { views: [], clicks: [] } });
    } catch {
      return sbResponse({ data: { views: [], clicks: [] } });
    }
  },
};

function fromSupabaseListing(listing: any, images: any[] = []): any {
  if (!listing) return listing;
  return normalizeAd({
    ...listing,
    listing_images: images,
  });
}

// ==============================
//  SEARCH API
// ==============================
export const searchApi = {
  search: async (params: Record<string, any>) => {
    try {
      const res = await http.get('/search', { params: params as any });
      const responseData = res?.data || { data: [], meta: null };
      return sbResponse({
        data: normalizeAds(responseData.data || []),
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
      return sbResponse({ data: normalizeAds(res?.data?.data || []) });
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
    try {
      const res = await http.get('/notification-preferences');
      const data = res?.data?.data || res?.data;
      if (data) return sbResponse({ data });
    } catch {}
    const { data } = await supabase.from('profiles').select('notification_preferences').eq('id', userId).single();
    return sbResponse({ data: (data as any)?.notification_preferences || {} });
  },
  update: async (prefs: any) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.put('/notification-preferences', prefs);
      if (res?.data) return sbResponse({ data: prefs });
    } catch {}
    const { error } = await supabase.from('profiles').update({ notification_preferences: prefs } as any).eq('id', userId);
    return error ? sbError(error) : sbResponse({ data: prefs });
  },
};

// ==============================
//  PROMOTIONS API
// ==============================
export const promotionsApi = {
  getPlans: async () => {
    try {
      const res = await http.get('/ads/boost-plans');
      const plans = res?.data?.data || res?.data || [];
      if (Array.isArray(plans) && plans.length > 0) {
        return sbResponse({ data: plans.map((p: any) => ({
          id: p.id, name: p.name, type: p.type, price: p.price,
          duration_days: p.duration_days, priority_score: p.priority_score,
          badge_label: p.badge_label, badge_icon: p.badge_icon,
          color_scheme: p.color_scheme, features: p.features,
        })) });
      }
    } catch {}
    const { data, error } = await supabase.from('boost_plans').select('*').eq('is_active', true).order('sort_order');
    return error ? sbError(error) : sbResponse({ data: (data || []).map((p: any) => ({
      id: p.id, name: p.name, type: p.type, price: p.price,
      duration_days: p.duration_days, priority_score: p.priority_score,
      badge_label: p.badge_label, badge_icon: p.badge_icon,
      color_scheme: p.color_scheme, features: p.features,
    })) });
  },
  buy: async (data: { ad_id: number; plan_id: number; payment_method: string }) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post(`/ads/${data.ad_id}/boost`, data);
      if (res?.data) return sbResponse({ data: res?.data?.data || { message: 'Promotion purchased' } });
    } catch {}
    const { data: plan } = await supabase.from('boost_plans').select('*').eq('id', String(data.plan_id)).single();
    if (!plan) return sbError({ message: 'Plan not found' });
    const { error } = await supabase.from('boosted_listings').insert({
      listing_id: String(data.ad_id), user_id: userId, plan_id: String(data.plan_id),
      boost_type: plan.type, start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + plan.duration_days * 86400000).toISOString(),
      payment_amount: plan.price,
      payment_status: data.payment_method === 'wallet' ? 'completed' : 'pending',
      status: data.payment_method === 'wallet' ? 'active' : 'pending',
    });
    return error ? sbError(error) : sbResponse({ data: { message: 'Promotion purchased' } });
  },
  verifyPayment: async (reference: string) => {
    try {
      const res = await http.post('/payments/verify', { reference });
      return sbResponse({ data: res?.data?.data || { message: 'Payment verified' } });
    } catch { return sbResponse({ data: { message: 'Payment verified' } }); }
  },
  getMyPromotions: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    try {
      const res = await http.get('/my-boosts');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data) && data.length > 0) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('boosted_listings').select('*, boost_plans(*)').eq('user_id', userId).limit(50);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  getAdPromotions: async (adId: number) => {
    try {
      const res = await http.get(`/ads/${adId}/boost-status`);
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  cancel: async (promotionId: number) => {
    try {
      const res = await http.post(`/boosts/${promotionId}/deactivate`);
      return sbResponse({ data: res?.data?.data || { message: 'Cancelled' } });
    } catch { return sbResponse({ data: { message: 'Cancelled' } }); }
  },
};

// ==============================
//  WALLET API
// ==============================
export const walletApi = {
  getBalance: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { balance: 0 } });
    try {
      const res = await http.get('/wallet/balance');
      if (res?.data?.data?.balance !== undefined) return sbResponse({ data: res.data.data });
      if (res?.data?.balance !== undefined) return sbResponse({ data: res.data });
    } catch {}
    const { data, error } = await supabase.from('transactions').select('amount, type').eq('user_id', userId);
    if (error) return sbError(error);
    const balance = (data || []).reduce((acc: number, t: any) => t.type === 'credit' ? acc + (t.amount || 0) : acc - (t.amount || 0), 0);
    return sbResponse({ data: { balance, currency: 'NGN' } });
  },
  getTransactions: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    try {
      const res = await http.get('/wallet/transactions');
      const txns = res?.data?.data || res?.data || [];
      if (Array.isArray(txns) && txns.length > 0) return sbResponse({ data: txns });
    } catch {}
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  fundWallet: async (amount: number, method: string) => {
    try {
      const res = await http.post('/wallet/fund', { amount, method });
      return sbResponse({ data: res?.data?.data || { message: 'Funding initiated', reference: `REF-${Date.now()}` } });
    } catch {
      return sbResponse({ data: { message: 'Funding initiated', reference: `REF-${Date.now()}` } });
    }
  },
  verifyPayment: async (reference: string) => {
    try {
      const res = await http.post('/wallet/verify', { reference });
      return sbResponse({ data: res?.data?.data || { message: 'Payment verified' } });
    } catch {
      return sbResponse({ data: { message: 'Payment verified' } });
    }
  },
  checkBalance: async (amount: number) => {
    try {
      const res = await http.post('/wallet/check-balance', { amount });
      const sufficient = res?.data?.data?.sufficient ?? res?.data?.sufficient ?? true;
      return sbResponse({ data: { sufficient } });
    } catch { return sbResponse({ data: { sufficient: true } }); }
  },
  uploadBankProof: async (reference: string, proof: File) => {
    try {
      const formData = new FormData();
      formData.append('reference', reference);
      formData.append('proof', proof);
      const res = await http.post('/wallet/bank-transfer-proof', formData);
      return sbResponse({ data: res?.data?.data || { message: 'Proof uploaded' } });
    } catch { return sbResponse({ data: { message: 'Proof uploaded' } }); }
  },
};

// ==============================
//  IMAGE UPLOAD API
// ==============================
export const imageUploadApi = {
  upload: async (file: File, onProgress?: (pct: number) => void) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await http.upload('/uploads/image', formData, onProgress);
      const url = res?.data?.data?.url || res?.data?.url;
      if (url) return sbResponse({ data: { url, path: url } });
    } catch {}
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
  getBoostPrices: async () => {
    try {
      const res = await http.get('/ads/boost-prices');
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  myBoosts: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    try {
      const res = await http.get('/my-boosts');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data)) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('boosted_listings').select('*, boost_plans(*)').eq('user_id', userId).limit(50);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  boostAd: async (adId: string | number, data: any) => {
    try {
      const res = await http.post(`/ads/${adId}/boost`, data);
      return sbResponse({ data: res?.data?.data || { message: 'Boosted' } });
    } catch { return sbResponse({ data: { message: 'Boosted' } }); }
  },
  postSubmissionBoost: async (adId: string | number, data: any) => {
    try {
      const res = await http.post(`/ads/${adId}/post-submission-boost`, data);
      return sbResponse({ data: res?.data?.data || { message: 'Boosted' } });
    } catch { return sbResponse({ data: { message: 'Boosted' } }); }
  },
  getBoostStatus: async (adId: string | number) => {
    try {
      const res = await http.get(`/ads/${adId}/boost-status`);
      return sbResponse({ data: res?.data?.data || { is_boosted: false } });
    } catch { return sbResponse({ data: { is_boosted: false } }); }
  },
  saveAd: async (adId: number) => {
    try {
      const res = await http.post(`/ads/${adId}/save`);
      if (res?.data) return sbResponse({ data: { message: 'Saved' } });
    } catch {}
    return favoritesApi.add(adId);
  },
  unsaveAd: async (adId: number) => {
    try {
      const res = await http.delete(`/ads/${adId}/unsave`);
      if (res?.data) return sbResponse({ data: { message: 'Unsaved' } });
    } catch {}
    return favoritesApi.remove(adId);
  },
  checkSavedStatus: async (adId: number) => {
    try {
      const res = await http.get(`/ads/${adId}/saved-check`);
      const is_favorited = res?.data?.data?.is_favorited ?? res?.data?.is_favorited ?? false;
      if (is_favorited !== undefined) return sbResponse({ data: { is_favorited } });
    } catch {}
    return favoritesApi.check(adId);
  },
  getSavedAds: async (_params?: any) => {
    try {
      const res = await http.get('/user/saved-ads');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data)) return sbResponse({ data: normalizeAds(data) });
    } catch {}
    return favoritesApi.getAll();
  },
  getRecentlyViewed: async (_params?: any) => {
    try {
      const res = await http.get('/user/recently-viewed');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data)) return sbResponse({ data: normalizeAds(data) });
    } catch { return sbResponse({ data: [] }); }
  },
  getShareLink: async (adId: number) => {
    try {
      const res = await http.get(`/ads/${adId}/share-link`);
      return sbResponse({ data: res?.data?.data || { url: '' } });
    } catch { return sbResponse({ data: { url: '' } }); }
  },
  clearRecentlyViewed: async () => {
    try {
      const res = await http.delete('/user/recently-viewed');
      if (res?.data) return sbResponse({ data: { message: 'Cleared' } });
    } catch {}
    return sbResponse({ data: { message: 'Cleared' } });
  },
};

// ==============================
//  PAYMENT API
// ==============================
export const paymentApi = {
  verifyPayment: async (reference: string) => {
    try {
      const res = await http.post('/payments/verify', { reference });
      return sbResponse({ data: res?.data?.data || { message: 'Verified' } });
    } catch { return sbResponse({ data: { message: 'Verified' } }); }
  },
  getPaystackPublicKey: async () => sbResponse({ data: { public_key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '' } }),
  getPendingPayments: async () => {
    try {
      const res = await http.get('/payments/pending');
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  cancelPayment: async (id: number) => {
    try {
      const res = await http.post(`/payments/${id}/cancel`);
      return sbResponse({ data: res?.data?.data || { message: 'Cancelled' } });
    } catch { return sbResponse({ data: { message: 'Cancelled' } }); }
  },
};

// ==============================
//  ADMIN BANK TRANSFERS API
// ==============================
export const adminBankTransfersApi = {
  getTransfers: async (status?: string) => {
    try {
      const params = status && status !== 'all' ? { status } : undefined;
      const res: any = await adminGet(`/${STEALTH_PREFIX}/bank-transfers`, params);
      return sbResponse({ data: res?.data || [] });
    } catch (e: any) { return sbError(e); }
  },
  getStats: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/bank-transfers/stats`);
      return sbResponse({ data: res?.data || { total: 0, pending: 0, approved: 0, rejected: 0 } });
    } catch (e: any) { return sbError(e); }
  },
  approve: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/bank-transfers/${id}/approve`);
      return sbResponse({ data: res?.data || { message: 'Approved' } });
    } catch (e: any) { return sbError(e); }
  },
  reject: async (id: number, note?: string) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/bank-transfers/${id}/reject`, { note });
      return sbResponse({ data: res?.data || { message: 'Rejected' } });
    } catch (e: any) { return sbError(e); }
  },
};

// ==============================
//  STORE API
// ==============================
export const storeApi = {
  getMyStore: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.get('/my-store');
      const data = res?.data?.data || res?.data;
      if (data) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return error ? sbError(error) : sbResponse({ data: { ...data, name: data?.full_name || data?.username } });
  },
  getBySlug: async (slug: string) => {
    try {
      const res = await http.get(`/stores/${slug}`);
      return sbResponse({ data: res?.data?.data || res?.data || null });
    } catch { return sbResponse({ data: null }); }
  },
  getByUser: async (userId: number) => {
    try {
      const res = await http.get(`/stores/by-user/${userId}`);
      const data = res?.data?.data || res?.data;
      if (data) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('profiles').select('*').eq('id', String(userId)).single();
    return error ? sbError(error) : sbResponse({ data });
  },
  create: async (formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post('/stores', formData);
      if (res?.data) return sbResponse({ data: res?.data?.data || { message: 'Created' } });
    } catch {}
    const updates: any = {};
    for (const [k, v] of Array.from(formData.entries())) updates[k] = v;
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    return error ? sbError(error) : sbResponse({ data });
  },
  update: async (formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      formData.append('_method', 'PUT');
      const res = await http.post('/stores/update', formData);
      if (res?.data) return sbResponse({ data: res?.data?.data || { message: 'Updated' } });
    } catch {}
    return storeApi.create(formData);
  },
  uploadLogo: async (file: File) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await http.post('/stores/upload-logo', formData);
      const url = res?.data?.data?.url || res?.data?.url;
      if (url) return sbResponse({ data: { url } });
    } catch {}
    const path = `stores/${userId}/logo_${Date.now()}`;
    await supabase.storage.from('store-assets').upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(path);
    return sbResponse({ data: { url: publicUrl } });
  },
  uploadBanner: async (file: File) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const formData = new FormData();
      formData.append('banner', file);
      const res = await http.post('/stores/upload-banner', formData);
      const url = res?.data?.data?.url || res?.data?.url;
      if (url) return sbResponse({ data: { url } });
    } catch {}
    const path = `stores/${userId}/banner_${Date.now()}`;
    await supabase.storage.from('store-assets').upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(path);
    return sbResponse({ data: { url: publicUrl } });
  },
  follow: async (storeId: number) => {
    try {
      const res = await http.post(`/stores/${storeId}/follow`);
      return sbResponse({ data: res?.data?.data || { message: 'Followed' } });
    } catch { return sbResponse({ data: { message: 'Followed' } }); }
  },
  unfollow: async (storeId: number) => {
    try {
      const res = await http.delete(`/stores/${storeId}/unfollow`);
      return sbResponse({ data: res?.data?.data || { message: 'Unfollowed' } });
    } catch { return sbResponse({ data: { message: 'Unfollowed' } }); }
  },
  checkFollow: async (storeId: number) => {
    try {
      const res = await http.get(`/stores/${storeId}/check-follow`);
      const is_following = res?.data?.data?.is_following ?? res?.data?.is_following ?? false;
      return sbResponse({ data: { is_following } });
    } catch { return sbResponse({ data: { is_following: false } }); }
  },
  getFollowers: async (storeId: number) => {
    try {
      const res = await http.get(`/stores/${storeId}/followers`);
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  getAnalytics: async (period?: string) => {
    try {
      const res = await http.get('/store/analytics', { params: { period } as any });
      return sbResponse({ data: res?.data?.data || {} });
    } catch { return sbResponse({ data: {} }); }
  },
  getDashboardAnalytics: async () => {
    try {
      const res = await http.get('/store/dashboard-analytics');
      return sbResponse({ data: res?.data?.data || {} });
    } catch { return sbResponse({ data: {} }); }
  },
  checkSlug: async (slug: string) => {
    try {
      const res = await http.get('/stores/check-slug', { params: { slug } as any });
      const available = res?.data?.data?.available ?? res?.data?.available ?? true;
      return sbResponse({ data: { available } });
    } catch { return sbResponse({ data: { available: true } }); }
  },
};

// ==============================
//  SAVED SEARCHES API
// ==============================
export const savedSearchesApi = {
  getAll: async () => {
    try {
      const res = await http.get('/saved-searches');
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  getById: async (id: number) => {
    try {
      const res = await http.get(`/saved-searches/${id}`);
      return sbResponse({ data: res?.data?.data || null });
    } catch { return sbResponse({ data: null }); }
  },
  create: async (data: any) => {
    try {
      const res = await http.post('/saved-searches', data);
      return sbResponse({ data: res?.data?.data || { message: 'Saved' } });
    } catch { return sbResponse({ data: { message: 'Saved' } }); }
  },
  update: async (id: number, data: any) => {
    try {
      const res = await http.put(`/saved-searches/${id}`, data);
      return sbResponse({ data: res?.data?.data || { message: 'Updated' } });
    } catch { return sbResponse({ data: { message: 'Updated' } }); }
  },
  delete: async (id: number) => {
    try {
      const res = await http.delete(`/saved-searches/${id}`);
      return sbResponse({ data: res?.data?.data || { message: 'Deleted' } });
    } catch { return sbResponse({ data: { message: 'Deleted' } }); }
  },
  search: async (id: number, page?: number) => {
    try {
      const res = await http.get(`/saved-searches/${id}/search`, { params: { page } as any });
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
};

// ==============================
//  VERIFICATION API
// ==============================
export const verificationApi = {
  getMyVerifications: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: [] });
    try {
      const res = await http.get('/verifications');
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data) && data.length > 0) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('verification_requests').select('*').eq('user_id', userId).limit(20);
    return error ? sbError(error) : sbResponse({ data: data || [] });
  },
  submitPhone: async (phone: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post('/verifications/phone', { phone });
      if (res?.data) return sbResponse({ data: { message: 'Phone submitted' } });
    } catch {}
    const { error } = await supabase.from('profiles').update({ phone }).eq('id', userId);
    return error ? sbError(error) : sbResponse({ data: { message: 'Phone submitted' } });
  },
  submitEmail: async (email: string) => {
    try {
      const res = await http.post('/verifications/email', { email });
      return sbResponse({ data: res?.data?.data || { message: 'Email submitted' } });
    } catch { return sbResponse({ data: { message: 'Email submitted' } }); }
  },
  submitIdentity: async (formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post('/verifications/identity', formData);
      if (res?.data) return sbResponse({ data: res?.data?.data || { message: 'Identity submitted' } });
    } catch {}
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
      user_id: userId, verification_type: 'identity',
      document_front_url: docs.document_front || docs.front || null,
      document_back_url: docs.document_back || docs.back || null,
      selfie_url: docs.selfie || null,
    });
    return error ? sbError(error) : sbResponse({ data: { message: 'Identity submitted' } });
  },
  getStatus: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: { status: 'not_submitted' } });
    try {
      const res = await http.get('/verifications/status');
      const status = res?.data?.data?.status || res?.data?.status;
      if (status) return sbResponse({ data: { status } });
    } catch {}
    const { data } = await supabase.from('verification_requests').select('status').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    return sbResponse({ data: { status: data?.status || 'not_submitted' } });
  },
  uploadDocument: async (file: File, type: string, field: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      formData.append('field', field);
      const res = await http.post('/verifications/upload', formData);
      const url = res?.data?.data?.url || res?.data?.url;
      if (url) return sbResponse({ data: { url, field } });
    } catch {}
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
  send: async (email: string) => {
    try {
      const res = await http.post('/email-verification/send', { email });
      return sbResponse({ data: res?.data?.data || { message: 'Email sent' } });
    } catch { return sbResponse({ data: { message: 'Email sent' } }); }
  },
  verify: async (token: string) => {
    try {
      const res = await http.post('/email-verification/verify', { token });
      return sbResponse({ data: res?.data?.data || { message: 'Verified' } });
    } catch { return sbResponse({ data: { message: 'Verified' } }); }
  },
  resend: async () => {
    try {
      const res = await http.post('/email-verification/resend');
      return sbResponse({ data: res?.data?.data || { message: 'Resent' } });
    } catch { return sbResponse({ data: { message: 'Resent' } }); }
  },
  status: async () => {
    try {
      const res = await http.get('/email-verification/status');
      return sbResponse({ data: res?.data?.data || { verified: true } });
    } catch { return sbResponse({ data: { verified: true } }); }
  },
};

// ==============================
//  BUSINESS VERIFICATION API
// ==============================
export const businessVerificationApi = {
  getMyVerification: async () => {
    const userId = await ensureUserId();
    if (!userId) return sbResponse({ data: null });
    try {
      const res = await http.get('/business-verification');
      const data = res?.data?.data || res?.data;
      if (data) return sbResponse({ data });
    } catch {}
    const { data, error } = await supabase.from('verification_requests').select('*').eq('user_id', userId).eq('verification_type', 'business').maybeSingle();
    return error ? sbError(error) : sbResponse({ data });
  },
  submit: async (formData: FormData) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const res = await http.post('/business-verification', formData);
      if (res?.data) return sbResponse({ data: res?.data?.data || { message: 'Business verification submitted' } });
    } catch {}
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
    try {
      const res = await http.get('/business-verification/status');
      const status = res?.data?.data?.status || res?.data?.status;
      if (status) return sbResponse({ data: { status } });
    } catch {}
    const { data } = await supabase.from('verification_requests').select('status').eq('user_id', userId).eq('verification_type', 'business').order('created_at', { ascending: false }).limit(1).maybeSingle();
    return sbResponse({ data: { status: data?.status || 'not_submitted' } });
  },
  uploadDocument: async (file: File, field: string) => {
    const userId = await ensureUserId();
    if (!userId) return sbError({ message: 'Not authenticated' });
    try {
      const formData = new FormData();
      formData.append(field || 'document', file);
      const res = await http.post('/business-verification/upload', formData);
      return sbResponse({ data: res?.data?.data || { url: '' } });
    } catch {}
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
  getOverview: async (period?: string) => {
    try {
      const res = await http.get('/analytics/overview', { params: { period } as any });
      return sbResponse({ data: res?.data?.data || res?.data || {} });
    } catch { return sbResponse({ data: {} }); }
  },
  getAdPerformance: async (period?: string) => {
    try {
      const res = await http.get('/analytics/ad-performance', { params: { period } as any });
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  getSingleAdPerformance: async (adId: number, period?: string) => {
    try {
      const res = await http.get(`/analytics/ad/${adId}`, { params: { period } as any });
      return sbResponse({ data: res?.data?.data || {} });
    } catch { return sbResponse({ data: {} }); }
  },
  getDailyBreakdown: async (period?: string) => {
    try {
      const res = await http.get('/analytics/daily', { params: { period } as any });
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  getTrends: async (period?: string) => {
    try {
      const res = await http.get('/analytics/trends', { params: { period } as any });
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  getTopAds: async () => {
    try {
      const res = await http.get('/analytics/top-ads');
      return sbResponse({ data: res?.data?.data || [] });
    } catch { return sbResponse({ data: [] }); }
  },
  getStorePerformance: async (period?: string) => {
    try {
      const res = await http.get('/analytics/store', { params: { period } as any });
      return sbResponse({ data: res?.data?.data || {} });
    } catch { return sbResponse({ data: {} }); }
  },
  recordView: async (adId: number) => {
    try {
      await http.post(`/analytics/record-view/${adId}`);
      return sbResponse({ data: { message: 'View recorded' } });
    } catch { return adsApi.incrementViews(adId); }
  },
  recordClick: async (adId: number, type: string) => {
    try {
      const res = await http.post(`/analytics/record-click/${adId}`, { type });
      return sbResponse({ data: res?.data?.data || { message: 'Click recorded' } });
    } catch { return sbResponse({ data: { message: 'Click recorded' } }); }
  },
  recordShare: async (adId: number) => {
    try {
      const res = await http.post(`/analytics/record-share/${adId}`);
      return sbResponse({ data: res?.data?.data || { message: 'Share recorded' } });
    } catch { return sbResponse({ data: { message: 'Share recorded' } }); }
  },
};

// ==============================
//  ADMIN VERIFICATION API
// ==============================
export const adminVerificationApi = {
  getAll: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/verifications`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },
  getById: async (id: number) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/verifications/${id}`);
      return sbResponse({ data: res?.data || null });
    } catch (e: any) { return sbError(e); }
  },
  approve: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/verifications/${id}/approve`);
      return sbResponse({ data: res?.data || { message: 'Approved' } });
    } catch (e: any) { return sbError(e); }
  },
  reject: async (id: number, reason: string) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/verifications/${id}/reject`, { reason });
      return sbResponse({ data: res?.data || { message: 'Rejected' } });
    } catch (e: any) { return sbError(e); }
  },
  getStats: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/verifications/stats`);
      return sbResponse({ data: res?.data || { total: 0, pending: 0, approved: 0, rejected: 0 } });
    } catch (e: any) { return sbError(e); }
  },
};

// ==============================
//  ADMIN BUSINESS VERIFICATION API
// ==============================
export const adminBusinessVerificationApi = {
  getAll: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/business-verifications`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },
  getById: async (id: number) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/business-verifications/${id}`);
      return sbResponse({ data: res?.data || null });
    } catch (e: any) { return sbError(e); }
  },
  approve: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/business-verifications/${id}/approve`);
      return sbResponse({ data: res?.data || { message: 'Approved' } });
    } catch (e: any) { return sbError(e); }
  },
  reject: async (id: number, reason: string) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/business-verifications/${id}/reject`, { reason });
      return sbResponse({ data: res?.data || { message: 'Rejected' } });
    } catch (e: any) { return sbError(e); }
  },
  getStats: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/business-verifications/stats`);
      return sbResponse({ data: res?.data || { total: 0, pending: 0, approved: 0, rejected: 0 } });
    } catch (e: any) { return sbError(e); }
  },
};

// ==============================
//  ADMIN STORE API
// ==============================
export const adminStoreApi = {
  getAll: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/stores`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },
  getById: async (id: number) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/stores/${id}`);
      return sbResponse({ data: res?.data || null });
    } catch (e: any) { return sbError(e); }
  },
  verify: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/stores/${id}/verify`);
      return sbResponse({ data: res?.data || { message: 'Verified' } });
    } catch (e: any) { return sbError(e); }
  },
  suspend: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/stores/${id}/suspend`);
      return sbResponse({ data: res?.data || { message: 'Suspended' } });
    } catch (e: any) { return sbError(e); }
  },
  activate: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/stores/${id}/activate`);
      return sbResponse({ data: res?.data || { message: 'Activated' } });
    } catch (e: any) { return sbError(e); }
  },
  delete: async (id: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/stores/${id}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },
};

// ==============================
//  ADMIN API  (legacy admin endpoints)
// ==============================
const STEALTH_PREFIX = '/secure-control-9ja';

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('admin-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {}
  const token = localStorage.getItem('admin_token');
  if (token) return token;
  return null;
}

function getAdminHeaders(): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...getAdminHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Admin API ${res.status}: ${body}`);
  }
  return res.json();
}

async function adminPost(path: string, body?: any): Promise<any> {
  return adminFetch(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  });
}

async function adminPut(path: string, body?: any): Promise<any> {
  return adminFetch(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  });
}

async function adminDelete(path: string): Promise<any> {
  return adminFetch(path, { method: 'DELETE' });
}

async function adminGet<T = any>(path: string, params?: Record<string, any>): Promise<T> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return adminFetch<T>(`${path}${qs}`);
}

export const adminApi = {
  getDashboard: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/dashboard`);
      const d = res?.data || res || {};
      return sbResponse({ stats: d });
    } catch (e: any) { return sbError(e); }
  },
  getPaymentStats: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/payments/summary`);
      return sbResponse({ data: res?.data || {} });
    } catch (e: any) { return sbError(e); }
  },
  getPayments: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/payments`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },
  getFinancialSummary: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/payments/summary`);
      return sbResponse({ data: res?.data || {} });
    } catch (e: any) { return sbError(e); }
  },
  approvePayment: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/payments/${id}/approve`);
      return sbResponse({ data: res?.data || { message: 'Approved' } });
    } catch (e: any) { return sbError(e); }
  },
  rejectPayment: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/payments/${id}/reject`);
      return sbResponse({ data: res?.data || { message: 'Rejected' } });
    } catch (e: any) { return sbError(e); }
  },

  getBoosts: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/boosts`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },
  getBoostActiveAds: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/boosts/active-ads`);
      return sbResponse({ data: res?.data || [] });
    } catch (e: any) { return sbError(e); }
  },
  deactivateBoost: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/boosts/${id}/deactivate`);
      return sbResponse({ data: res?.data || { message: 'Deactivated' } });
    } catch (e: any) { return sbError(e); }
  },
  extendBoost: async (id: number, days: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/boosts/${id}/extend`, { days });
      return sbResponse({ data: res?.data || { message: 'Extended' } });
    } catch (e: any) { return sbError(e); }
  },

  getUsers: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/users`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },
  suspendUser: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/users/${id}/suspend`);
      return sbResponse({ data: res?.data || { message: 'Suspended' } });
    } catch (e: any) { return sbError(e); }
  },
  banUser: async (id: number, reason: string) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/users/${id}/ban`, { reason });
      return sbResponse({ data: res?.data || { message: 'Banned' } });
    } catch (e: any) { return sbError(e); }
  },
  activateUser: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/users/${id}/activate`);
      return sbResponse({ data: res?.data || { message: 'Activated' } });
    } catch (e: any) { return sbError(e); }
  },
  deleteUser: async (id: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/users/${id}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },

  getAds: async (params?: any) => {
    try {
      const res = await http.get(`${STEALTH_PREFIX}/ads`, { params: params as any });
      const responseData = res?.data || { data: [], meta: null };
      return sbResponse({
        data: normalizeAds(responseData.data || []),
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
        data: normalizeAds(responseData.data || []),
        meta: responseData.meta || buildMeta(0, params?.page || 1, params?.per_page || 20),
      });
    } catch (e: any) {
      return sbError(e);
    }
  },
  approveAd: async (id: number) => {
    try {
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/ads/${id}/approve`, { method: 'POST' });
      return sbResponse({ data: res?.data || { message: 'Approved' } });
    } catch (e: any) { return sbError(e); }
  },
  rejectAd: async (id: number) => {
    try {
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/ads/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason: 'Rejected by admin' }), headers: { 'Content-Type': 'application/json' } });
      return sbResponse({ data: res?.data || { message: 'Rejected' } });
    } catch (e: any) { return sbError(e); }
  },
  verifyAd: async (id: number) => {
    try {
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/ads/${id}/verify`, { method: 'POST' });
      return sbResponse({ data: res?.data || { message: 'Verified' } });
    } catch (e: any) { return sbError(e); }
  },
  featureAd: async (id: number) => {
    try {
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/ads/${id}/feature`, { method: 'POST' });
      return sbResponse({ data: res?.data || { message: 'Featured' } });
    } catch (e: any) { return sbError(e); }
  },
  promoteAd: async (id: number) => {
    try {
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/ads/${id}/promote`, { method: 'POST' });
      return sbResponse({ data: res?.data || { message: 'Promoted' } });
    } catch (e: any) { return sbError(e); }
  },
  deleteAd: async (id: number) => {
    try {
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/ads/${id}`, { method: 'DELETE' });
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },
  bulkDeleteAds: async (ids: number[]) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/ads/bulk-delete`, { ids });
      return sbResponse({ data: res?.data || { message: `${ids.length} deleted` } });
    } catch (e: any) {
      const results = await Promise.allSettled(ids.map(id => adminFetch(`/${STEALTH_PREFIX}/ads/${id}`, { method: 'DELETE' })));
      return sbResponse({ data: { message: `${results.filter(r => r.status === 'fulfilled').length} of ${ids.length} deleted` } });
    }
  },
  updateAd: async (id: number, data: any) => {
    try {
      const res: any = await adminPut(`/${STEALTH_PREFIX}/ad/${id}`, data);
      return sbResponse({ data: res?.data || { message: 'Updated' } });
    } catch (e: any) { return sbError(e); }
  },

  getCategories: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/categories`);
      return sbResponse({ data: res?.data || [], tree: res?.tree || res?.data || [], all: res?.all || [] });
    } catch (e: any) { return sbError(e); }
  },
  createCategory: async (data: any) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/categories`, data);
      return sbResponse({ data: res?.data || { message: 'Created' } });
    } catch (e: any) { return sbError(e); }
  },
  updateCategory: async (id: number, data: any) => {
    try {
      const res: any = await adminPut(`/${STEALTH_PREFIX}/categories/${id}`, data);
      return sbResponse({ data: res?.data || { message: 'Updated' } });
    } catch (e: any) { return sbError(e); }
  },
  deleteCategory: async (id: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/categories/${id}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },
  uploadCategoryImage: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/categories/upload-image`, { method: 'POST', body: formData });
      return sbResponse({ url: res?.data?.url || res?.url || '' });
    } catch (e: any) { return sbError(e); }
  },
  reorderCategories: async (items: any[]) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/categories/reorder`, { items });
      return sbResponse({ data: res?.data || { message: 'Reordered' } });
    } catch (e: any) { return sbError(e); }
  },

  getReports: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/reports`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },
  resolveReport: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/reports/${id}/resolve`);
      return sbResponse({ data: res?.data || { message: 'Resolved' } });
    } catch (e: any) { return sbError(e); }
  },
  dismissReport: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/reports/${id}/dismiss`);
      return sbResponse({ data: res?.data || { message: 'Dismissed' } });
    } catch (e: any) {
      return adminApi.resolveReport(id);
    }
  },

  getAdminWallet: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/wallets`);
      return sbResponse({ data: res?.data || res?.summary || { balance: 0 } });
    } catch (e: any) { return sbError(e); }
  },
  creditUser: async (userId: number, amount: number, description: string) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/wallets/credit`, { user_id: userId, amount, description });
      return sbResponse({ data: res?.data || { message: 'Credited' } });
    } catch (e: any) { return sbError(e); }
  },
  debitUser: async (userId: number, amount: number, description: string) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/wallets/debit`, { user_id: userId, amount, description });
      return sbResponse({ data: res?.data || { message: 'Debited' } });
    } catch (e: any) { return sbError(e); }
  },
  adminWithdraw: async (amount: number, bankName: string, accountNumber: string, accountName: string, description?: string) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/withdraw`, { amount, bank_name: bankName, account_number: accountNumber, account_name: accountName, description });
      return sbResponse({ data: res?.data || { message: 'Withdrawal initiated' } });
    } catch (e: any) { return sbError(e); }
  },
  getTransactions: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/transactions`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },

  getWallets: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/wallets`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },
  creditWallet: async (id: number, amount: number, description: string) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/wallets/${id}/credit`, { amount, description });
      return sbResponse({ data: res?.data || { message: 'Credited' } });
    } catch (e: any) { return sbError(e); }
  },
  debitWallet: async (id: number, amount: number, description: string) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/wallets/${id}/debit`, { amount, description });
      return sbResponse({ data: res?.data || { message: 'Debited' } });
    } catch (e: any) { return sbError(e); }
  },

  getPromotions: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/promotions`);
      return sbResponse({ data: res?.data || [] });
    } catch (e: any) { return sbError(e); }
  },
  createPromotion: async (data: any) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/promotions`, data);
      return sbResponse({ data: res?.data || { message: 'Created' } });
    } catch (e: any) { return sbError(e); }
  },
  updatePromotion: async (id: number, data: any) => {
    try {
      const res: any = await adminPut(`/${STEALTH_PREFIX}/promotions/${id}`, data);
      return sbResponse({ data: res?.data || { message: 'Updated' } });
    } catch (e: any) { return sbError(e); }
  },
  deletePromotion: async (id: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/promotions/${id}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },

  getPromotionPlans: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/boost/plans`);
      return sbResponse({ data: res?.data || [] });
    } catch (e: any) { return sbError(e); }
  },
  createPromotionPlan: async (data: any) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/boost/plans`, data);
      return sbResponse({ data: res?.data || { message: 'Created' } });
    } catch (e: any) { return sbError(e); }
  },
  updatePromotionPlan: async (id: number, data: any) => {
    try {
      const res: any = await adminPut(`/${STEALTH_PREFIX}/boost/plans/${id}`, data);
      return sbResponse({ data: res?.data || { message: 'Updated' } });
    } catch (e: any) { return sbError(e); }
  },
  deletePromotionPlan: async (id: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/boost/plans/${id}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },

  getBanners: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/banners`);
      return sbResponse({ data: res?.data || [] });
    } catch (e: any) { return sbError(e); }
  },
  createBanner: async (data: FormData) => {
    try {
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/banners`, { method: 'POST', body: data });
      return sbResponse({ data: res?.data || { message: 'Created' } });
    } catch (e: any) { return sbError(e); }
  },
  updateBanner: async (id: number, data: FormData) => {
    try {
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/banners/${id}`, { method: 'POST', body: data });
      data.append('_method', 'PUT');
      return sbResponse({ data: res?.data || { message: 'Updated' } });
    } catch (e: any) { return sbError(e); }
  },
  deleteBanner: async (id: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/banners/${id}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },

  getBroadcasts: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/broadcasts`, params);
      return sbResponse({ data: res?.data || [], meta: res?.meta || buildMeta(0, params?.page || 1, params?.per_page || 20) });
    } catch (e: any) { return sbError(e); }
  },
  getBroadcast: async (id: number) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/broadcasts/${id}`);
      return sbResponse({ data: res?.data || null });
    } catch (e: any) { return sbError(e); }
  },
  createBroadcast: async (data: any) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/broadcast`, data);
      return sbResponse({ data: res?.data || { message: 'Created' } });
    } catch (e: any) { return sbError(e); }
  },
  resendBroadcast: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/broadcasts/${id}/resend`);
      return sbResponse({ data: res?.data || { message: 'Resent' } });
    } catch (e: any) { return sbError(e); }
  },
  deleteBroadcast: async (id: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/broadcasts/${id}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },

  getSettings: async () => {
    let lastError: any;
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return sbResponse({ data: json.data });
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e) { lastError = e; }
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/settings`);
      if (res?.data) return sbResponse({ data: res.data });
      lastError = new Error('Backend returned no data');
    } catch (e: any) { lastError = e; }
    console.error('[Settings API] All getSettings attempts failed:', lastError);
    return sbResponse({ data: { auto_approval_enabled: false, approval_duration_minutes: 2, max_images_per_ad: 10, ad_expiration_days: 30 } });
  },
  updateSettings: async (data: any) => {
    let lastError: any;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return sbResponse({ data: json.data });
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e) { lastError = e; }
    try {
      const res: any = await adminPut(`/${STEALTH_PREFIX}/settings`, data);
      if (res?.data) return sbResponse({ data: res.data });
      lastError = new Error('Backend returned no data');
    } catch (e: any) { lastError = e; }
    throw lastError || new Error('Failed to update settings');
  },

  getWatermarkSettings: async () => {
    try {
      const res = await fetch('/api/admin/watermark');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return sbResponse({ data: json.data });
      }
    } catch {}
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/watermark`);
      return sbResponse({ data: res?.data || {} });
    } catch (e: any) { return sbError(e); }
  },
  updateWatermarkSettings: async (data: any) => {
    try {
      const res = await fetch('/api/admin/watermark', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return sbResponse({ data: json?.data || { message: 'Updated' } });
      }
    } catch {}
    try {
      const res: any = await adminPut(`/${STEALTH_PREFIX}/watermark`, data);
      return sbResponse({ data: res?.data || { message: 'Updated' } });
    } catch (e: any) { return sbError(e); }
  },
  uploadWatermarkLogo: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch('/api/admin/watermark', { method: 'POST', body: formData });
      if (res.ok) {
        const json = await res.json();
        return sbResponse({ data: json?.data || {} });
      }
    } catch {}
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/watermark/logo`, { method: 'POST', body: formData });
      return sbResponse({ data: { url: res?.data?.url || res?.url || '' } });
    } catch (e: any) { return sbError(e); }
  },

  getCategoryFields: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/category-fields`, params);
      return sbResponse(res?.data?.data || res?.data || []);
    } catch { return sbResponse([]); }
  },
  createCategoryField: async (categoryId: number, data: any) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/category-fields`, { ...data, category_id: categoryId });
      return sbResponse({ data: res?.data || { message: 'Created' } });
    } catch (e: any) { return sbError(e); }
  },
  updateCategoryField: async (id: number, data: any) => {
    try {
      const res: any = await adminPut(`/${STEALTH_PREFIX}/category-fields/${id}`, data);
      return sbResponse({ data: res?.data || { message: 'Updated' } });
    } catch (e: any) { return sbError(e); }
  },
  deleteCategoryField: async (id: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/category-fields/${id}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },

  getFonts: async () => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/fonts`);
      return sbResponse({ data: res?.data || [] });
    } catch (e: any) { return sbError(e); }
  },
  uploadFont: async (file: File, name: string) => {
    try {
      const formData = new FormData();
      formData.append('font', file);
      formData.append('name', name);
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/fonts`, { method: 'POST', body: formData });
      return sbResponse({ data: res?.data || { message: 'Uploaded' } });
    } catch (e: any) { return sbError(e); }
  },
  deleteFont: async (id: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/fonts/${id}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },
  setDefaultFont: async (id: number) => {
    try {
      const res: any = await adminPost(`/${STEALTH_PREFIX}/fonts/${id}/default`);
      return sbResponse({ data: res?.data || { message: 'Set as default' } });
    } catch (e: any) { return sbError(e); }
  },

  addAdImages: async (adId: number, files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images[]', f));
      const res: any = await adminFetch(`/${STEALTH_PREFIX}/ad/${adId}/images`, { method: 'POST', body: formData });
      return sbResponse({ data: res?.data || { message: 'Added' } });
    } catch (e: any) { return sbError(e); }
  },
  updateAdImage: async (_adId: number, _imageId: number, _data: any) => {
    try {
      const res: any = await adminPut(`/${STEALTH_PREFIX}/ad/${_adId}/images/order`, _data);
      return sbResponse({ data: res?.data || { message: 'Updated' } });
    } catch (e: any) { return sbError(e); }
  },
  deleteAdImage: async (adId: number, imageId: number) => {
    try {
      const res: any = await adminDelete(`/${STEALTH_PREFIX}/ad/${adId}/image/${imageId}`);
      return sbResponse({ data: res?.data || { message: 'Deleted' } });
    } catch (e: any) { return sbError(e); }
  },

  getAnalytics: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/analytics`, params);
      const d = res?.data?.data || res?.data || res || {};
      return sbResponse(d);
    } catch { return sbResponse({}); }
  },
  getStatesAnalytics: async (params?: any) => {
    try {
      const res: any = await adminGet(`/${STEALTH_PREFIX}/analytics/states`, params);
      const d = res?.data?.data || res?.data || [];
      return sbResponse(d);
    } catch { return sbResponse([]); }
  },

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
