'use client';

import { supabase } from './supabase';

export async function getNotifications(userId: string, page = 1, perPage = 20) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return { notifications: [], total: 0, error: { message: error.message } };
  }

  return {
    notifications: data || [],
    total: count || 0,
    error: null,
  };
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    return { count: 0, error: { message: error.message } };
  }

  return { count: count || 0, error: null };
}

export async function createNotification(notification: {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) {
    return { notification: null, error: { message: error.message } };
  }

  return { notification: data, error: null };
}

export async function createNewMessageNotification(
  userId: string,
  senderName: string,
  conversationId: string,
  messagePreview: string
) {
  return createNotification({
    user_id: userId,
    type: 'new_message',
    title: 'New Message',
    message: `${senderName}: ${messagePreview}`,
    data: { conversation_id: conversationId, type: 'message' },
  });
}

export async function createListingApprovedNotification(
  userId: string,
  listingTitle: string,
  listingId: string
) {
  return createNotification({
    user_id: userId,
    type: 'listing_approved',
    title: 'Listing Approved',
    message: `Your listing "${listingTitle}" has been approved and is now live.`,
    data: { listing_id: listingId, type: 'listing_approved' },
  });
}

export async function createListingRejectedNotification(
  userId: string,
  listingTitle: string,
  reason: string
) {
  return createNotification({
    user_id: userId,
    type: 'listing_rejected',
    title: 'Listing Rejected',
    message: `Your listing "${listingTitle}" was rejected. Reason: ${reason}`,
    data: { type: 'listing_rejected' },
  });
}

export async function createVerificationNotification(
  userId: string,
  status: 'approved' | 'rejected',
  reason?: string
) {
  const isApproved = status === 'approved';
  return createNotification({
    user_id: userId,
    type: 'verification_' + status,
    title: isApproved ? 'Verification Approved' : 'Verification Rejected',
    message: isApproved
      ? 'Your identity verification has been approved. You can now enjoy verified seller benefits.'
      : `Your verification request was rejected. Reason: ${reason || 'Please resubmit with correct documents.'}`,
    data: { type: 'verification', status },
  });
}

export async function createBoostExpiredNotification(
  userId: string,
  listingTitle: string,
  boostType: string
) {
  return createNotification({
    user_id: userId,
    type: 'boost_expired',
    title: 'Boost Expired',
    message: `Your ${boostType} boost for "${listingTitle}" has expired. Renew to maintain visibility.`,
    data: { type: 'boost_expired' },
  });
}
