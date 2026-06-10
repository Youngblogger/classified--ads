-- ============================================================
-- SEED: Fix category/subcategory hierarchy and add missing data
-- ============================================================

-- 1. Remove rogue parent-level slugs from subcategories table
--    These collide with parent category namespace and cause FK violations
DELETE FROM subcategories WHERE slug IN ('mobile-phones');

-- 2. Add missing parent categories
INSERT INTO categories (name, slug, icon, sort_order, is_active) VALUES
  ('Mobile Phones & Tablets', 'mobile-phones', 'Smartphone', 16, true),
  ('Baby & Kids', 'baby-kids', 'Baby', 17, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert subcategories under proper parent categories
DO $$
DECLARE
  vehicles_id UUID;
  property_id UUID;
  mobile_phones_id UUID;
  electronics_id UUID;
  fashion_id UUID;
  home_garden_id UUID;
  jobs_id UUID;
  services_id UUID;
  pets_id UUID;
  health_beauty_id UUID;
  baby_kids_id UUID;
  sports_fitness_id UUID;
  books_media_id UUID;
  food_drinks_id UUID;
  agriculture_id UUID;
BEGIN
  SELECT id INTO vehicles_id FROM categories WHERE slug = 'vehicles';
  SELECT id INTO property_id FROM categories WHERE slug = 'property';
  SELECT id INTO mobile_phones_id FROM categories WHERE slug = 'mobile-phones';
  SELECT id INTO electronics_id FROM categories WHERE slug = 'electronics';
  SELECT id INTO fashion_id FROM categories WHERE slug = 'fashion';
  SELECT id INTO home_garden_id FROM categories WHERE slug = 'home-garden';
  SELECT id INTO jobs_id FROM categories WHERE slug = 'jobs';
  SELECT id INTO services_id FROM categories WHERE slug = 'services';
  SELECT id INTO pets_id FROM categories WHERE slug = 'pets';
  SELECT id INTO health_beauty_id FROM categories WHERE slug = 'health-beauty';
  SELECT id INTO baby_kids_id FROM categories WHERE slug = 'baby-kids';
  SELECT id INTO sports_fitness_id FROM categories WHERE slug = 'sports-fitness';
  SELECT id INTO books_media_id FROM categories WHERE slug = 'books-media';
  SELECT id INTO food_drinks_id FROM categories WHERE slug = 'food-drinks';
  SELECT id INTO agriculture_id FROM categories WHERE slug = 'agriculture';

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (vehicles_id, 'cars', 'Cars', 1, true),
    (vehicles_id, 'motorcycles', 'Motorcycles', 2, true),
    (vehicles_id, 'buses-vans', 'Buses & Vans', 3, true),
    (vehicles_id, 'trucks-trailers', 'Trucks & Trailers', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (property_id, 'apartments-rent', 'Apartments for Rent', 1, true),
    (property_id, 'apartments-sale', 'Apartments for Sale', 2, true),
    (property_id, 'houses-rent', 'Houses for Rent', 3, true),
    (property_id, 'houses-sale', 'Houses for Sale', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (mobile_phones_id, 'smartphones', 'Smartphones', 1, true),
    (mobile_phones_id, 'tablets', 'Tablets', 2, true),
    (mobile_phones_id, 'smartwatches', 'Smartwatches', 3, true),
    (mobile_phones_id, 'phone-accessories', 'Phone Accessories', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (electronics_id, 'laptops', 'Laptops', 1, true),
    (electronics_id, 'desktops', 'Desktop Computers', 2, true),
    (electronics_id, 'tvs', 'Televisions', 3, true),
    (electronics_id, 'gaming', 'Gaming Consoles', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (fashion_id, 'men-clothing', 'Men''s Clothing', 1, true),
    (fashion_id, 'women-clothing', 'Women''s Clothing', 2, true),
    (fashion_id, 'shoes', 'Shoes', 3, true),
    (fashion_id, 'watches', 'Watches', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (home_garden_id, 'furniture', 'Furniture', 1, true),
    (home_garden_id, 'home-decor', 'Home Decor', 2, true),
    (home_garden_id, 'kitchen-appliances', 'Kitchen Appliances', 3, true),
    (home_garden_id, 'bedding', 'Bedding', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (jobs_id, 'full-time-jobs', 'Full-time Jobs', 1, true),
    (jobs_id, 'part-time-jobs', 'Part-time Jobs', 2, true),
    (jobs_id, 'remote-jobs', 'Remote Jobs', 3, true),
    (jobs_id, 'internship-jobs', 'Internships', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (services_id, 'cleaning-services', 'Cleaning Services', 1, true),
    (services_id, 'repair-services', 'Repair & Maintenance', 2, true),
    (services_id, 'moving-services', 'Moving & Logistics', 3, true),
    (services_id, 'event-planning', 'Event Services', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (pets_id, 'dogs', 'Dogs', 1, true),
    (pets_id, 'cats', 'Cats', 2, true),
    (pets_id, 'birds', 'Birds', 3, true),
    (pets_id, 'pet-food', 'Pet Food', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (health_beauty_id, 'skincare', 'Skincare', 1, true),
    (health_beauty_id, 'haircare', 'Haircare', 2, true),
    (health_beauty_id, 'makeup', 'Makeup', 3, true),
    (health_beauty_id, 'fragrances', 'Fragrances', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (baby_kids_id, 'baby-gear', 'Baby Gear', 1, true),
    (baby_kids_id, 'kids-clothing', 'Kids Clothing', 2, true),
    (baby_kids_id, 'kids-toys', 'Toys & Games', 3, true),
    (baby_kids_id, 'maternity', 'Maternity', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (sports_fitness_id, 'fitness-gym', 'Fitness & Gym', 1, true),
    (sports_fitness_id, 'camping-hiking', 'Camping & Hiking', 2, true),
    (sports_fitness_id, 'cycling', 'Cycling', 3, true),
    (sports_fitness_id, 'team-sports', 'Team Sports', 4, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (books_media_id, 'books', 'Books', 1, true),
    (books_media_id, 'music', 'Music', 2, true),
    (books_media_id, 'movies-tv', 'Movies & TV', 3, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (food_drinks_id, 'groceries', 'Groceries', 1, true),
    (food_drinks_id, 'beverages', 'Beverages', 2, true),
    (food_drinks_id, 'snacks', 'Snacks', 3, true)
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO subcategories (category_id, slug, name, sort_order, is_active) VALUES
    (agriculture_id, 'farm-equipment', 'Farm Equipment', 1, true),
    (agriculture_id, 'livestock', 'Livestock', 2, true),
    (agriculture_id, 'crops-seeds', 'Crops & Seeds', 3, true)
  ON CONFLICT (category_id, slug) DO NOTHING;
END $$;
