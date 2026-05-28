'use client';

import { supabase } from './supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Message, Conversation, Notification } from '@/types/supabase';

type MessageCallback = (message: Message) => void;
type ConversationCallback = (conversation: Conversation) => void;
type NotificationCallback = (notification: Notification) => void;
type TypingCallback = (data: { conversation_id: string; user_id: string; stopped?: boolean }) => void;
type StatusCallback = (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT') => void;

interface SubscriptionMeta {
  channel: RealtimeChannel;
  refCount: number;
  status: string;
}

const registry = new Map<string, SubscriptionMeta>();
const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

function getChannel(key: string): { channel: RealtimeChannel; meta: SubscriptionMeta } {
  const existing = registry.get(key);
  if (existing) {
    existing.refCount++;
    return { channel: existing.channel, meta: existing };
  }
  const channel = supabase.channel(key);
  const meta: SubscriptionMeta = { channel, refCount: 1, status: 'initialized' };
  registry.set(key, meta);
  return { channel, meta };
}

function releaseChannel(key: string) {
  const entry = registry.get(key);
  if (!entry) return;
  entry.refCount--;
  if (entry.refCount <= 0) {
    supabase.removeChannel(entry.channel);
    registry.delete(key);
  }
}

function subscribeWithRetry(
  channel: RealtimeChannel,
  onStatus?: StatusCallback,
  attempt = 0
) {
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      onStatus?.('SUBSCRIBED');
    } else if (status === 'CHANNEL_ERROR' && attempt < MAX_RETRIES) {
      setTimeout(() => {
        subscribeWithRetry(channel, onStatus, attempt + 1);
      }, RETRY_DELAY * (attempt + 1));
    } else {
      onStatus?.(status);
    }
  });
}

export function subscribeToConversation(
  conversationId: string,
  callbacks: {
    onNewMessage?: MessageCallback;
    onMessageUpdate?: (message: Message) => void;
    onTyping?: TypingCallback;
    onStopTyping?: TypingCallback;
    onStatus?: StatusCallback;
  }
): RealtimeChannel {
  const key = `conversation:${conversationId}`;
  const { channel, meta } = getChannel(key);

  if (meta.status === 'initialized') {
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          callbacks.onNewMessage?.(payload.new as Message);
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
        (payload: RealtimePostgresChangesPayload<Message>) => {
          callbacks.onMessageUpdate?.(payload.new as Message);
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        callbacks.onTyping?.(payload.payload as TypingData);
      })
      .on('broadcast', { event: 'stop_typing' }, (payload) => {
        callbacks.onStopTyping?.(payload.payload as TypingData);
      });

    subscribeWithRetry(channel, callbacks.onStatus);
    meta.status = 'subscribing';
  }

  return channel;
}

interface TypingData {
  conversation_id: string;
  user_id: string;
}

export function sendTypingIndicator(conversationId: string, userId: string) {
  const key = `conversation:${conversationId}`;
  const entry = registry.get(key);
  const channel = entry?.channel || supabase.channel(key);
  if (!entry) {
    registry.set(key, { channel, refCount: 0, status: 'broadcast' });
  }
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { conversation_id: conversationId, user_id: userId },
  });
}

export function sendStopTypingIndicator(conversationId: string, userId: string) {
  const key = `conversation:${conversationId}`;
  const entry = registry.get(key);
  const channel = entry?.channel || supabase.channel(key);
  if (!entry) {
    registry.set(key, { channel, refCount: 0, status: 'broadcast' });
  }
  channel.send({
    type: 'broadcast',
    event: 'stop_typing',
    payload: { conversation_id: conversationId, user_id: userId },
  });
}

export function subscribeToUserNotifications(
  userId: string,
  onNotification: NotificationCallback,
  onStatus?: StatusCallback
): RealtimeChannel {
  const key = `notifications:${userId}`;
  const { channel, meta } = getChannel(key);

  if (meta.status === 'initialized') {
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          onNotification(payload.new as Notification);
        }
      );

    subscribeWithRetry(channel, onStatus);
    meta.status = 'subscribing';
  }

  return channel;
}

export function subscribeToUserConversations(
  userId: string,
  onNewConversation: ConversationCallback,
  onConversationUpdate: ConversationCallback,
  onStatus?: StatusCallback
): RealtimeChannel {
  const key = `conversations:${userId}`;
  const { channel, meta } = getChannel(key);

  if (meta.status === 'initialized') {
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations', filter: `buyer_id=eq.${userId}` },
        (payload: RealtimePostgresChangesPayload<Conversation>) => {
          onNewConversation(payload.new as Conversation);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations', filter: `seller_id=eq.${userId}` },
        (payload: RealtimePostgresChangesPayload<Conversation>) => {
          onNewConversation(payload.new as Conversation);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `buyer_id=eq.${userId}` },
        (payload: RealtimePostgresChangesPayload<Conversation>) => {
          onConversationUpdate(payload.new as Conversation);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `seller_id=eq.${userId}` },
        (payload: RealtimePostgresChangesPayload<Conversation>) => {
          onConversationUpdate(payload.new as Conversation);
        }
      );

    subscribeWithRetry(channel, onStatus);
    meta.status = 'subscribing';
  }

  return channel;
}

export function subscribeToListingUpdates(
  listingId: string,
  onUpdate: (listing: any) => void,
  onStatus?: StatusCallback
): RealtimeChannel {
  const key = `listing:${listingId}`;
  const { channel, meta } = getChannel(key);

  if (meta.status === 'initialized') {
    channel
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'listings', filter: `id=eq.${listingId}` },
        (payload: RealtimePostgresChangesPayload<any>) => {
          onUpdate(payload.new);
        }
      );

    subscribeWithRetry(channel, onStatus);
    meta.status = 'subscribing';
  }

  return channel;
}

export function unsubscribeChannel(channel: RealtimeChannel) {
  for (const [key, entry] of Array.from(registry.entries())) {
    if (entry.channel === channel) {
      entry.refCount = 0;
      supabase.removeChannel(channel);
      registry.delete(key);
      break;
    }
  }
}

export function subscribeToTableChanges(
  table: string,
  filter?: string,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void,
  onStatus?: StatusCallback
): RealtimeChannel {
  const key = `table:${table}${filter ? `:${filter}` : ''}`;
  const { channel, meta } = getChannel(key);

  if (meta.status === 'initialized') {
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table, filter }, (payload) => {
        onInsert?.(payload.new);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter }, (payload) => {
        onUpdate?.(payload.new);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table, filter }, (payload) => {
        onDelete?.(payload.old);
      });

    subscribeWithRetry(channel, onStatus);
    meta.status = 'subscribing';
  }

  return channel;
}

export function cleanupAllChannels() {
  registry.forEach((entry) => {
    supabase.removeChannel(entry.channel);
  });
  registry.clear();
}
