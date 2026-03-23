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
        $categoriesWithSubcategories = [
            [
                'name' => 'Vehicles',
                'slug' => 'vehicles',
                'icon' => 'Car',
                'subcategories' => [
                    ['name' => 'Cars', 'slug' => 'cars'],
                    ['name' => 'Motorcycles', 'slug' => 'motorcycles'],
                    ['name' => 'Buses & Vans', 'slug' => 'buses-vans'],
                    ['name' => 'Trucks & Trailers', 'slug' => 'trucks-trailers'],
                    ['name' => 'Tricycles', 'slug' => 'tricycles'],
                    ['name' => 'Vehicle Parts', 'slug' => 'vehicle-parts'],
                    ['name' => 'Vehicle Accessories', 'slug' => 'vehicle-accessories'],
                    ['name' => 'Heavy Equipment', 'slug' => 'heavy-equipment'],
                ]
            ],
            [
                'name' => 'Property',
                'slug' => 'property',
                'icon' => 'Home',
                'subcategories' => [
                    ['name' => 'Apartments for Rent', 'slug' => 'apartments-rent'],
                    ['name' => 'Apartments for Sale', 'slug' => 'apartments-sale'],
                    ['name' => 'Houses for Rent', 'slug' => 'houses-rent'],
                    ['name' => 'Houses for Sale', 'slug' => 'houses-sale'],
                    ['name' => 'Land & Plots', 'slug' => 'land'],
                    ['name' => 'Commercial Property', 'slug' => 'commercial'],
                    ['name' => 'Short Let / Airbnb', 'slug' => 'short-let'],
                    ['name' => 'Event Spaces', 'slug' => 'event-spaces'],
                ]
            ],
            [
                'name' => 'Mobile Phones & Tablets',
                'slug' => 'mobile-phones',
                'icon' => 'Smartphone',
                'subcategories' => [
                    ['name' => 'Smartphones', 'slug' => 'smartphones'],
                    ['name' => 'Feature Phones', 'slug' => 'feature-phones'],
                    ['name' => 'Tablets', 'slug' => 'tablets'],
                    ['name' => 'Smartwatches', 'slug' => 'smartwatches'],
                    ['name' => 'Phone Accessories', 'slug' => 'phone-accessories'],
                    ['name' => 'Power Banks', 'slug' => 'power-banks'],
                    ['name' => 'Chargers', 'slug' => 'chargers'],
                    ['name' => 'Screen Protectors', 'slug' => 'screen-protectors'],
                ]
            ],
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'icon' => 'Monitor',
                'subcategories' => [
                    ['name' => 'Laptops', 'slug' => 'laptops'],
                    ['name' => 'Desktop Computers', 'slug' => 'desktops'],
                    ['name' => 'Televisions', 'slug' => 'tvs'],
                    ['name' => 'Audio & Music Equipment', 'slug' => 'audio'],
                    ['name' => 'Cameras & Photography', 'slug' => 'cameras'],
                    ['name' => 'Gaming Consoles', 'slug' => 'gaming'],
                    ['name' => 'Networking Equipment', 'slug' => 'networking'],
                    ['name' => 'Accessories', 'slug' => 'electronics-accessories'],
                ]
            ],
            [
                'name' => 'Fashion',
                'slug' => 'fashion',
                'icon' => 'Shirt',
                'subcategories' => [
                    ['name' => "Men's Clothing", 'slug' => 'men-clothing'],
                    ['name' => "Women's Clothing", 'slug' => 'women-clothing'],
                    ['name' => 'Shoes', 'slug' => 'shoes'],
                    ['name' => 'Bags', 'slug' => 'bags'],
                    ['name' => 'Watches', 'slug' => 'watches'],
                    ['name' => 'Jewelry', 'slug' => 'jewelry'],
                    ['name' => 'Sunglasses', 'slug' => 'sunglasses'],
                    ['name' => 'Underwear & Sleepwear', 'slug' => 'underwear'],
                ]
            ],
            [
                'name' => 'Home, Furniture & Appliances',
                'slug' => 'home-furniture',
                'icon' => 'Sofa',
                'subcategories' => [
                    ['name' => 'Furniture', 'slug' => 'furniture'],
                    ['name' => 'Home Decor', 'slug' => 'home-decor'],
                    ['name' => 'Kitchen Appliances', 'slug' => 'kitchen-appliances'],
                    ['name' => 'Large Appliances', 'slug' => 'large-appliances'],
                    ['name' => 'Small Appliances', 'slug' => 'small-appliances'],
                    ['name' => 'Bedding', 'slug' => 'bedding'],
                    ['name' => 'Lighting', 'slug' => 'lighting'],
                    ['name' => 'Home Accessories', 'slug' => 'home-accessories'],
                ]
            ],
            [
                'name' => 'Jobs',
                'slug' => 'jobs',
                'icon' => 'Briefcase',
                'subcategories' => [
                    ['name' => 'Full-time Jobs', 'slug' => 'full-time'],
                    ['name' => 'Part-time Jobs', 'slug' => 'part-time'],
                    ['name' => 'Remote Jobs', 'slug' => 'remote'],
                    ['name' => 'Internships', 'slug' => 'internships'],
                    ['name' => 'Contract Jobs', 'slug' => 'contract'],
                    ['name' => 'Graduate Jobs', 'slug' => 'graduate'],
                    ['name' => 'Driver Jobs', 'slug' => 'driver'],
                    ['name' => 'Tech Jobs', 'slug' => 'tech'],
                ]
            ],
            [
                'name' => 'Services',
                'slug' => 'services',
                'icon' => 'Wrench',
                'subcategories' => [
                    ['name' => 'Cleaning Services', 'slug' => 'cleaning'],
                    ['name' => 'Repair & Maintenance', 'slug' => 'repair'],
                    ['name' => 'Moving & Logistics', 'slug' => 'moving'],
                    ['name' => 'Event Services', 'slug' => 'events'],
                    ['name' => 'Digital Services', 'slug' => 'digital'],
                    ['name' => 'Beauty Services', 'slug' => 'beauty-services'],
                    ['name' => 'Automotive Services', 'slug' => 'auto-services'],
                    ['name' => 'Home Services', 'slug' => 'home-services'],
                ]
            ],
            [
                'name' => 'Pets',
                'slug' => 'pets',
                'icon' => 'Dog',
                'subcategories' => [
                    ['name' => 'Dogs', 'slug' => 'dogs'],
                    ['name' => 'Cats', 'slug' => 'cats'],
                    ['name' => 'Birds', 'slug' => 'birds'],
                    ['name' => 'Fish', 'slug' => 'fish'],
                    ['name' => 'Pet Food', 'slug' => 'pet-food'],
                    ['name' => 'Pet Accessories', 'slug' => 'pet-accessories'],
                    ['name' => 'Livestock', 'slug' => 'livestock'],
                    ['name' => 'Veterinary Services', 'slug' => 'vet-services'],
                ]
            ],
            [
                'name' => 'Health & Beauty',
                'slug' => 'health-beauty',
                'icon' => 'Heart',
                'subcategories' => [
                    ['name' => 'Skincare', 'slug' => 'skincare'],
                    ['name' => 'Haircare', 'slug' => 'haircare'],
                    ['name' => 'Makeup', 'slug' => 'makeup'],
                    ['name' => 'Fragrances', 'slug' => 'fragrances'],
                    ['name' => 'Personal Care', 'slug' => 'personal-care'],
                    ['name' => 'Beauty Tools', 'slug' => 'beauty-tools'],
                    ['name' => 'Supplements', 'slug' => 'supplements'],
                    ['name' => 'Medical Supplies', 'slug' => 'medical-supplies'],
                ]
            ],
            [
                'name' => 'Baby & Kids',
                'slug' => 'baby-kids',
                'icon' => 'Baby',
                'subcategories' => [
                    ['name' => 'Baby Clothing', 'slug' => 'baby-clothing'],
                    ['name' => 'Kids Clothing', 'slug' => 'kids-clothing'],
                    ['name' => 'Toys', 'slug' => 'toys'],
                    ['name' => 'Strollers', 'slug' => 'strollers'],
                    ['name' => 'Car Seats', 'slug' => 'car-seats'],
                    ['name' => 'Baby Food', 'slug' => 'baby-food'],
                    ['name' => 'School Supplies', 'slug' => 'school-supplies'],
                    ['name' => 'Maternity', 'slug' => 'maternity'],
                ]
            ],
            [
                'name' => 'Sports & Outdoors',
                'slug' => 'sports',
                'icon' => 'Dumbbell',
                'subcategories' => [
                    ['name' => 'Gym Equipment', 'slug' => 'gym-equipment'],
                    ['name' => 'Fitness Accessories', 'slug' => 'fitness'],
                    ['name' => 'Bicycles', 'slug' => 'bicycles'],
                    ['name' => 'Outdoor Gear', 'slug' => 'outdoor'],
                    ['name' => 'Sportswear', 'slug' => 'sportswear'],
                    ['name' => 'Camping Equipment', 'slug' => 'camping'],
                    ['name' => 'Football Equipment', 'slug' => 'football'],
                    ['name' => 'Water Sports', 'slug' => 'water-sports'],
                ]
            ],
        ];

        foreach ($categoriesWithSubcategories as $catData) {
            $parent = Category::create([
                'name' => $catData['name'],
                'slug' => $catData['slug'],
                'icon' => $catData['icon'],
            ]);

            foreach ($catData['subcategories'] as $subData) {
                Category::create([
                    'name' => $subData['name'],
                    'slug' => $subData['slug'],
                    'icon' => $catData['icon'],
                    'parent_id' => $parent->id,
                ]);
            }
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
            'role' => 'user',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Admin',
            'email' => 'admin@ilist.com',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'status' => 'active',
        ]);
    }
}
