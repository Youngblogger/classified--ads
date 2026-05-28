'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeMessagingOptions {
  userId?: number | string | null;
  conversationId?: string | null;
  onNewMessage?: (message: any) => void;
  onMessageRead?: (data: { messageId: number | string; conversationId: number | string }) => void;
  onUserTyping?: (data: { conversationId: string; userId: number | string }) => void;
  onNotification?: (notification: any) => void;
}

const channelRegistry = new Map<string, { channel: RealtimeChannel; refCount: number }>();

function acquireChannel(key: string): RealtimeChannel {
  const existing = channelRegistry.get(key);
  if (existing) {
    existing.refCount++;
    return existing.channel;
  }
  const channel = supabase.channel(key);
  channelRegistry.set(key, { channel, refCount: 1 });
  return channel;
}

function releaseChannel(key: string) {
  const entry = channelRegistry.get(key);
  if (!entry) return;
  entry.refCount--;
  if (entry.refCount <= 0) {
    supabase.removeChannel(entry.channel);
    channelRegistry.delete(key);
  }
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
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const callbacksRef = useRef({ onNewMessage, onMessageRead, onUserTyping, onNotification });
  callbacksRef.current = { onNewMessage, onMessageRead, onUserTyping, onNotification };
  const cleanupRef = useRef<(() => void)[]>([]);

  // Subscribe to conversation messages
  useEffect(() => {
    if (!conversationId) return;

    const key = `conversation:${conversationId}`;
    let subscribed = false;

    const setup = async () => {
      const channel = acquireChannel(key);

      if (!subscribed) {
        channel
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
            (payload: RealtimePostgresChangesPayload<any>) => {
              callbacksRef.current.onNewMessage?.(payload.new);
            }
          )
          .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
            (payload: RealtimePostgresChangesPayload<any>) => {
              const msg = payload.new;
              callbacksRef.current.onMessageRead?.({
                messageId: msg.id,
                conversationId: msg.conversation_id,
              });
            }
          )
          .on('broadcast', { event: 'typing' }, (payload) => {
            callbacksRef.current.onUserTyping?.(payload.payload as any);
          })
          .on('broadcast', { event: 'stop_typing' }, (payload) => {
            callbacksRef.current.onUserTyping?.({ ...(payload.payload as any), stopped: true });
          });

        channel.subscribe((subStatus) => {
          setStatus(subStatus === 'SUBSCRIBED' ? 'connected' : 'connecting');
        });
        subscribed = true;
      }
    };

    setup();

    cleanupRef.current.push(() => {
      releaseChannel(key);
    });

    return () => {
      releaseChannel(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Subscribe to notifications
  useEffect(() => {
    if (!userId) return;

    const key = `notifications:${userId}`;

    const channel = acquireChannel(key);
    channel
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload: RealtimePostgresChangesPayload<any>) => {
          callbacksRef.current.onNotification?.(payload.new);
        }
      )
      .subscribe();

    cleanupRef.current.push(() => {
      releaseChannel(key);
    });

    return () => {
      releaseChannel(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Cleanup all channels on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
    };
  }, []);

  const sendTyping = useCallback((data: { conversationId: string; userId: number | string }) => {
    if (!data.conversationId) return;
    const key = `conversation:${data.conversationId}`;
    const channel = acquireChannel(key);
    channel.send({ type: 'broadcast', event: 'typing', payload: data });
    releaseChannel(key);
  }, []);

  const stopTyping = useCallback((data: { conversationId: string; userId: number | string }) => {
    if (!data.conversationId) return;
    const key = `conversation:${data.conversationId}`;
    const channel = acquireChannel(key);
    channel.send({ type: 'broadcast', event: 'stop_typing', payload: data });
    releaseChannel(key);
  }, []);

  const markRead = useCallback((_data: { conversationId: string; messageId: number | string }) => {
    // Mark as read via API
  }, []);

  return {
    isConnected: status === 'connected',
    onlineUsers,
    isUserOnline: useCallback((_userId: number | string) => false, []),
    socketError: null,
    reconnecting: false,
    reconnectAttempt: 0,
    sendTyping,
    stopTyping,
    markRead,
  };
}

export function cleanupAllChannels() {
  channelRegistry.forEach((entry, key) => {
    supabase.removeChannel(entry.channel);
  });
  channelRegistry.clear();
}
