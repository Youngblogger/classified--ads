-- ==============================================================
-- iList Marketplace - Seed Data (Subcategories + Sample Listings)
-- Run this in Supabase Dashboard SQL Editor
-- Uses actual UUIDs from your existing database
-- ==============================================================

-- ================================
-- SUBCATEGORIES
-- ================================
INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('d42cadec-46aa-4e25-91d9-e722e8351aa2', 'Mobile Phones', 'mobile-phones', 1),
  ('d42cadec-46aa-4e25-91d9-e722e8351aa2', 'Laptops', 'laptops', 2),
  ('d42cadec-46aa-4e25-91d9-e722e8351aa2', 'TVs & Home Theater', 'tvs-home-theater', 3),
  ('d42cadec-46aa-4e25-91d9-e722e8351aa2', 'Cameras & Photography', 'cameras', 4),
  ('d42cadec-46aa-4e25-91d9-e722e8351aa2', 'Gaming Consoles', 'gaming', 5),
  ('d42cadec-46aa-4e25-91d9-e722e8351aa2', 'Phone Accessories', 'phone-accessories', 6)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('d5e0d0a6-0485-4de4-96a4-d5b0ceb524be', 'Cars', 'cars', 1),
  ('d5e0d0a6-0485-4de4-96a4-d5b0ceb524be', 'Motorcycles', 'motorcycles', 2),
  ('d5e0d0a6-0485-4de4-96a4-d5b0ceb524be', 'Trucks & Trailers', 'trucks-trailers', 3),
  ('d5e0d0a6-0485-4de4-96a4-d5b0ceb524be', 'Auto Parts & Accessories', 'auto-parts', 4)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('69a20341-40f4-4e89-8c7d-e0281c9e4528', 'Apartments for Rent', 'apartments-rent', 1),
  ('69a20341-40f4-4e89-8c7d-e0281c9e4528', 'Houses for Sale', 'houses-sale', 2),
  ('69a20341-40f4-4e89-8c7d-e0281c9e4528', 'Land & Plots', 'land-plots', 3),
  ('69a20341-40f4-4e89-8c7d-e0281c9e4528', 'Commercial Property', 'commercial-property', 4)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('1454df7f-0974-4ae8-85dc-4aeb6bfb1bc3', 'Men''s Fashion', 'mens-fashion', 1),
  ('1454df7f-0974-4ae8-85dc-4aeb6bfb1bc3', 'Women''s Fashion', 'womens-fashion', 2),
  ('1454df7f-0974-4ae8-85dc-4aeb6bfb1bc3', 'Shoes', 'shoes', 3),
  ('1454df7f-0974-4ae8-85dc-4aeb6bfb1bc3', 'Bags & Accessories', 'bags-accessories', 4),
  ('1454df7f-0974-4ae8-85dc-4aeb6bfb1bc3', 'Jewelry & Watches', 'jewelry-watches', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('e6272dc8-183e-41e3-ae35-0807a4d1fe4c', 'Furniture', 'furniture', 1),
  ('e6272dc8-183e-41e3-ae35-0807a4d1fe4c', 'Home Appliances', 'home-appliances', 2),
  ('e6272dc8-183e-41e3-ae35-0807a4d1fe4c', 'Decor & Accessories', 'decor-accessories', 3),
  ('e6272dc8-183e-41e3-ae35-0807a4d1fe4c', 'Kitchen & Dining', 'kitchen-dining', 4),
  ('e6272dc8-183e-41e3-ae35-0807a4d1fe4c', 'Garden & Outdoor', 'garden-outdoor', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('11ba04d8-038e-455e-a4c4-4a491351df5f', 'Gym & Fitness', 'gym-fitness', 1),
  ('11ba04d8-038e-455e-a4c4-4a491351df5f', 'Outdoor Sports', 'outdoor-sports', 2),
  ('11ba04d8-038e-455e-a4c4-4a491351df5f', 'Team Sports', 'team-sports', 3),
  ('11ba04d8-038e-455e-a4c4-4a491351df5f', 'Cycling', 'cycling', 4),
  ('11ba04d8-038e-455e-a4c4-4a491351df5f', 'Water Sports', 'water-sports', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('4b05effd-cc27-414e-9657-df3be1d829b5', 'Skincare', 'skincare', 1),
  ('4b05effd-cc27-414e-9657-df3be1d829b5', 'Hair Care', 'hair-care', 2),
  ('4b05effd-cc27-414e-9657-df3be1d829b5', 'Makeup', 'makeup', 3),
  ('4b05effd-cc27-414e-9657-df3be1d829b5', 'Fragrances', 'fragrances', 4),
  ('4b05effd-cc27-414e-9657-df3be1d829b5', 'Wellness Products', 'wellness-products', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('31ad63fa-7225-4b8f-b70b-414a1af93544', 'Books', 'books', 1),
  ('31ad63fa-7225-4b8f-b70b-414a1af93544', 'Magazines', 'magazines', 2),
  ('31ad63fa-7225-4b8f-b70b-414a1af93544', 'Music & CDs', 'music-cds', 3),
  ('31ad63fa-7225-4b8f-b70b-414a1af93544', 'Movies & DVDs', 'movies-dvds', 4),
  ('31ad63fa-7225-4b8f-b70b-414a1af93544', 'Video Games', 'video-games', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('7d82db30-2b1c-47b8-954a-fc58cd92848f', 'Home Services', 'home-services', 1),
  ('7d82db30-2b1c-47b8-954a-fc58cd92848f', 'IT & Tech Support', 'it-tech-support', 2),
  ('7d82db30-2b1c-47b8-954a-fc58cd92848f', 'Tutoring & Education', 'tutoring-education', 3),
  ('7d82db30-2b1c-47b8-954a-fc58cd92848f', 'Photography & Video', 'photography-video', 4),
  ('7d82db30-2b1c-47b8-954a-fc58cd92848f', 'Event Planning', 'event-planning', 5),
  ('7d82db30-2b1c-47b8-954a-fc58cd92848f', 'Repair & Maintenance', 'repair-maintenance', 6)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('f5a5bd44-92aa-416a-97a1-1cfdd965402d', 'Software & IT', 'software-it', 1),
  ('f5a5bd44-92aa-416a-97a1-1cfdd965402d', 'Sales & Marketing', 'sales-marketing', 2),
  ('f5a5bd44-92aa-416a-97a1-1cfdd965402d', 'Customer Service', 'customer-service', 3),
  ('f5a5bd44-92aa-416a-97a1-1cfdd965402d', 'Administrative', 'administrative', 4),
  ('f5a5bd44-92aa-416a-97a1-1cfdd965402d', 'Healthcare', 'healthcare', 5),
  ('f5a5bd44-92aa-416a-97a1-1cfdd965402d', 'Education', 'education-jobs', 6)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('3f4cf32e-fd58-4f7b-a093-feb11e5f7086', 'Dogs', 'dogs', 1),
  ('3f4cf32e-fd58-4f7b-a093-feb11e5f7086', 'Cats', 'cats', 2),
  ('3f4cf32e-fd58-4f7b-a093-feb11e5f7086', 'Birds', 'birds', 3),
  ('3f4cf32e-fd58-4f7b-a093-feb11e5f7086', 'Fish & Aquariums', 'fish-aquariums', 4),
  ('3f4cf32e-fd58-4f7b-a093-feb11e5f7086', 'Pet Supplies', 'pet-supplies', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('5d10a427-7685-4e3a-bdf5-bed53a97cfa1', 'Restaurants', 'restaurants', 1),
  ('5d10a427-7685-4e3a-bdf5-bed53a97cfa1', 'Catering Services', 'catering', 2),
  ('5d10a427-7685-4e3a-bdf5-bed53a97cfa1', 'Beverages', 'beverages', 3),
  ('5d10a427-7685-4e3a-bdf5-bed53a97cfa1', 'Snacks & Confectionery', 'snacks-confectionery', 4),
  ('5d10a427-7685-4e3a-bdf5-bed53a97cfa1', 'Organic & Health Foods', 'organic-health-foods', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('22b9897c-5022-4ce6-9fc0-bd552a9b6f0c', 'Online Courses', 'online-courses', 1),
  ('22b9897c-5022-4ce6-9fc0-bd552a9b6f0c', 'Language Classes', 'language-classes', 2),
  ('22b9897c-5022-4ce6-9fc0-bd552a9b6f0c', 'Test Prep', 'test-prep', 3),
  ('22b9897c-5022-4ce6-9fc0-bd552a9b6f0c', 'Music Lessons', 'music-lessons', 4),
  ('22b9897c-5022-4ce6-9fc0-bd552a9b6f0c', 'Vocational Training', 'vocational-training', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('1fb2cd83-60aa-4ad9-b4f4-2140e5a4e127', 'Farm Equipment', 'farm-equipment', 1),
  ('1fb2cd83-60aa-4ad9-b4f4-2140e5a4e127', 'Livestock', 'livestock', 2),
  ('1fb2cd83-60aa-4ad9-b4f4-2140e5a4e127', 'Crops & Seeds', 'crops-seeds', 3),
  ('1fb2cd83-60aa-4ad9-b4f4-2140e5a4e127', 'Poultry', 'poultry', 4),
  ('1fb2cd83-60aa-4ad9-b4f4-2140e5a4e127', 'Fertilizers & Chemicals', 'fertilizers-chemicals', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ('dcc5c394-acbd-4c74-9e4a-c3bf67014524', 'Office Equipment', 'office-equipment', 1),
  ('dcc5c394-acbd-4c74-9e4a-c3bf67014524', 'Industrial Machinery', 'industrial-machinery', 2),
  ('dcc5c394-acbd-4c74-9e4a-c3bf67014524', 'Construction', 'construction', 3),
  ('dcc5c394-acbd-4c74-9e4a-c3bf67014524', 'Wholesale & Bulk', 'wholesale-bulk', 4),
  ('dcc5c394-acbd-4c74-9e4a-c3bf67014524', 'Packaging & Supplies', 'packaging-supplies', 5)
ON CONFLICT (category_id, slug) DO NOTHING;

-- ================================
-- SAMPLE LISTINGS
-- Uses the existing user profile as the seller
-- ================================
DO $$
DECLARE
  v_user_id UUID := '9128e8ea-ea1c-4bed-96e0-f7858e127c0d';
  v_elec_id UUID := 'd42cadec-46aa-4e25-91d9-e722e8351aa2';
  v_veh_id  UUID := 'd5e0d0a6-0485-4de4-96a4-d5b0ceb524be';
  v_prop_id UUID := '69a20341-40f4-4e89-8c7d-e0281c9e4528';
  v_fash_id UUID := '1454df7f-0974-4ae8-85dc-4aeb6bfb1bc3';
  v_home_id UUID := 'e6272dc8-183e-41e3-ae35-0807a4d1fe4c';
  v_sport_id UUID := '11ba04d8-038e-455e-a4c4-4a491351df5f';
  v_health_id UUID := '4b05effd-cc27-414e-9657-df3be1d829b5';
  v_book_id UUID := '31ad63fa-7225-4b8f-b70b-414a1af93544';
  v_svc_id  UUID := '7d82db30-2b1c-47b8-954a-fc58cd92848f';
  v_job_id  UUID := 'f5a5bd44-92aa-416a-97a1-1cfdd965402d';
  v_pet_id  UUID := '3f4cf32e-fd58-4f7b-a093-feb11e5f7086';
  v_food_id UUID := '5d10a427-7685-4e3a-bdf5-bed53a97cfa1';
  v_edu_id  UUID := '22b9897c-5022-4ce6-9fc0-bd552a9b6f0c';
  v_agri_id UUID := '1fb2cd83-60aa-4ad9-b4f4-2140e5a4e127';
  v_biz_id  UUID := 'dcc5c394-acbd-4c74-9e4a-c3bf67014524';

  -- Subcategory IDs (fetched dynamically)
  v_mobile_ph_sub UUID; v_laptops_sub UUID; v_cars_sub UUID; v_apart_rent_sub UUID;
  v_mens_fash_sub UUID; v_furniture_sub UUID; v_gym_sub UUID; v_skincare_sub UUID;
  v_books_sub UUID; v_home_svc_sub UUID; v_software_it_sub UUID; v_dogs_sub UUID;
  v_restaurants_sub UUID; v_online_courses_sub UUID; v_farm_eq_sub UUID; v_office_eq_sub UUID;
BEGIN
  -- Get subcategory IDs
  SELECT id INTO v_mobile_ph_sub FROM subcategories WHERE slug = 'mobile-phones' LIMIT 1;
  SELECT id INTO v_laptops_sub FROM subcategories WHERE slug = 'laptops' LIMIT 1;
  SELECT id INTO v_cars_sub FROM subcategories WHERE slug = 'cars' LIMIT 1;
  SELECT id INTO v_apart_rent_sub FROM subcategories WHERE slug = 'apartments-rent' LIMIT 1;
  SELECT id INTO v_mens_fash_sub FROM subcategories WHERE slug = 'mens-fashion' LIMIT 1;
  SELECT id INTO v_furniture_sub FROM subcategories WHERE slug = 'furniture' LIMIT 1;
  SELECT id INTO v_gym_sub FROM subcategories WHERE slug = 'gym-fitness' LIMIT 1;
  SELECT id INTO v_skincare_sub FROM subcategories WHERE slug = 'skincare' LIMIT 1;
  SELECT id INTO v_books_sub FROM subcategories WHERE slug = 'books' LIMIT 1;
  SELECT id INTO v_home_svc_sub FROM subcategories WHERE slug = 'home-services' LIMIT 1;
  SELECT id INTO v_software_it_sub FROM subcategories WHERE slug = 'software-it' LIMIT 1;
  SELECT id INTO v_dogs_sub FROM subcategories WHERE slug = 'dogs' LIMIT 1;
  SELECT id INTO v_restaurants_sub FROM subcategories WHERE slug = 'restaurants' LIMIT 1;
  SELECT id INTO v_online_courses_sub FROM subcategories WHERE slug = 'online-courses' LIMIT 1;
  SELECT id INTO v_farm_eq_sub FROM subcategories WHERE slug = 'farm-equipment' LIMIT 1;
  SELECT id INTO v_office_eq_sub FROM subcategories WHERE slug = 'office-equipment' LIMIT 1;

  -- Regular listings (active)
  INSERT INTO listings (user_id, category_id, subcategory_id, title, slug, description, price, currency, condition, status, state, lga, city, location, negotiable) VALUES
  (v_user_id, v_elec_id, v_mobile_ph_sub, 'iPhone 15 Pro Max 256GB - Like New', 'iphone-15-pro-max-256gb', 'Barely used iPhone 15 Pro Max in excellent condition. Space Black color. Comes with original box and charger.', 850000, 'NGN', 'used', 'active', 'Lagos', 'Ikeja', 'Ikeja', 'Lagos', true),
  (v_user_id, v_elec_id, v_laptops_sub, 'MacBook Pro M3 14-inch 2024', 'macbook-pro-m3-14-2024', 'Brand new MacBook Pro M3. 16GB RAM, 512GB SSD. Space Gray. Sealed box.', 1800000, 'NGN', 'new', 'active', 'Lagos', 'Victoria Island', 'Victoria Island', 'Lagos', false),
  (v_user_id, v_elec_id, v_laptops_sub, 'Dell XPS 15 OLED Laptop', 'dell-xps-15-oled', 'Premium Dell XPS 15 with 4K OLED display. Intel i7, 16GB RAM, 512GB SSD.', 650000, 'NGN', 'used', 'active', 'Abuja', 'Wuse', 'Wuse', 'Abuja', true),
  (v_user_id, v_veh_id, v_cars_sub, 'Toyota Camry 2020 LE', 'toyota-camry-2020-le', 'Well maintained Toyota Camry 2020 LE. One owner. Full service history. Clean title.', 8500000, 'NGN', 'used', 'active', 'Lagos', 'Lekki', 'Lekki', 'Lagos', true),
  (v_user_id, v_veh_id, v_cars_sub, 'Honda Civic 2022 Sport', 'honda-civic-2022-sport', 'Honda Civic 2022 Sport trim. Low mileage (15,000km). Excellent condition.', 12500000, 'NGN', 'used', 'active', 'Lagos', 'Ikeja', 'Ikeja', 'Lagos', true),
  (v_user_id, v_prop_id, v_apart_rent_sub, '2-Bedroom Flat in Lekki Phase 1', '2-bed-flat-lekki-phase1', 'Spacious 2-bedroom flat in a secure estate. 24/7 security, backup power, swimming pool.', 3500000, 'NGN', 'used', 'active', 'Lagos', 'Lekki', 'Lekki', 'Lagos', true),
  (v_user_id, v_prop_id, v_apart_rent_sub, 'Studio Apartment in Yaba', 'studio-apartment-yaba', 'Cozy studio apartment in the heart of Yaba. Close to major tech hubs and universities.', 850000, 'NGN', 'used', 'active', 'Lagos', 'Yaba', 'Yaba', 'Lagos', false),
  (v_user_id, v_fash_id, v_mens_fash_sub, 'Designer Suit - Giorgio Armani', 'designer-suit-giorgio-armani', 'Premium Armani suit, navy blue. Worn once. Size 42R. Includes jacket and trousers.', 350000, 'NGN', 'used', 'active', 'Lagos', 'Victoria Island', 'Victoria Island', 'Lagos', true),
  (v_user_id, v_fash_id, v_mens_fash_sub, 'Nike Air Jordan 1 Retro High - New', 'nike-air-jordan-1-retro-high', 'Authentic Jordan 1 Retro High. Chicago colorway. Size 10 US. Never worn.', 180000, 'NGN', 'new', 'active', 'Lagos', 'Ikeja', 'Ikeja', 'Lagos', false),
  (v_user_id, v_home_id, v_furniture_sub, 'Modern L-Shaped Sofa Set', 'modern-l-shaped-sofa-set', 'Beautiful L-shaped sofa in gray fabric. 6-seater with chaise lounge. Like new condition.', 450000, 'NGN', 'used', 'active', 'Abuja', 'Maitama', 'Maitama', 'Abuja', true),
  (v_user_id, v_home_id, v_furniture_sub, 'Queen Size Bed Frame with Storage', 'queen-size-bed-frame-storage', 'Solid wood queen bed frame with built-in storage drawers. No mattress included.', 280000, 'NGN', 'used', 'active', 'Lagos', 'Surulere', 'Surulere', 'Lagos', true),
  (v_user_id, v_sport_id, v_gym_sub, 'Adjustable Dumbbell Set 5-25kg', 'adjustable-dumbbell-set-5-25kg', 'Professional adjustable dumbbell set. Replaces 20 pairs of dumbbells. Space saving.', 195000, 'NGN', 'new', 'active', 'Lagos', 'Lekki', 'Lekki', 'Lagos', false),
  (v_user_id, v_health_id, v_skincare_sub, 'Premium Skincare Bundle', 'premium-skincare-bundle', 'Curated skincare bundle with cleanser, toner, serum, and moisturizer. Suitable for all skin types.', 35000, 'NGN', 'new', 'active', 'Lagos', 'Ikeja', 'Ikeja', 'Lagos', false),
  (v_user_id, v_book_id, v_books_sub, 'Rich Dad Poor Dad - Robert Kiyosaki', 'rich-dad-poor-dad', 'Bestselling personal finance book. Like new condition.', 3500, 'NGN', 'used', 'active', 'Lagos', 'Yaba', 'Yaba', 'Lagos', true),
  (v_user_id, v_svc_id, v_home_svc_sub, 'Professional Home Cleaning Service', 'professional-home-cleaning-service', 'Thorough home cleaning service. 3-bedroom flat cleaning. Eco-friendly products used.', 25000, 'NGN', 'new', 'active', 'Lagos', 'Ikeja', 'Ikeja', 'Lagos', true),
  (v_user_id, v_job_id, v_software_it_sub, 'Senior React Developer Needed', 'senior-react-developer-needed', 'Looking for an experienced React developer for a 6-month contract. Remote work available.', 600000, 'NGN', 'new', 'active', 'Lagos', 'Victoria Island', 'Victoria Island', 'Lagos', true),
  (v_user_id, v_svc_id, v_software_it_sub, 'Website Development Package', 'website-development-package', 'Professional website development. Includes 5 pages, mobile responsive, SEO optimized.', 150000, 'NGN', 'new', 'active', 'Lagos', 'Lekki', 'Lekki', 'Lagos', true),
  (v_user_id, v_pet_id, v_dogs_sub, 'German Shepherd Puppies for Sale', 'german-shepherd-puppies', 'AKC registered German Shepherd puppies. Vaccinated and dewormed. 8 weeks old.', 250000, 'NGN', 'new', 'active', 'Abuja', 'Wuse', 'Wuse', 'Abuja', true),
  (v_user_id, v_food_id, v_restaurants_sub, 'Small Chops Catering Service', 'small-chops-catering-service', 'Professional small chops catering for events. Spring rolls, samosas, chicken wings, and more.', 50000, 'NGN', 'new', 'active', 'Lagos', 'Surulere', 'Surulere', 'Lagos', true),
  (v_user_id, v_edu_id, v_online_courses_sub, 'Full Stack Web Dev Bootcamp', 'full-stack-web-dev-bootcamp', '12-week intensive full stack web development bootcamp. Learn React, Node.js, PostgreSQL.', 350000, 'NGN', 'new', 'active', 'Online', 'Online', 'Lagos', 'Nigeria', true)
  ON CONFLICT (slug) DO NOTHING;

  -- Featured listings (is_featured = true)
  INSERT INTO listings (user_id, category_id, subcategory_id, title, slug, description, price, currency, condition, status, is_featured, state, lga, city, location) VALUES
  (v_user_id, v_elec_id, v_laptops_sub, 'MacBook Air M3 15-inch - Featured', 'macbook-air-m3-15-featured', 'Brand new MacBook Air M3 15-inch. 24GB RAM, 512GB SSD. Midnight color. Featured listing.', 1450000, 'NGN', 'new', 'active', true, 'Lagos', 'Victoria Island', 'Victoria Island', 'Lagos'),
  (v_user_id, v_veh_id, v_cars_sub, 'Mercedes-Benz C300 2023 - Featured', 'mercedes-benz-c300-2023-featured', '2023 Mercedes-Benz C300 AMG Line. 10,000km. Panoramic roof. Premium package. Featured.', 35000000, 'NGN', 'used', 'active', true, 'Lagos', 'Lekki', 'Lekki', 'Lagos'),
  (v_user_id, v_prop_id, v_apart_rent_sub, '4-Bedroom Duplex in Banana Island - Featured', '4-bed-duplex-banana-island-featured', 'Luxury 4-bedroom duplex in Banana Island. Smart home features. 24/7 security. Featured.', 15000000, 'NGN', 'used', 'active', true, 'Lagos', 'Banana Island', 'Banana Island', 'Lagos')
  ON CONFLICT (slug) DO NOTHING;

  -- Boosted listings (is_boosted = true with boost metadata)
  INSERT INTO listings (user_id, category_id, subcategory_id, title, slug, description, price, currency, condition, status, is_boosted, boost_type, boost_plan, boost_status, boost_expires_at, boost_priority_score, state, lga, city, location) VALUES
  (v_user_id, v_elec_id, v_mobile_ph_sub, 'Samsung Galaxy S24 Ultra - Boosted', 'samsung-galaxy-s24-ultra-boosted', 'Premium Samsung Galaxy S24 Ultra. 512GB storage. Titanium Gray. Boosted for top visibility.', 1150000, 'NGN', 'new', 'active', true, 'platinum', 'Platinum Boost', 'active', NOW() + INTERVAL '7 days', 2, 'Lagos', 'Ikeja', 'Ikeja', 'Lagos'),
  (v_user_id, v_fash_id, v_mens_fash_sub, 'Rolex Submariner Date 2024 - Boosted', 'rolex-submariner-date-2024-boosted', 'Genuine Rolex Submariner Date 2024. Full set with box and papers. Boosted.', 4500000, 'NGN', 'new', 'active', true, 'diamond', 'Diamond VIP', 'active', NOW() + INTERVAL '14 days', 3, 'Lagos', 'Victoria Island', 'Victoria Island', 'Lagos')
  ON CONFLICT (slug) DO NOTHING;

  -- Verify what we inserted
  RAISE NOTICE 'Seed complete. Total listings: %', (SELECT COUNT(*) FROM listings);
  RAISE NOTICE 'Active listings: %', (SELECT COUNT(*) FROM listings WHERE status = 'active');
  RAISE NOTICE 'Featured listings: %', (SELECT COUNT(*) FROM listings WHERE is_featured = true);
  RAISE NOTICE 'Boosted listings: %', (SELECT COUNT(*) FROM listings WHERE is_boosted = true);
END $$;

-- Also insert into boosted_listings table for the boosted ads
INSERT INTO boosted_listings (listing_id, user_id, plan_id, boost_type, status, start_date, end_date, payment_amount, payment_status)
SELECT l.id, l.user_id, bp.id, l.boost_type::boost_plan_type, 'active', NOW(), l.boost_expires_at, bp.price, 'completed'
FROM listings l
JOIN boost_plans bp ON bp.type = l.boost_type::boost_plan_type
WHERE l.is_boosted = true
  AND l.boost_status = 'active'
  AND NOT EXISTS (SELECT 1 FROM boosted_listings bl WHERE bl.listing_id = l.id)
ON CONFLICT DO NOTHING;

-- ================================
-- VERIFICATION QUERIES
-- ================================
-- Run these to confirm seed succeeded:
-- SELECT COUNT(*) AS subcategory_count FROM subcategories;
-- SELECT COUNT(*) AS listing_count FROM listings;
-- SELECT COUNT(*) AS active_listings FROM listings WHERE status = 'active';
-- SELECT COUNT(*) AS boosted_count FROM listings WHERE is_boosted = true;
-- SELECT COUNT(*) AS featured_count FROM listings WHERE is_featured = true;
