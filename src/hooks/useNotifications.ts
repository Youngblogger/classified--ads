'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useNotifications(page: number = 1) {
  const { data, error, isLoading, mutate } = useSWR(
    `notifications?page=${page}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 15000,
      refreshInterval: 30000,
      errorRetryCount: 2,
    }
  );

  return {
    notifications: data?.data || [],
    meta: data?.meta || null,
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useUnreadCount() {
  const { data, error, mutate } = useSWR(
    'notifications/unread-count',
    () => api.get('/notifications/unread-count').then(res => res.data.count),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      refreshInterval: 30000,
      errorRetryCount: 2,
    }
  );

  return {
    unreadCount: data || 0,
    isError: !!error,
    mutate,
  };
}

export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR(
    'messages/conversations',
    () => api.get('/messages/conversations').then(res => res.data?.data || res.data || []),
    {
      revalidateOnFocus: false,
      dedupingInterval: 15000,
      refreshInterval: 30000,
      errorRetryCount: 2,
    }
  );

  return {
    conversations: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useConversationMessages(conversationId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    conversationId ? `messages/${conversationId}` : null,
    () => api.get(`/messages/${conversationId}`).then(res => res.data?.data || res.data || []),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      refreshInterval: 10000,
      errorRetryCount: 2,
    }
  );

  return {
    messages: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
