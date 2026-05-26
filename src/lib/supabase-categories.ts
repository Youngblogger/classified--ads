'use client';

import { supabase } from './supabase';

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .eq('is_active', true)
    .is('parent_id', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    return { categories: [], error: { message: error.message } };
  }

  return { categories: data || [], error: null };
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*, listings:listings(count))')
    .eq('slug', slug)
    .single();

  if (error) {
    return { category: null, error: { message: error.message } };
  }

  return { category: data, error: null };
}

export async function getSubcategories(categoryId: string) {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return { subcategories: [], error: { message: error.message } };
  }

  return { subcategories: data || [], error: null };
}

export async function adminGetAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('sort_order', { ascending: true });

  if (error) {
    return { categories: [], error: { message: error.message } };
  }

  return { categories: data || [], error: null };
}

export async function adminCreateCategory(data: {
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
}) {
  const { data: category, error } = await supabase
    .from('categories')
    .insert(data)
    .select()
    .single();

  if (error) {
    return { category: null, error: { message: error.message } };
  }

  return { category, error: null };
}

export async function adminUpdateCategory(id: string, data: {
  name?: string;
  slug?: string;
  icon?: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
}) {
  const { data: category, error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { category: null, error: { message: error.message } };
  }

  return { category, error: null };
}

export async function adminDeleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}
