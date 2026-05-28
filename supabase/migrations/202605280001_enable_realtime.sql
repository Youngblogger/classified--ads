-- ============================================================
-- iList Marketplace - Enable Supabase Realtime
-- Run this AFTER the initial schema (migration 001)
-- ============================================================

-- Enable replica identity FULL on tables used for realtime subscriptions
-- This ensures the full row is sent in postgres_changes payloads

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE listings REPLICA IDENTITY FULL;
ALTER TABLE listing_images REPLICA IDENTITY FULL;
ALTER TABLE listing_favorites REPLICA IDENTITY FULL;
ALTER TABLE listing_views REPLICA IDENTITY FULL;
ALTER TABLE reviews REPLICA IDENTITY FULL;
ALTER TABLE transactions REPLICA IDENTITY FULL;
ALTER TABLE verification_requests REPLICA IDENTITY FULL;
ALTER TABLE boost_plans REPLICA IDENTITY FULL;
ALTER TABLE boosted_listings REPLICA IDENTITY FULL;
ALTER TABLE reports REPLICA IDENTITY FULL;
ALTER TABLE audit_logs REPLICA IDENTITY FULL;
ALTER TABLE categories REPLICA IDENTITY FULL;
ALTER TABLE subcategories REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
-- This enables postgres_changes subscriptions for these tables

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY messages;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY listings;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY listing_images;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY listing_favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY listing_views;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY verification_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY boost_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY boosted_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY reports;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY audit_logs;

-- Grant necessary permissions for realtime subscriptions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
