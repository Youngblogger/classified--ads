-- iList Marketplace - Seed Data for Local Development
-- Run via: supabase db reset (automatically applied)

-- ============================
-- BOOST PLANS
-- ============================
INSERT INTO boost_plans (name, type, price, duration_days, priority_score, badge_label, badge_icon, color_scheme, features, sort_order) VALUES
  ('Gold Boost', 'gold', 2000, 3, 1, 'Gold', 'zap', '{"gradient": "from-amber-400 via-yellow-300 to-amber-400", "border": "border-amber-300", "text": "text-amber-900", "bg": "bg-gradient-to-r from-amber-50 to-yellow-50"}', '["Appears above normal listings", "Highlighted ad card", "Better search ranking", "Gold badge", "Increased impressions"]', 1),
  ('Platinum Boost', 'platinum', 5000, 7, 2, 'Platinum', 'crown', '{"gradient": "from-slate-400 via-slate-300 to-slate-400", "border": "border-slate-300", "text": "text-slate-900", "bg": "bg-gradient-to-r from-slate-50 to-gray-50"}', '["Homepage exposure", "Priority category placement", "Higher search visibility", "Platinum badge", "More impressions than Gold"]', 2),
  ('Diamond VIP', 'diamond', 10000, 14, 3, 'Diamond', 'diamond', '{"gradient": "from-blue-500 via-blue-400 to-blue-600", "border": "border-blue-300", "text": "text-blue-900", "bg": "bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50"}', '["Top homepage placement", "Always pinned above lower tiers", "Highest search priority", "Diamond animated badge", "Priority in recommended ads", "Extra premium styling"]', 3)
ON CONFLICT DO NOTHING;

-- ============================
-- DEMO CATEGORIES
-- ============================
INSERT INTO categories (name, slug, icon, sort_order, is_active) VALUES
  ('Electronics', 'electronics', 'Laptop', 1, true),
  ('Vehicles', 'vehicles', 'Car', 2, true),
  ('Property', 'property', 'Building', 3, true),
  ('Fashion', 'fashion', 'Shirt', 4, true),
  ('Home & Garden', 'home-garden', 'Home', 5, true),
  ('Sports & Fitness', 'sports-fitness', 'Zap', 6, true),
  ('Health & Beauty', 'health-beauty', 'Heart', 7, true),
  ('Books & Media', 'books-media', 'Book', 8, true),
  ('Services', 'services', 'Briefcase', 9, true),
  ('Jobs', 'jobs', 'UserPlus', 10, true),
  ('Pets', 'pets', 'PawPrint', 11, true),
  ('Food & Drinks', 'food-drinks', 'Coffee', 12, true),
  ('Education', 'education', 'GraduationCap', 13, true),
  ('Agriculture', 'agriculture', 'Sprout', 14, true),
  ('Business & Industrial', 'business-industrial', 'Factory', 15, true)
ON CONFLICT (slug) DO NOTHING;
