'use client';

import { supabase } from './supabase';

const BUCKET_NAME = 'listing-images';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadListingImage(
  listingId: string,
  file: File,
  onProgress?: (progress: number) => void
) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { url: null, thumbnailUrl: null, path: null, error: { message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' } };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { url: null, thumbnailUrl: null, path: null, error: { message: 'File too large. Maximum size: 10MB' } };
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `listings/${listingId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (onProgress) onProgress(100);

  if (uploadError) {
    return { url: null, thumbnailUrl: null, path: null, error: { message: uploadError.message } };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(uploadData.path);

  const thumbnailPath = `listings/${listingId}/thumb_${Date.now()}.${fileExt}`;

  const { data: thumbData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(uploadData.path);

  const imageUrl = urlData.publicUrl;

  const { error: dbError } = await supabase
    .from('listing_images')
    .insert({
      listing_id: listingId,
      url: imageUrl,
      thumbnail_url: imageUrl,
      medium_url: imageUrl,
      storage_path: uploadData.path,
      is_primary: false,
    });

  if (dbError) {
    return { url: null, thumbnailUrl: null, path: null, error: { message: dbError.message } };
  }

  return { url: imageUrl, thumbnailUrl: imageUrl, path: uploadData.path, error: null };
}

export async function deleteListingImage(imageId: string, storagePath: string) {
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  const { error: dbError } = await supabase
    .from('listing_images')
    .delete()
    .eq('id', imageId);

  const combinedError = storageError?.message || dbError?.message;
  if (combinedError) {
    return { error: { message: combinedError } };
  }

  return { error: null };
}

export async function deleteListingImagesByPath(paths: string[]) {
  if (paths.length === 0) return { error: null };

  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(paths);

  if (storageError) {
    return { error: { message: storageError.message } };
  }

  return { error: null };
}

export async function setPrimaryImage(imageId: string, listingId: string) {
  await supabase
    .from('listing_images')
    .update({ is_primary: false })
    .eq('listing_id', listingId);

  const { error } = await supabase
    .from('listing_images')
    .update({ is_primary: true })
    .eq('id', imageId);

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function reorderImages(images: { id: string; sort_order: number }[]) {
  for (const img of images) {
    const { error } = await supabase
      .from('listing_images')
      .update({ sort_order: img.sort_order })
      .eq('id', img.id);

    if (error) {
      return { error: { message: error.message } };
    }
  }

  return { error: null };
}

export async function getListingImages(listingId: string) {
  const { data, error } = await supabase
    .from('listing_images')
    .select('*')
    .eq('listing_id', listingId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return { images: [], error: { message: error.message } };
  }

  return { images: data || [], error: null };
}

export async function cleanupListingStorage(listingId: string) {
  const { data: images, error: fetchError } = await supabase
    .from('listing_images')
    .select('storage_path')
    .eq('listing_id', listingId);

  if (fetchError || !images || images.length === 0) {
    return { error: fetchError ? { message: fetchError.message } : null };
  }

  const paths = images.map(img => img.storage_path).filter(Boolean) as string[];
  await deleteListingImagesByPath(paths);

  const { error: deleteError } = await supabase
    .from('listing_images')
    .delete()
    .eq('listing_id', listingId);

  if (deleteError) {
    return { error: { message: deleteError.message } };
  }

  return { error: null };
}

export function getPublicUrl(path: string) {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  return data.publicUrl;
}
