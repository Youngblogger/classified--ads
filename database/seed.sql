-- iList Marketplace - Seed Data
-- Run after 001_initial_schema.sql and 002_functions.sql

-- ============================
-- CATEGORIES
-- ============================
INSERT INTO categories (id, name, slug, icon, image, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Vehicles', 'vehicles', '🚗', NULL, 1),
  ('c0000000-0000-0000-0000-000000000002', 'Property', 'property', '🏠', NULL, 2),
  ('c0000000-0000-0000-0000-000000000003', 'Mobile Phones & Tablets', 'mobile-phones-tablets', '📱', NULL, 3),
  ('c0000000-0000-0000-0000-000000000004', 'Electronics', 'electronics', '💻', NULL, 4),
  ('c0000000-0000-0000-0000-000000000005', 'Fashion', 'fashion', '👗', NULL, 5),
  ('c0000000-0000-0000-0000-000000000006', 'Jobs', 'jobs', '💼', NULL, 6),
  ('c0000000-0000-0000-0000-000000000007', 'Services', 'services', '🔧', NULL, 7),
  ('c0000000-0000-0000-0000-000000000008', 'Home & Garden', 'home-garden', '🏡', NULL, 8),
  ('c0000000-0000-0000-0000-000000000009', 'Sports & Fitness', 'sports-fitness', '⚽', NULL, 9),
  ('c0000000-0000-0000-0000-000000000010', 'Health & Beauty', 'health-beauty', '💄', NULL, 10)
ON CONFLICT (id) DO NOTHING;

-- ============================
-- SUBCATEGORIES
-- ============================
INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Cars', 'cars', 1),
  ('c0000000-0000-0000-0000-000000000001', 'Motorcycles', 'motorcycles', 2),
  ('c0000000-0000-0000-0000-000000000001', 'Trucks & Trailers', 'trucks-trailers', 3),
  ('c0000000-0000-0000-0000-000000000001', 'Auto Parts & Accessories', 'auto-parts', 4),
  ('c0000000-0000-0000-0000-000000000002', 'Apartments for Rent', 'apartments-rent', 1),
  ('c0000000-0000-0000-0000-000000000002', 'Houses for Sale', 'houses-sale', 2),
  ('c0000000-0000-0000-0000-000000000002', 'Land & Plots', 'land-plots', 3),
  ('c0000000-0000-0000-0000-000000000002', 'Commercial Property', 'commercial-property', 4),
  ('c0000000-0000-0000-0000-000000000003', 'Mobile Phones', 'mobile-phones', 1),
  ('c0000000-0000-0000-0000-000000000003', 'Tablets', 'tablets', 2),
  ('c0000000-0000-0000-0000-000000000003', 'Phone Accessories', 'phone-accessories', 3),
  ('c0000000-0000-0000-0000-000000000004', 'Laptops', 'laptops', 1),
  ('c0000000-0000-0000-0000-000000000004', 'TVs & Home Theater', 'tvs-home-theater', 2),
  ('c0000000-0000-0000-0000-000000000004', 'Cameras & Photography', 'cameras', 3),
  ('c0000000-0000-0000-0000-000000000004', 'Gaming Consoles', 'gaming', 4),
  ('c0000000-0000-0000-0000-000000000005', 'Men''s Fashion', 'mens-fashion', 1),
  ('c0000000-0000-0000-0000-000000000005', 'Women''s Fashion', 'womens-fashion', 2),
  ('c0000000-0000-0000-0000-000000000005', 'Shoes', 'shoes', 3),
  ('c0000000-0000-0000-0000-000000000005', 'Bags & Accessories', 'bags-accessories', 4)
ON CONFLICT (category_id, slug) DO NOTHING;
