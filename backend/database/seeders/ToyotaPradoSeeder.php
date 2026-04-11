<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ToyotaPradoSeeder extends Seeder
{
    public function run(): void
    {
        // Find the cars/vehicles category
        $category = DB::table('categories')->where('slug', 'cars')->first();
        
        if (!$category) {
            $category = DB::table('categories')->where('slug', 'vehicles')->first();
        }
        
        if (!$category) {
            // Try to find any category with car in name
            $category = DB::table('categories')->where('name', 'like', '%Vehicle%')->orWhere('name', 'like', '%Car%')->first();
        }
        
        if (!$category) {
            $this->command->error('No category found for vehicles. Please create one first.');
            return;
        }
        
        // Find a location
        $location = DB::table('locations')->first();
        
        if (!$location) {
            $this->command->error('No location found. Please create one first.');
            return;
        }
        
        // Find a user
        $user = DB::table('users')->first();
        
        if (!$user) {
            $this->command->error('No user found. Please create users first.');
            return;
        }
        
        // Create the Toyota Prado 2025 ad
        $slug = Str::slug('Toyota Prado 2025') . '-' . time();
        
        $adId = DB::table('ads')->insertGetId([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'location_id' => $location->id,
            'lga' => $location->name ?? '',
            'title' => 'Toyota Prado 2025 - Brand New',
            'slug' => $slug,
            'description' => 'Brand new Toyota Prado 2025. Full option with all latest features. Leather seats, sunroof, 360 camera, adaptive cruise control, lane departure warning, and much more. Tokunbo quality at its finest. Come and inspect. Serious buyers only.',
            'short_description' => 'Brand new Toyota Prado 2025 with full option package',
            'price' => 85000000.00,
            'currency' => 'NGN',
            'condition' => 'new',
            'status' => 'active',
            'is_seeded' => true,
            'is_featured' => true,
            'is_verified' => true,
            'views' => 0,
            'phone' => '08012345678',
            'processing_status' => 'completed',
            'verification_status' => 'verified',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Add images for the Toyota Prado
        $images = [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1580273916550-e323be2ed5f6?w=800&h=600&fit=crop',
        ];
        
        foreach ($images as $index => $imageUrl) {
            DB::table('ad_images')->insert([
                'ad_id' => $adId,
                'url' => $imageUrl,
                'original_url' => $imageUrl,
                'is_primary' => ($index === 0),
                'sort_order' => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        $this->command->info('Toyota Prado 2025 ad created successfully with ID: ' . $adId);
    }
}
