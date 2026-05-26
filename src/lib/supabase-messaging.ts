'use client';

import { supabase } from './supabase';
import type { Message, Conversation } from '@/types/supabase';

const CONVERSATION_SELECT = `
  *,
  listing:listings(id, title, slug, price, images:listing_images(*)),
  buyer:profiles!conversations_buyer_id_fkey(id, full_name, username, avatar_url),
  seller:profiles!conversations_seller_id_fkey(id, full_name, username, avatar_url)
`;

const MESSAGE_SELECT = `
  *,
  sender:profiles(id, full_name, username, avatar_url)
`;

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('last_message_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return { conversations: [], error: { message: error.message } };
  }

  const conversationsWithUnread = await Promise.all(
    (data || []).map(async (conv) => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('is_read', false)
        .neq('sender_id', userId);

      return {
        ...conv,
        unread_count: count || 0,
      };
    })
  );

  return { conversations: conversationsWithUnread, error: null };
}

export async function getMessages(conversationId: string, page = 1, perPage = 50) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return { messages: [], error: { message: error.message } };
  }

  return {
    messages: (data || []).reverse(),
    error: null,
  };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType = 'text',
  attachment?: { url: string; type: string }
) {
  const messageData: any = {
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    message_type: messageType,
  };

  if (attachment) {
    messageData.attachment_url = attachment.url;
    messageData.attachment_type = attachment.type;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) {
    return { message: null, error: { message: error.message } };
  }

  await supabase
    .from('conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content?.substring(0, 100) || '[Attachment]',
    })
    .eq('id', conversationId);

  return { message: data as Message, error: null };
}

export async function startConversation(
  listingId: string,
  buyerId: string,
  sellerId: string,
  initialMessage: string
) {
  const { data: existingConv, error: checkError } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .maybeSingle();

  if (checkError) {
    return { conversation: null, error: { message: checkError.message } };
  }

  if (existingConv) {
    return { conversation: { id: existingConv.id }, error: null, isExisting: true };
  }

  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
    })
    .select()
    .single();

  if (convError) {
    return { conversation: null, error: { message: convError.message } };
  }

  const { message, error: msgError } = await sendMessage(
    conv.id,
    buyerId,
    initialMessage
  );

  if (msgError) {
    return { conversation: null, error: msgError };
  }

  return { conversation: conv, error: null, isExisting: false };
}

export async function markConversationAsRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function getUnreadMessageCount(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if (error || !data || data.length === 0) {
    return { count: 0, error: null };
  }

  const convIds = data.map(c => c.id);

  const { count, error: countError } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', convIds)
    .eq('is_read', false)
    .neq('sender_id', userId);

  if (countError) {
    return { count: 0, error: { message: countError.message } };
  }

  return { count: count || 0, error: null };
}
