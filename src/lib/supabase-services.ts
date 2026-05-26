// Barrel file for all Supabase services
export { supabase, getSupabaseClient, getServiceRoleClient } from './supabase';
export * as auth from './supabase-auth';
export * as storage from './supabase-storage';
export * as realtime from './supabase-realtime';
export * as listings from './supabase-listings';
export * as favorites from './supabase-favorites';
export * as messaging from './supabase-messaging';
export * as notifications from './supabase-notifications';
export * as boost from './supabase-boost';
export * as verification from './supabase-verification';
export * as reviews from './supabase-reviews';
export * as reports from './supabase-reports';
export * as categories from './supabase-categories';
export * as admin from './supabase-admin';
export * from './supabase-hooks';
