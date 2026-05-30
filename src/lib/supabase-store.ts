'use client';

import { supabase } from './supabase';
import { useAuthStore } from './store';
import { signInWithEmail, signUpWithEmail, signOut, getCurrentSession, getProfile, createProfile } from './supabase-auth';
import type { User } from '@/types';

function uuidToNumericId(uuid: string): number {
  let hash = 5381;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) + hash) + uuid.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) || 1;
}

function mapSupabaseUserToAppUser(sbUser: any, profile?: any): User {
  const profileName = profile?.review_display_name || profile?.full_name || profile?.username || null;
  return {
    id: uuidToNumericId(sbUser.id),
    name: profileName || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
    review_display_name: profile?.review_display_name || undefined,
    email: sbUser.email || '',
    phone: profile?.phone || '',
    avatar: profile?.avatar_url || sbUser.user_metadata?.avatar_url || '',
    avatar_url: profile?.avatar_url || sbUser.user_metadata?.avatar_url || '',
    created_at: sbUser.created_at || new Date().toISOString(),
    verified: profile?.is_verified || false,
    email_verified_at: sbUser.email_confirmed_at || null,
    role: profile?.role || 'user',
    is_verified_seller: profile?.is_verified || false,
  };
}

export async function supabaseLogin(email: string, password: string) {
  const result = await signInWithEmail(email, password);
  if (result.error || !result.data?.user) {
    return { error: result.error?.message || 'Login failed' };
  }

  const sbUser = result.data.user;
  const { profile } = await getProfile(sbUser.id);

  const appUser = mapSupabaseUserToAppUser(sbUser, profile);
  const token = result.data.session?.access_token || '';

  useAuthStore.getState().login(appUser, token);

  return { user: appUser, error: null };
}

export async function supabaseRegister(email: string, password: string, fullName?: string) {
  const result = await signUpWithEmail(email, password, fullName);
  if (result.error || !result.data?.user) {
    return { error: result.error?.message || 'Registration failed' };
  }

  const sbUser = result.data.user;

  const { profile } = await createProfile({
    id: sbUser.id,
    full_name: fullName || email.split('@')[0],
    email: sbUser.email || '',
  });

  const appUser = mapSupabaseUserToAppUser(sbUser, profile || undefined);
  const token = result.data.session?.access_token || '';

  useAuthStore.getState().login(appUser, token);

  return { user: appUser, error: null };
}

export async function supabaseLogout() {
  await signOut();
  useAuthStore.getState().logout();
}

export async function restoreSupabaseSession() {
  const { session, error } = await getCurrentSession();
  if (error || !session?.user) {
    return false;
  }

  const sbUser = session.user;
  const { profile } = await getProfile(sbUser.id);

  const appUser = mapSupabaseUserToAppUser(sbUser, profile);
  const token = session.access_token;

  useAuthStore.getState().login(appUser, token);
  return true;
}

export function initializeSupabaseAuth() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const sbUser = session.user;
      const { profile } = await getProfile(sbUser.id);
      const appUser = mapSupabaseUserToAppUser(sbUser, profile);
      useAuthStore.getState().login(appUser, session.access_token);
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.getState().logout();
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      const sbUser = session.user;
      const { profile } = await getProfile(sbUser.id);
      const appUser = mapSupabaseUserToAppUser(sbUser, profile);
      useAuthStore.getState().login(appUser, session.access_token);
    } else if (event === 'USER_UPDATED' && session?.user) {
      const { profile } = await getProfile(session.user.id);
      if (profile) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({
            ...currentUser,
            verified: profile.is_verified || false,
            email_verified_at: session.user.email_confirmed_at || currentUser.email_verified_at,
            name: profile.full_name || currentUser.name,
          });
        }
      }
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
