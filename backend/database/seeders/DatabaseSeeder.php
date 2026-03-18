<?php

namespace Database\Seeders;

use App\Models\Ad;
use App\Models\AdImage;
use App\Models\Category;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Vehicles', 'slug' => 'vehicles', 'icon' => '🚗'],
            ['name' => 'Electronics', 'slug' => 'electronics', 'icon' => '📱'],
            ['name' => 'Furniture', 'slug' => 'furniture', 'icon' => '🛋️'],
            ['name' => 'Clothing', 'slug' => 'clothing', 'icon' => '👕'],
            ['name' => 'Real Estate', 'slug' => 'real-estate', 'icon' => '🏠'],
            ['name' => 'Jobs', 'slug' => 'jobs', 'icon' => '💼'],
            ['name' => 'Services', 'slug' => 'services', 'icon' => '🔧'],
            ['name' => 'Sports', 'slug' => 'sports', 'icon' => '⚽'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        $locations = [
            ['name' => 'New York', 'slug' => 'new-york'],
            ['name' => 'Los Angeles', 'slug' => 'los-angeles'],
            ['name' => 'Chicago', 'slug' => 'chicago'],
            ['name' => 'Houston', 'slug' => 'houston'],
            ['name' => 'Miami', 'slug' => 'miami'],
        ];

        foreach ($locations as $loc) {
            Location::create($loc);
        }

        $user = User::create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => bcrypt('password'),
        ]);

        $sampleAds = [
            ['title' => 'iPhone 15 Pro Max', 'price' => 999.99, 'category' => 'electronics', 'location' => 'new-york', 'condition' => 'new'],
            ['title' => 'Toyota Camry 2023', 'price' => 28999.99, 'category' => 'vehicles', 'location' => 'los-angeles', 'condition' => 'like_new'],
            ['title' => 'Modern Leather Sofa', 'price' => 599.99, 'category' => 'furniture', 'location' => 'chicago', 'condition' => 'good'],
            ['title' => 'Designer Jacket', 'price' => 149.99, 'category' => 'clothing', 'location' => 'miami', 'condition' => 'new'],
            ['title' => 'Downtown Apartment', 'price' => 2500, 'category' => 'real-estate', 'location' => 'houston', 'condition' => 'good'],
            ['title' => 'Samsung 65" OLED TV', 'price' => 1299.99, 'category' => 'electronics', 'location' => 'new-york', 'condition' => 'new'],
            ['title' => 'Mountain Bike', 'price' => 450.00, 'category' => 'sports', 'location' => 'los-angeles', 'condition' => 'good'],
            ['title' => 'Home Cleaning Service', 'price' => 75.00, 'category' => 'services', 'location' => 'chicago', 'condition' => 'good'],
        ];

        foreach ($sampleAds as $adData) {
            $category = Category::where('slug', $adData['category'])->first();
            $location = Location::where('slug', $adData['location'])->first();

            $ad = Ad::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'location_id' => $location->id,
                'title' => $adData['title'],
                'slug' => Str::slug($adData['title']) . '-' . time() . rand(100, 999),
                'description' => 'This is a great ' . $adData['title'] . ' in excellent condition. Contact for more details.',
                'price' => $adData['price'],
                'currency' => 'USD',
                'condition' => $adData['condition'],
                'status' => 'active',
                'is_featured' => rand(0, 1),
                'is_verified' => true,
                'views' => rand(10, 500),
            ]);

            AdImage::create([
                'ad_id' => $ad->id,
                'url' => 'https://picsum.photos/seed/' . $ad->id . '/400/300',
                'is_primary' => true,
            ]);
        }
    }
}
