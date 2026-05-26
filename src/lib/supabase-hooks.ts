'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import * as listingsService from './supabase-listings';
import * as favoritesService from './supabase-favorites';
import * as messagingService from './supabase-messaging';
import * as notificationsService from './supabase-notifications';
import * as boostService from './supabase-boost';
import * as verificationService from './supabase-verification';
import * as reviewsService from './supabase-reviews';
import * as reportsService from './supabase-reports';
import * as categoriesService from './supabase-categories';

export function useSupabaseListings(params: {
  page?: number;
  perPage?: number;
  categoryId?: string;
  search?: string;
  state?: string;
  userId?: string;
  status?: string;
}) {
  const [listings, setListings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await listingsService.getListings(params);
    if (result.error) {
      setError(result.error.message);
    } else {
      setListings(result.listings);
      setTotal(result.total);
    }
    setIsLoading(false);
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { listings, total, isLoading, error, refetch: fetch };
}

export function useSupabaseListing(slug: string) {
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    listingsService.getListingBySlug(slug).then(result => {
      if (result.error) {
        setError(result.error.message);
      } else {
        setListing(result.listing);
      }
      setIsLoading(false);
    });
  }, [slug]);

  return { listing, isLoading, error };
}

export function useSupabaseCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoriesService.getCategories().then(result => {
      if (!result.error) setCategories(result.categories);
      setIsLoading(false);
    });
  }, []);

  return { categories, isLoading };
}

export function useSupabaseFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const result = await favoritesService.getUserFavorites(userId);
    if (!result.error) {
      setFavorites(result.favorites);
      setTotal(result.total);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { favorites, total, isLoading, refetch: fetch };
}

export function useSupabaseBoostPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    boostService.getBoostPlans().then(result => {
      if (!result.error) setPlans(result.plans);
      setIsLoading(false);
    });
  }, []);

  return { plans, isLoading };
}

export function useSupabaseConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const [convResult, unreadResult] = await Promise.all([
      messagingService.getConversations(userId),
      messagingService.getUnreadMessageCount(userId),
    ]);
    if (!convResult.error) setConversations(convResult.conversations);
    if (!unreadResult.error) setUnreadCount(unreadResult.count);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { conversations, unreadCount, isLoading, refetch: fetch };
}

export function useSupabaseNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const [notifResult, unreadResult] = await Promise.all([
      notificationsService.getNotifications(userId),
      notificationsService.getUnreadNotificationCount(userId),
    ]);
    if (!notifResult.error) setNotifications(notifResult.notifications);
    if (!unreadResult.error) setUnreadCount(unreadResult.count);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { notifications, unreadCount, isLoading, refetch: fetch };
}

export function useSupabaseDashboardStats(userId: string | undefined) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    listingsService.getDashboardStats(userId).then(result => {
      if (!result.error) setStats(result.stats);
      setIsLoading(false);
    });
  }, [userId]);

  return { stats, isLoading };
}

export function useSupabaseBoostedListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listingsService.getBoostedListings().then(result => {
      if (!result.error) setListings(result.listings);
      setIsLoading(false);
    });
  }, []);

  return { listings, isLoading };
}

export function useIsFavorited(userId: string | undefined, listingId: string | undefined) {
  const [isFav, setIsFav] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId || !listingId) return;
    setIsLoading(true);
    favoritesService.isFavorited(userId, listingId).then(result => {
      setIsFav(result.isFavorited);
      setIsLoading(false);
    });
  }, [userId, listingId]);

  return { isFavorited: isFav, isLoading };
}

export {
  listingsService,
  favoritesService,
  messagingService,
  notificationsService,
  boostService,
  verificationService,
  reviewsService,
  reportsService,
  categoriesService,
};
