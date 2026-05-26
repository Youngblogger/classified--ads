'use client';

import { supabase } from './supabase';

const VERIFICATION_BUCKET = 'verification-documents';
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

export async function submitVerificationRequest(data: {
  user_id: string;
  verification_type: string;
  document_front?: File;
  document_back?: File;
  selfie?: File;
  business_document?: File;
}) {
  const uploadFile = async (file: File, prefix: string) => {
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, PDF');
    }
    if (file.size > MAX_DOC_SIZE) {
      throw new Error('File too large. Maximum size: 10MB');
    }
    const ext = file.name.split('.').pop();
    const path = `verifications/${data.user_id}/${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(VERIFICATION_BUCKET)
      .upload(path, file);
    if (error) throw error;
    return path; // Store path, generate signed URL only when viewed
  };

  try {
    let frontPath: string | null = null;
    let backPath: string | null = null;
    let selfiePath: string | null = null;
    let businessDocPath: string | null = null;

    if (data.document_front) {
      frontPath = await uploadFile(data.document_front, 'front');
    }
    if (data.document_back) {
      backPath = await uploadFile(data.document_back, 'back');
    }
    if (data.selfie) {
      selfiePath = await uploadFile(data.selfie, 'selfie');
    }
    if (data.business_document) {
      businessDocPath = await uploadFile(data.business_document, 'business');
    }

    const { data: result, error } = await supabase
      .from('verification_requests')
      .insert({
        user_id: data.user_id,
        verification_type: data.verification_type,
        status: 'pending',
        document_front_url: frontPath,
        document_back_url: backPath,
        selfie_url: selfiePath,
        business_document_url: businessDocPath,
      })
      .select()
      .single();

    if (error) {
      return { request: null, error: { message: error.message } };
    }

    return { request: result, error: null };
  } catch (err: any) {
    return { request: null, error: { message: err.message || 'Upload failed' } };
  }
}

export async function getVerificationDocumentUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .createSignedUrl(storagePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function getVerificationDocumentUrls(request: {
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  business_document_url: string | null;
}): Promise<{
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  business_document_url: string | null;
}> {
  const [front, back, selfie, business] = await Promise.all([
    request.document_front_url ? getVerificationDocumentUrl(request.document_front_url) : null,
    request.document_back_url ? getVerificationDocumentUrl(request.document_back_url) : null,
    request.selfie_url ? getVerificationDocumentUrl(request.selfie_url) : null,
    request.business_document_url ? getVerificationDocumentUrl(request.business_document_url) : null,
  ]);
  return {
    document_front_url: front,
    document_back_url: back,
    selfie_url: selfie,
    business_document_url: business,
  };
}

export async function getVerificationRequests(userId: string) {
  const { data, error } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { requests: [], error: { message: error.message } };
  }

  return { requests: data || [], error: null };
}

export async function getLatestVerificationRequest(userId: string) {
  const { data, error } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { request: null, error: { message: error.message } };
  }

  return { request: data || null, error: null };
}

export async function updateProfileVerificationStatus(
  userId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
) {
  const updates: any = { verification_status: status };
  if (status === 'approved') {
    updates.is_verified = true;
  }
  if (status === 'rejected' && rejectionReason) {
    updates.verification_status = 'rejected';
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function adminGetAllVerificationRequests(params?: {
  status?: string;
  page?: number;
  perPage?: number;
}) {
  const page = params?.page || 1;
  const perPage = params?.perPage || 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('verification_requests')
    .select('*, user:profiles(id, full_name, username, email, avatar_url)', { count: 'exact' });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { requests: [], total: 0, error: { message: error.message } };
  }

  return { requests: data || [], total: count || 0, error: null };
}

export async function adminReviewVerificationRequest(
  requestId: string,
  status: 'approved' | 'rejected',
  adminUserId: string,
  rejectionReason?: string
) {
  const { data: request, error: fetchError } = await supabase
    .from('verification_requests')
    .select('user_id')
    .eq('id', requestId)
    .single();

  if (fetchError) {
    return { error: { message: fetchError.message } };
  }

  const { error: updateError } = await supabase
    .from('verification_requests')
    .update({
      status,
      reviewed_by: adminUserId,
      rejection_reason: rejectionReason || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateError) {
    return { error: { message: updateError.message } };
  }

  await updateProfileVerificationStatus(request.user_id, status, rejectionReason);

  return { error: null };
}
