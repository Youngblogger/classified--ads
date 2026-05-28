'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeMessagingOptions {
  userId?: number | null;
  conversationId?: string | null;
  onNewMessage?: (message: any) => void;
  onMessageRead?: (data: { messageId: number; conversationId: number }) => void;
  onUserTyping?: (data: { conversationId: string; userId: number }) => void;
  onNotification?: (notification: any) => void;
}

const channels = new Map<string, { channel: RealtimeChannel; subscribed: boolean }>();

function getOrCreateChannel(key: string): RealtimeChannel {
  const existing = channels.get(key);
  if (existing) return existing.channel;

  const channel = supabase.channel(key);
  channels.set(key, { channel, subscribed: false });
  return channel;
}

function markSubscribed(key: string) {
  const entry = channels.get(key);
  if (entry) entry.subscribed = true;
}

function isSubscribed(key: string): boolean {
  return channels.get(key)?.subscribed ?? false;
}

export function useRealtimeMessaging({
  userId,
  conversationId,
  onNewMessage,
  onMessageRead,
  onUserTyping,
  onNotification,
}: UseRealtimeMessagingOptions) {
  const [onlineUsers] = useState<number[]>([]);
  const callbacksRef = useRef({ onNewMessage, onMessageRead, onUserTyping, onNotification });
  callbacksRef.current = { onNewMessage, onMessageRead, onUserTyping, onNotification };

  // Subscribe to conversation messages
  useEffect(() => {
    if (!conversationId) return;

    const channelKey = `conversation:${conversationId}`;

    if (isSubscribed(channelKey)) return;

    const channel = getOrCreateChannel(channelKey);
    channel
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const message = payload.new as any;
          callbacksRef.current.onNewMessage?.(message);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const message = payload.new as any;
          callbacksRef.current.onMessageRead?.({
            messageId: message.id,
            conversationId: message.conversation_id,
          });
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        callbacksRef.current.onUserTyping?.(payload.payload as any);
      })
      .subscribe();

    markSubscribed(channelKey);

    return () => {
      const entry = channels.get(channelKey);
      if (entry) {
        supabase.removeChannel(entry.channel);
        channels.delete(channelKey);
      }
    };
  }, [conversationId]);

  // Subscribe to notifications
  useEffect(() => {
    if (!userId) return;

    const channelKey = `notifications:${userId}`;

    if (isSubscribed(channelKey)) return;

    const channel = getOrCreateChannel(channelKey);
    channel
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          callbacksRef.current.onNotification?.(payload.new);
        }
      )
      .subscribe();

    markSubscribed(channelKey);

    return () => {
      const entry = channels.get(channelKey);
      if (entry) {
        supabase.removeChannel(entry.channel);
        channels.delete(channelKey);
      }
    };
  }, [userId]);

  const sendTyping = useCallback((data: { conversationId: string; userId: number }) => {
    const key = `conversation:${data.conversationId}`;
    let channel = getOrCreateChannel(key);
    if (!isSubscribed(key)) {
      channel.subscribe();
      markSubscribed(key);
    }
    channel.send({ type: 'broadcast', event: 'typing', payload: data });
  }, []);

  const stopTyping = useCallback((data: { conversationId: string; userId: number }) => {
    const key = `conversation:${data.conversationId}`;
    let channel = getOrCreateChannel(key);
    if (!isSubscribed(key)) {
      channel.subscribe();
      markSubscribed(key);
    }
    channel.send({ type: 'broadcast', event: 'stop_typing', payload: data });
  }, []);

  const markRead = useCallback((_data: { conversationId: string; messageId: number }) => {
    // Mark as read via API — handled in the calling component
  }, []);

  // Cleanup all channels on unmount
  useEffect(() => {
    return () => {
      channels.forEach((entry, key) => {
        supabase.removeChannel(entry.channel);
      });
      channels.clear();
    };
  }, []);

  return {
    isConnected: true,
    onlineUsers,
    isUserOnline: useCallback((_userId: number) => false, []),
    socketError: null,
    reconnecting: false,
    reconnectAttempt: 0,
    sendTyping,
    stopTyping,
    markRead,
  };
}
