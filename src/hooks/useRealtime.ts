'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { mutate as swrMutate } from 'swr';
import { adKeys } from '@/lib/query-keys';
import {
  invalidateListCachesOnly,
  updateAdInSwrCaches,
  removeAdFromSwrCaches,
  updateAdInListCaches,
  removeAdFromListCaches,
  extractAdUpdates,
  invalidateSwrCache,
} from '@/lib/cache-sync';
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type TableName = keyof Database['public']['Tables'];

interface UseRealtimeSubscriptionOptions<T extends Record<string, any> = Record<string, any>> {
  table: TableName;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onAll?: (payload: RealtimePostgresChangesPayload<T>) => void;
  enabled?: boolean;
  onReconnect?: () => void;
}

const activeChannels = new Map<string, RealtimeChannel>();

function markQueriesStale(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adKeys.all, refetchType: 'none' });
  swrMutate(() => true, undefined, false);
}

export function useRealtimeSubscription<T extends Record<string, any> = Record<string, any>>({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onAll,
  enabled = true,
  onReconnect,
}: UseRealtimeSubscriptionOptions<T>) {
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete, onAll });
  callbacksRef.current = { onInsert, onUpdate, onDelete, onAll };
  const channelKey = `${String(table)}${filter ? `?${filter}` : ''}`;
  const hasSubscribed = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (activeChannels.has(channelKey)) return;

    const channel: RealtimeChannel = supabase.channel(channelKey)
      .on('postgres_changes' as any, {
        event,
        schema: 'public',
        table: String(table),
        ...(filter ? { filter } : {}),
      }, (payload: RealtimePostgresChangesPayload<T>) => {
        const { onInsert, onUpdate, onDelete, onAll } = callbacksRef.current;
        switch (payload.eventType) {
          case 'INSERT': onInsert?.(payload); break;
          case 'UPDATE': onUpdate?.(payload); break;
          case 'DELETE': onDelete?.(payload); break;
        }
        onAll?.(payload);
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          if (hasSubscribed.current) {
            onReconnect?.();
          }
          hasSubscribed.current = true;
        }
      });

    activeChannels.set(channelKey, channel);

    return () => {
      hasSubscribed.current = false;
      const entry = activeChannels.get(channelKey);
      if (entry) {
        supabase.removeChannel(entry);
        activeChannels.delete(channelKey);
      }
    };
  }, [channelKey, enabled, event, filter, onReconnect]);
}

// ── Event-driven hooks ──────────────────────────────────────────

function useReconnectStale(queryClient: QueryClient): () => void {
  return useCallback(() => {
    markQueriesStale(queryClient);
  }, [queryClient]);
}

export function useRealtimeAds() {
  const queryClient = useQueryClient();

  const handleInsert = useCallback(() => {
    invalidateListCachesOnly(queryClient);
  }, [queryClient]);

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const row = payload.new as any;
    const adId = Number(row.id);
    const updates = extractAdUpdates(row);
    updateAdInSwrCaches(adId, updates);
    updateAdInListCaches(queryClient, adId, updates);
  }, [queryClient]);

  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const row = payload.old as any;
    const adId = Number(row.id);
    removeAdFromSwrCaches(adId);
    removeAdFromListCaches(queryClient, adId);
  }, [queryClient]);

  useRealtimeSubscription({
    table: 'listings',
    event: '*',
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onReconnect: useReconnectStale(queryClient),
  });
}

export function useRealtimeHomepage() {
  const queryClient = useQueryClient();

  const handleInsert = useCallback(() => {
    invalidateListCachesOnly(queryClient);
  }, [queryClient]);

  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const row = payload.old as any;
    const adId = Number(row.id);
    removeAdFromSwrCaches(adId);
    removeAdFromListCaches(queryClient, adId);
  }, [queryClient]);

  useRealtimeSubscription({
    table: 'listings',
    event: '*',
    onInsert: handleInsert,
    onDelete: handleDelete,
    onReconnect: useReconnectStale(queryClient),
  });
}

interface UseRealtimeNotificationsOptions {
  userId?: string | number | null;
  onNotification?: (notification: any) => void;
}

export function useRealtimeNotifications({ userId, onNotification }: UseRealtimeNotificationsOptions) {
  const callbacksRef = useRef({ onNotification });
  callbacksRef.current = { onNotification };

  const queryClient = useQueryClient();

  useRealtimeSubscription({
    table: 'notifications',
    event: 'INSERT',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onInsert: useCallback((payload: RealtimePostgresChangesPayload<any>) => {
      callbacksRef.current.onNotification?.(payload.new);
    }, []),
    enabled: !!userId,
  });

  useRealtimeSubscription({
    table: 'notifications',
    event: 'UPDATE',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onUpdate: useCallback(() => {
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
      invalidateSwrCache('notifications');
    }, [queryClient]),
    enabled: !!userId,
  });
}

export function cleanupAllRealtimeChannels(): void {
  activeChannels.forEach((channel, key) => {
    supabase.removeChannel(channel);
    activeChannels.delete(key);
  });
}
