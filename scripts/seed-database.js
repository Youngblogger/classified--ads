/**
 * iList Marketplace Database Seed Script
 *
 * Seeds subcategories and sample listings into Supabase.
 *
 * Usage:
 *   node scripts/seed-database.js
 *
 * If RLS blocks inserts (expected when run locally), it will print the
 * SQL to run in your Supabase Dashboard SQL Editor instead.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://lqioagvxzqkqoxixcfbf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ZOnCg4KOlFj5d1kEr6IuEg_WBDxKJxM';

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  console.log('\n=== iList Database Seed Script ===\n');

  // Step 1: Check current data
  const { count: catCount, error: catErr } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });
  if (catErr) { console.error('Error fetching categories:', catErr.message); return; }

  const { count: subCount, error: subErr } = await supabase
    .from('subcategories')
    .select('*', { count: 'exact', head: true });

  const { count: listingCount, error: listingErr } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  console.log(`Categories:    ${catCount || 0}`);
  console.log(`Subcategories: ${subCount || 0}`);
  console.log(`Listings:      ${listingCount || 0}`);

  // Step 2: If data exists, skip
  if ((subCount || 0) > 0 && (listingCount || 0) > 0) {
    console.log('\n✓ Data already exists. No seeding needed.\n');
    return;
  }

  // Step 3: Read and display the seed SQL
  const seedSqlPath = path.join(__dirname, '..', 'supabase', 'seed_data.sql');
  const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

  console.log('\n--- Attempting to seed through REST API ---');

  // Get category UUIDs
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order');

  const catMap = {};
  for (const c of categories || []) {
    catMap[c.slug] = c.id;
  }

  // Try inserting subcategories (will likely fail due to RLS)
  let subInserted = 0;
  const subDefs = [
    { slug: 'electronics', subs: ['mobile-phones', 'laptops', 'tvs-home-theater', 'cameras', 'gaming', 'phone-accessories'] },
    { slug: 'vehicles', subs: ['cars', 'motorcycles', 'trucks-trailers', 'auto-parts'] },
    { slug: 'property', subs: ['apartments-rent', 'houses-sale', 'land-plots', 'commercial-property'] },
    { slug: 'fashion', subs: ['mens-fashion', 'womens-fashion', 'shoes', 'bags-accessories', 'jewelry-watches'] },
    { slug: 'home-garden', subs: ['furniture', 'home-appliances', 'decor-accessories', 'kitchen-dining', 'garden-outdoor'] },
    { slug: 'sports-fitness', subs: ['gym-fitness', 'outdoor-sports', 'team-sports', 'cycling', 'water-sports'] },
    { slug: 'health-beauty', subs: ['skincare', 'hair-care', 'makeup', 'fragrances', 'wellness-products'] },
    { slug: 'books-media', subs: ['books', 'magazines', 'music-cds', 'movies-dvds', 'video-games'] },
    { slug: 'services', subs: ['home-services', 'it-tech-support', 'tutoring-education', 'photography-video', 'event-planning', 'repair-maintenance'] },
    { slug: 'jobs', subs: ['software-it', 'sales-marketing', 'customer-service', 'administrative', 'healthcare', 'education-jobs'] },
    { slug: 'pets', subs: ['dogs', 'cats', 'birds', 'fish-aquariums', 'pet-supplies'] },
    { slug: 'food-drinks', subs: ['restaurants', 'catering', 'beverages', 'snacks-confectionery', 'organic-health-foods'] },
    { slug: 'education', subs: ['online-courses', 'language-classes', 'test-prep', 'music-lessons', 'vocational-training'] },
    { slug: 'agriculture', subs: ['farm-equipment', 'livestock', 'crops-seeds', 'poultry', 'fertilizers-chemicals'] },
    { slug: 'business-industrial', subs: ['office-equipment', 'industrial-machinery', 'construction', 'wholesale-bulk', 'packaging-supplies'] },
  ];

  for (const group of subDefs) {
    const catId = catMap[group.slug];
    if (!catId) continue;
    for (let i = 0; i < group.subs.length; i++) {
      const slug = group.subs[i];
      const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const { error } = await supabase
        .from('subcategories')
        .insert({ category_id: catId, name, slug, sort_order: i + 1 })
        .maybeSingle();
      if (error) {
        if (error.code === '42501') {
          // RLS blocked - expected
          console.log('✗ RLS blocked subcategory insert (expected — needs admin auth)');
          return printDashboardInstructions(seedSql);
        }
        // Ignore duplicate key errors
        if (error.code !== '23505') {
          console.log(`  subcategory ${slug}: ${error.message}`);
        }
      } else {
        subInserted++;
      }
    }
  }

  console.log(`✓ Inserted ${subInserted} subcategories via API`);

  // Try inserting listings (will likely fail due to RLS)
  const profileId = '9128e8ea-ea1c-4bed-96e0-f7858e127c0d';
  const listing = {
    user_id: profileId,
    category_id: catMap['electronics'],
    title: 'Test Listing - Please ignore',
    slug: 'test-listing-please-ignore-' + Date.now(),
    description: 'Auto-generated test listing',
    price: 1000,
    currency: 'NGN',
    status: 'active',
    state: 'Lagos',
  };

  const { error: listingErr2 } = await supabase
    .from('listings')
    .insert(listing)
    .maybeSingle();

  if (listingErr2) {
    if (listingErr2.code === '42501') {
      console.log('✗ RLS blocked listing insert (expected — needs auth)');
      return printDashboardInstructions(seedSql);
    }
    console.log(`Listing insert error: ${listingErr2.message}`);
  } else {
    console.log('✓ Listing insert succeeded via API');
  }

  function printDashboardInstructions(sql) {
    console.log('\n========================================================');
    console.log('  MANUAL STEP REQUIRED');
    console.log('========================================================');
    console.log('  RLS policies block inserts from the anon key.');
    console.log('  Run the seed SQL in your Supabase Dashboard:');
    console.log('\n  https://supabase.com/dashboard/project/lqioagvxzqkqoxixcfbf/sql/new');
    console.log('\n  Paste the contents of: supabase/seed_data.sql');
    console.log('\n  Or run this SQL directly:');
    console.log('\n' + sql.split('\n').slice(0, 10).join('\n') + '\n  ...');
    console.log('========================================================\n');
  }
}

main().catch(console.error);
