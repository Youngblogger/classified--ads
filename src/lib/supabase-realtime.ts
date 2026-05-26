'use client';

import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Message, Conversation, Notification } from '@/types/supabase';

type MessageCallback = (message: Message) => void;
type ConversationCallback = (conversation: Conversation) => void;
type NotificationCallback = (notification: Notification) => void;
type TypingCallback = (data: { conversation_id: string; user_id: string }) => void;

const typingChannels = new Map<string, RealtimeChannel>();

export function subscribeToConversation(
  conversationId: string,
  callbacks: {
    onNewMessage?: MessageCallback;
    onMessageUpdate?: (message: Message) => void;
    onTyping?: TypingCallback;
    onStopTyping?: TypingCallback;
  }
): RealtimeChannel {
  const channel = supabase.channel(`conversation:${conversationId}`);

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const message = payload.new as Message;
        callbacks.onNewMessage?.(message);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const message = payload.new as Message;
        callbacks.onMessageUpdate?.(message);
      }
    )
    .on('broadcast', { event: 'typing' }, (payload) => {
      callbacks.onTyping?.(payload.payload as TypingData);
    })
    .on('broadcast', { event: 'stop_typing' }, (payload) => {
      callbacks.onStopTyping?.(payload.payload as TypingData);
    })
    .subscribe();

  return channel;
}

interface TypingData {
  conversation_id: string;
  user_id: string;
}

function getTypingChannel(conversationId: string): RealtimeChannel {
  const existing = typingChannels.get(conversationId);
  if (existing) return existing;
  const channel = supabase.channel(`conversation:${conversationId}`);
  channel.subscribe();
  typingChannels.set(conversationId, channel);
  return channel;
}

export function sendTypingIndicator(conversationId: string, userId: string) {
  const channel = getTypingChannel(conversationId);
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { conversation_id: conversationId, user_id: userId },
  });
}

export function sendStopTypingIndicator(conversationId: string, userId: string) {
  const channel = getTypingChannel(conversationId);
  channel.send({
    type: 'broadcast',
    event: 'stop_typing',
    payload: { conversation_id: conversationId, user_id: userId },
  });
}

export function subscribeToUserNotifications(
  userId: string,
  onNotification: NotificationCallback
): RealtimeChannel {
  const channel = supabase.channel(`notifications:${userId}`);

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const notification = payload.new as Notification;
        onNotification(notification);
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToUserConversations(
  userId: string,
  onNewConversation: ConversationCallback,
  onConversationUpdate: ConversationCallback
): RealtimeChannel {
  const channel = supabase.channel(`conversations:${userId}`);

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `buyer_id=eq.${userId}`,
      },
      (payload) => {
        onNewConversation(payload.new as Conversation);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `seller_id=eq.${userId}`,
      },
      (payload) => {
        onNewConversation(payload.new as Conversation);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `buyer_id=eq.${userId}`,
      },
      (payload) => {
        onConversationUpdate(payload.new as Conversation);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `seller_id=eq.${userId}`,
      },
      (payload) => {
        onConversationUpdate(payload.new as Conversation);
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToListingUpdates(
  listingId: string,
  onUpdate: (listing: any) => void
): RealtimeChannel {
  const channel = supabase.channel(`listing:${listingId}`);

  channel
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'listings',
        filter: `id=eq.${listingId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeChannel(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
  typingChannels.forEach((value, key) => {
    if (value === channel) typingChannels.delete(key);
  });
}

export function subscribeToTableChanges(
  table: string,
  filter?: string,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
): RealtimeChannel {
  const channelConfig: any = {
    event: '*',
    schema: 'public',
    table,
  };

  if (filter) {
    channelConfig.filter = filter;
  }

  const channel = supabase.channel(`table:${table}`);

  channel
    .on('postgres_changes', { ...channelConfig, event: 'INSERT' }, (payload) => {
      onInsert?.(payload.new);
    })
    .on('postgres_changes', { ...channelConfig, event: 'UPDATE' }, (payload) => {
      onUpdate?.(payload.new);
    })
    .on('postgres_changes', { ...channelConfig, event: 'DELETE' }, (payload) => {
      onDelete?.(payload.old);
    })
    .subscribe();

  return channel;
}
