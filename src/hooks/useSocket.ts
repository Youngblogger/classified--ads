'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const activeChannels = new Map<string, RealtimeChannel>();

function subscribeTypingIndicator(channel: RealtimeChannel, onUserTyping?: (data: any) => void) {
  channel.on('broadcast', { event: 'typing' }, (payload) => {
    onUserTyping?.(payload.payload);
  });
  channel.on('broadcast', { event: 'stop_typing' }, (payload) => {
    onUserTyping?.({ ...payload.payload, stopped: true });
  });
}

export function useSocket(options: {
  userId?: number | null;
  onNewMessage?: (message: any) => void;
  onMessageRead?: (data: { messageId: number; conversationId: number }) => void;
  onUserTyping?: (data: { conversationId: string; userId: number }) => void;
  onUserOffline?: (data: { conversationId: string; userId: number }) => void;
  onNotification?: (notification: any) => void;
  onPaymentCompleted?: (notification: any) => void;
  onPromotionActivated?: (notification: any) => void;
}) {
  const [isConnected] = useState(true);
  const [onlineUsers] = useState<number[]>([]);
  const [socketError] = useState<string | null>(null);
  const [reconnecting] = useState(false);
  const [reconnectAttempt] = useState(0);
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  const joinConversation = useCallback((conversationId: string) => {
    const key = `conversation:${conversationId}`;
    if (activeChannels.has(key)) return;

    const channel = supabase.channel(key);
    channel
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          callbacksRef.current.onNewMessage?.(payload.new as any);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const msg = payload.new as any;
          callbacksRef.current.onMessageRead?.({ messageId: msg.id, conversationId: msg.conversation_id });
        }
      );

    subscribeTypingIndicator(channel, callbacksRef.current.onUserTyping);
    channel.subscribe();
    activeChannels.set(key, channel);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    const key = `conversation:${conversationId}`;
    const entry = activeChannels.get(key);
    if (entry) {
      supabase.removeChannel(entry);
      activeChannels.delete(key);
    }
  }, []);

  const sendMessage = useCallback((data: { conversationId: string; message: any; receiverId: number | string; senderId: number }) => {
    // Messages are already persisted via API; realtime handles the broadcast
  }, []);

  const sendTyping = useCallback((data: { conversationId: string; userId: number }) => {
    const key = `conversation:${data.conversationId}`;
    let channel = activeChannels.get(key);
    if (!channel) {
      channel = supabase.channel(key);
      channel.subscribe();
      activeChannels.set(key, channel);
    }
    channel.send({ type: 'broadcast', event: 'typing', payload: data });
  }, []);

  const stopTyping = useCallback((data: { conversationId: string; userId: number }) => {
    const key = `conversation:${data.conversationId}`;
    const channel = activeChannels.get(key);
    if (channel) {
      channel.send({ type: 'broadcast', event: 'stop_typing', payload: data });
    }
  }, []);

  const markRead = useCallback((data: { conversationId: string; messageId: number; readerId: number }) => {
    // Handled via API call to markConversationAsRead
  }, []);

  const isUserOnline = useCallback((_userId: number) => false, []);

  const emitNotification = useCallback((_userId: number, _data: any) => {}, []);
  const emitPaymentCompleted = useCallback((_userId: number, _data: any) => {}, []);
  const emitPromotionActivated = useCallback((_userId: number, _data: any) => {}, []);

  useEffect(() => {
    if (!options.userId) return;
    const key = `notifications:${options.userId}`;
    if (activeChannels.has(key)) return;

    const channel = supabase.channel(key);
    channel
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${options.userId}` },
        (payload) => {
          callbacksRef.current.onNotification?.(payload.new);
        }
      )
      .subscribe();
    activeChannels.set(key, channel);

    return () => {
      const entry = activeChannels.get(key);
      if (entry) {
        supabase.removeChannel(entry);
        activeChannels.delete(key);
      }
    };
  }, [options.userId]);

  useEffect(() => {
    return () => {
      activeChannels.forEach((channel, key) => {
        supabase.removeChannel(channel);
      });
      activeChannels.clear();
    };
  }, []);

  return {
    socket: null,
    isConnected,
    onlineUsers,
    socketError,
    reconnecting,
    reconnectAttempt,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    stopTyping,
    markRead,
    isUserOnline,
    emitNotification,
    emitPaymentCompleted,
    emitPromotionActivated,
  };
}
