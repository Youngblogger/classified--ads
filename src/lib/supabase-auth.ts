'use client';

import { supabase } from './supabase';
import type { Profile } from '@/types/supabase';

export type AuthError = {
  message: string;
  code?: string;
};

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
      },
      emailRedirectTo: `${window.location.origin}/auth/verify-email`,
    },
  });

  if (error) {
    return { data: null, error: { message: error.message, code: error.status?.toString() } };
  }

  return { data, error: null };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error: { message: error.message, code: error.status?.toString() } };
  }

  return { data, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: { message: error.message } };
  }
  return { error: null };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return { session: null, error: { message: error.message } };
  }
  return { session: data.session, error: null };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { user: null, error: { message: error.message } };
  }
  return { user: data.user, error: null };
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

export async function getProfile(userId: string): Promise<{ profile: Profile | null; error: AuthError | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { profile: null, error: { message: error.message } };
  }

  return { profile: data as Profile, error: null };
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: { message: error.message } };
  }

  return { profile: data as Profile, error: null };
}

export async function createProfile(profile: {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: profile.id,
      full_name: profile.full_name || null,
      email: profile.email || null,
      avatar_url: profile.avatar_url || null,
    })
    .select()
    .single();

  if (error) {
    return { profile: null, error: { message: error.message } };
  }

  return { profile: data as Profile, error: null };
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const filePath = `avatars/${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('listing-images')
    .upload(filePath, file);

  if (uploadError) {
    return { url: null, error: { message: uploadError.message } };
  }

  const { data } = supabase.storage
    .from('listing-images')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (updateError) {
    return { url: null, error: { message: updateError.message } };
  }

  return { url: data.publicUrl, error: null };
}

export async function sendVerificationEmail() {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: '',
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}
