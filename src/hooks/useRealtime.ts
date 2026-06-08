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
import { realtimeLogger } from '@/lib/logger';
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

// ── Realtime dedupe layer ──────────────────────────────────
// Prevents duplicate inserts/updates from realtime + optimistic updates
const seenEventIds = new Set<string>();

function dedupeEvent(eventType: string, rowId: string): boolean {
  if (!rowId || rowId === 'NaN') return false;
  const key = `${eventType}:${rowId}`;
  if (seenEventIds.has(key)) {
    realtimeLogger.warn('Deduplicated duplicate event', { eventType, rowId });
    return false;
  }
  seenEventIds.add(key);
  if (seenEventIds.size > 100) {
    const iterator = seenEventIds.values();
    const first = iterator.next();
    if (first.value) seenEventIds.delete(first.value);
  }
  return true;
}

// Track out-of-order UPDATE before INSERT
const knownAdIds = new Set<string>();

function isKnownAd(rowId: string): boolean {
  if (!rowId || rowId === 'NaN') return false;
  return knownAdIds.has(rowId);
}

function markKnownAd(rowId: string): void {
  if (rowId && rowId !== 'NaN') {
    knownAdIds.add(rowId);
    if (knownAdIds.size > 500) {
      const iterator = knownAdIds.values();
      const first = iterator.next();
      if (first.value) knownAdIds.delete(first.value);
    }
  }
}

function markQueryStale(queryClient?: QueryClient): void {
  if (queryClient) {
    queryClient.invalidateQueries({ queryKey: adKeys.all, refetchType: 'none' });
  }
  swrMutate(() => true, undefined, false);
}

let reconnectCount = 0;

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
          case 'INSERT':
            if (payload.new && (payload.new as any).id) {
              markKnownAd((payload.new as any).id);
              if (dedupeEvent('INSERT', (payload.new as any).id)) {
                onInsert?.(payload);
              }
            }
            break;
          case 'UPDATE':
            if (payload.new && (payload.new as any).id) {
              const rowId = (payload.new as any).id;
              if (!isKnownAd(rowId)) {
                realtimeLogger.warn('UPDATE before INSERT — deferring to refetch', { rowId });
                markQueryStale();
              } else if (dedupeEvent('UPDATE', rowId)) {
                onUpdate?.(payload);
              }
            }
            break;
          case 'DELETE':
            if (payload.old && (payload.old as any).id) {
              knownAdIds.delete((payload.old as any).id);
              if (dedupeEvent('DELETE', (payload.old as any).id)) {
                onDelete?.(payload);
              }
            }
            break;
        }
        onAll?.(payload);
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          if (hasSubscribed.current) {
            reconnectCount++;
            realtimeLogger.info('Channel reconnected', { channelKey, reconnectCount });
            onReconnect?.();
          }
          hasSubscribed.current = true;
        } else if (status === 'CHANNEL_ERROR') {
          realtimeLogger.error('Channel error', { channelKey });
        } else if (status === 'TIMED_OUT') {
          realtimeLogger.warn('Channel timed out', { channelKey });
        } else if (status === 'CLOSED') {
          realtimeLogger.info('Channel closed', { channelKey });
        }
      });

    realtimeLogger.info('Subscribing to channel', { channelKey, event });
    activeChannels.set(channelKey, channel);

    return () => {
      hasSubscribed.current = false;
      const entry = activeChannels.get(channelKey);
      if (entry) {
        supabase.removeChannel(entry);
        activeChannels.delete(channelKey);
        realtimeLogger.info('Unsubscribed from channel', { channelKey });
      }
    };
  }, [channelKey, enabled, event, filter, onReconnect]);
}

// ── Event-driven hooks ──────────────────────────────────────────

function useReconnectStale(queryClient: QueryClient): () => void {
  return useCallback(() => {
    markQueryStale(queryClient);
  }, [queryClient]);
}

export function useRealtimeAds() {
  const queryClient = useQueryClient();

  const handleInsert = useCallback(() => {
    invalidateListCachesOnly(queryClient);
  }, [queryClient]);

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const row = payload.new as any;
    const adId = row.id as string;
    const updates = extractAdUpdates(row);
    if (adId && adId !== 'NaN') {
      updateAdInSwrCaches(adId, updates);
      updateAdInListCaches(queryClient, adId, updates);
    }
  }, [queryClient]);

  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const row = payload.old as any;
    const adId = row.id as string;
    if (adId && adId !== 'NaN') {
      removeAdFromSwrCaches(adId);
      removeAdFromListCaches(queryClient, adId);
    }
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

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const row = payload.new as any;
    const adId = row.id as string;
    const updates = extractAdUpdates(row);
    if (adId && adId !== 'NaN') {
      updateAdInSwrCaches(adId, updates);
      updateAdInListCaches(queryClient, adId, updates);
    }
  }, [queryClient]);

  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const row = payload.old as any;
    const adId = row.id as string;
    if (adId && adId !== 'NaN') {
      removeAdFromSwrCaches(adId);
      removeAdFromListCaches(queryClient, adId);
    }
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
