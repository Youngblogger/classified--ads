<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class MarketplaceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = $this->getCategoryStructure();

        foreach ($categories as $mainData) {
            $subs = $mainData['subcategories'] ?? [];
            $children = $mainData['children'] ?? [];
            unset($mainData['subcategories'], $mainData['children']);

            $main = Category::updateOrCreate(
                ['slug' => $mainData['slug']],
                $mainData
            );

            foreach ($subs as $subData) {
                $childSubs = $subData['children'] ?? [];
                unset($subData['children']);

                $sub = Category::updateOrCreate(
                    ['slug' => $subData['slug']],
                    array_merge($subData, ['parent_id' => $main->id])
                );

                foreach ($childSubs as $childData) {
                    Category::updateOrCreate(
                        ['slug' => $childData['slug']],
                        array_merge($childData, ['parent_id' => $sub->id])
                    );
                }
            }

            foreach ($children as $childData) {
                Category::updateOrCreate(
                    ['slug' => $childData['slug']],
                    array_merge($childData, ['parent_id' => $main->id])
                );
            }

            $this->command->info("Seeded: {$main->name}");
        }
    }

    private function getCategoryStructure(): array
    {
        return [
            // ============================================================
            // 1. VEHICLES
            // ============================================================
            [
                'name' => 'Vehicles',
                'slug' => 'vehicles',
                'icon' => 'Car',
                'description' => 'Cars, motorcycles, trucks, boats, and vehicle parts & accessories',
                'is_active' => true,
                'sort_order' => 0,
                'subcategories' => [
                    ['name' => 'Cars', 'slug' => 'cars', 'icon' => 'Car', 'is_active' => true, 'children' => [
                        ['name' => 'Toyota', 'slug' => 'toyota', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Honda', 'slug' => 'honda', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Lexus', 'slug' => 'lexus', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Mercedes-Benz', 'slug' => 'mercedes-benz', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'BMW', 'slug' => 'bmw', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Hyundai', 'slug' => 'hyundai', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Kia', 'slug' => 'kia', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Nissan', 'slug' => 'nissan', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Ford', 'slug' => 'ford', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Chevrolet', 'slug' => 'chevrolet', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Volkswagen', 'slug' => 'volkswagen', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Audi', 'slug' => 'audi', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Porsche', 'slug' => 'porsche', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Tesla', 'slug' => 'tesla', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Mazda', 'slug' => 'mazda', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Subaru', 'slug' => 'subaru', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Jeep', 'slug' => 'jeep', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Land Rover', 'slug' => 'land-rover', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Peugeot', 'slug' => 'peugeot', 'icon' => 'Car', 'is_active' => true],
                        ['name' => 'Other Brands', 'slug' => 'other-car-brands', 'icon' => 'Car', 'is_active' => true],
                    ]],
                    ['name' => 'SUVs', 'slug' => 'suvs', 'icon' => 'Car', 'is_active' => true],
                    ['name' => 'Sedans', 'slug' => 'sedans', 'icon' => 'Car', 'is_active' => true],
                    ['name' => 'Hatchbacks', 'slug' => 'hatchbacks', 'icon' => 'Car', 'is_active' => true],
                    ['name' => 'Coupes', 'slug' => 'coupes', 'icon' => 'Car', 'is_active' => true],
                    ['name' => 'Convertibles', 'slug' => 'convertibles', 'icon' => 'Car', 'is_active' => true],
                    ['name' => 'Pick-Up Trucks', 'slug' => 'pickup-trucks', 'icon' => 'Truck', 'is_active' => true],
                    ['name' => 'Trucks & Trailers', 'slug' => 'trucks-trailers', 'icon' => 'Truck', 'is_active' => true],
                    ['name' => 'Buses', 'slug' => 'buses', 'icon' => 'Bus', 'is_active' => true],
                    ['name' => 'Vans', 'slug' => 'vans', 'icon' => 'Van', 'is_active' => true],
                    ['name' => 'Motorcycles', 'slug' => 'motorcycles', 'icon' => 'Bike', 'is_active' => true],
                    ['name' => 'Scooters', 'slug' => 'scooters', 'icon' => 'Bike', 'is_active' => true],
                    ['name' => 'Tricycles', 'slug' => 'tricycles', 'icon' => 'Bike', 'is_active' => true],
                    ['name' => 'Heavy Equipment', 'slug' => 'heavy-equipment', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Forklifts', 'slug' => 'forklifts', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Tractors', 'slug' => 'tractors', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Vehicle Parts', 'slug' => 'vehicle-parts', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Vehicle Accessories', 'slug' => 'vehicle-accessories', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Tires & Rims', 'slug' => 'tires-rims', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Watercraft & Boats', 'slug' => 'watercraft-boats', 'icon' => 'Ship', 'is_active' => true],
                    ['name' => 'Auto Repair Services', 'slug' => 'auto-repair', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Car Rentals', 'slug' => 'car-rentals', 'icon' => 'Car', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 2. MOBILE PHONES & TABLETS (already implemented - preserved)
            // ============================================================
            [
                'name' => 'Mobile Phones & Tablets',
                'slug' => 'mobile-phones',
                'icon' => 'Smartphone',
                'description' => 'Smartphones, tablets, smartwatches, and accessories',
                'is_active' => true,
                'sort_order' => 1,
                'subcategories' => [
                    ['name' => 'Smartphones', 'slug' => 'smartphones', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Android Phones', 'slug' => 'android-phones', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'iPhones', 'slug' => 'iphones', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Tablets', 'slug' => 'tablets', 'icon' => 'Tablet', 'is_active' => true],
                    ['name' => 'iPads', 'slug' => 'ipads', 'icon' => 'Tablet', 'is_active' => true],
                    ['name' => 'Smartwatches', 'slug' => 'smartwatches', 'icon' => 'Watch', 'is_active' => true],
                    ['name' => 'Phone Accessories', 'slug' => 'phone-accessories', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Chargers', 'slug' => 'chargers', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'USB Cables', 'slug' => 'usb-cables', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Earbuds', 'slug' => 'earbuds', 'icon' => 'Headphones', 'is_active' => true],
                    ['name' => 'Bluetooth Speakers', 'slug' => 'bluetooth-speakers', 'icon' => 'Speaker', 'is_active' => true],
                    ['name' => 'Power Banks', 'slug' => 'power-banks', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Phone Cases', 'slug' => 'phone-cases', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Screen Protectors', 'slug' => 'screen-protectors', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Phone Parts', 'slug' => 'phone-parts', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Batteries', 'slug' => 'phone-batteries', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'SIM Devices', 'slug' => 'sim-devices', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Gaming Phones', 'slug' => 'gaming-phones', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Foldable Phones', 'slug' => 'foldable-phones', 'icon' => 'Smartphone', 'is_active' => true],
                    ['name' => 'Mobile Routers', 'slug' => 'mobile-routers', 'icon' => 'Wifi', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 3. ELECTRONICS
            // ============================================================
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'icon' => 'Monitor',
                'description' => 'TVs, computers, audio, cameras, gaming, and smart home devices',
                'is_active' => true,
                'sort_order' => 2,
                'subcategories' => [
                    ['name' => 'TVs', 'slug' => 'tvs', 'icon' => 'Tv', 'is_active' => true],
                    ['name' => 'Smart TVs', 'slug' => 'smart-tvs', 'icon' => 'Tv', 'is_active' => true],
                    ['name' => 'Home Audio', 'slug' => 'home-audio', 'icon' => 'Speaker', 'is_active' => true],
                    ['name' => 'Speakers', 'slug' => 'speakers', 'icon' => 'Speaker', 'is_active' => true],
                    ['name' => 'Headphones', 'slug' => 'headphones', 'icon' => 'Headphones', 'is_active' => true],
                    ['name' => 'Computers', 'slug' => 'computers', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Laptops', 'slug' => 'laptops', 'icon' => 'Laptop', 'is_active' => true],
                    ['name' => 'Desktop Computers', 'slug' => 'desktops', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Monitors', 'slug' => 'monitors', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Printers', 'slug' => 'printers', 'icon' => 'Printer', 'is_active' => true],
                    ['name' => 'Scanners', 'slug' => 'scanners', 'icon' => 'Printer', 'is_active' => true],
                    ['name' => 'Networking Devices', 'slug' => 'networking-devices', 'icon' => 'Wifi', 'is_active' => true],
                    ['name' => 'Routers', 'slug' => 'routers', 'icon' => 'Wifi', 'is_active' => true],
                    ['name' => 'CCTV Cameras', 'slug' => 'cctv-cameras', 'icon' => 'Camera', 'is_active' => true],
                    ['name' => 'Security Systems', 'slug' => 'security-systems', 'icon' => 'Shield', 'is_active' => true],
                    ['name' => 'Projectors', 'slug' => 'projectors', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Gaming Consoles', 'slug' => 'gaming-consoles', 'icon' => 'Gamepad', 'is_active' => true],
                    ['name' => 'Drones', 'slug' => 'drones', 'icon' => 'Camera', 'is_active' => true],
                    ['name' => 'Cameras', 'slug' => 'cameras', 'icon' => 'Camera', 'is_active' => true],
                    ['name' => 'Photography Equipment', 'slug' => 'photography-equipment', 'icon' => 'Camera', 'is_active' => true],
                    ['name' => 'Smart Home Devices', 'slug' => 'smart-home', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Electronic Accessories', 'slug' => 'electronic-accessories', 'icon' => 'Monitor', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 4. BABY & KIDS
            // ============================================================
            [
                'name' => 'Baby & Kids',
                'slug' => 'baby-kids',
                'icon' => 'Baby',
                'description' => 'Baby and kids clothing, toys, gear, furniture, and accessories',
                'is_active' => true,
                'sort_order' => 3,
                'subcategories' => [
                    ['name' => 'Baby Clothing', 'slug' => 'baby-clothing', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Kids Clothing', 'slug' => 'kids-clothing', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Baby Shoes', 'slug' => 'baby-shoes', 'icon' => 'Footprints', 'is_active' => true],
                    ['name' => 'Kids Shoes', 'slug' => 'kids-shoes', 'icon' => 'Footprints', 'is_active' => true],
                    ['name' => 'Toys', 'slug' => 'toys', 'icon' => 'ToyBrick', 'is_active' => true],
                    ['name' => 'Educational Toys', 'slug' => 'educational-toys', 'icon' => 'Book', 'is_active' => true],
                    ['name' => 'Baby Gear', 'slug' => 'baby-gear', 'icon' => 'Baby', 'is_active' => true],
                    ['name' => 'Strollers', 'slug' => 'strollers', 'icon' => 'Baby', 'is_active' => true],
                    ['name' => 'Car Seats', 'slug' => 'car-seats', 'icon' => 'Car', 'is_active' => true],
                    ['name' => 'Baby Feeding', 'slug' => 'baby-feeding', 'icon' => 'Coffee', 'is_active' => true],
                    ['name' => 'Baby Bathing', 'slug' => 'baby-bathing', 'icon' => 'Droplets', 'is_active' => true],
                    ['name' => 'Diapers', 'slug' => 'diapers', 'icon' => 'Baby', 'is_active' => true],
                    ['name' => 'School Supplies', 'slug' => 'school-supplies', 'icon' => 'Book', 'is_active' => true],
                    ['name' => 'Baby Furniture', 'slug' => 'baby-furniture', 'icon' => 'Sofa', 'is_active' => true],
                    ['name' => 'Baby Safety', 'slug' => 'baby-safety', 'icon' => 'Shield', 'is_active' => true],
                    ['name' => 'Maternity Products', 'slug' => 'maternity', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Kids Bags', 'slug' => 'kids-bags', 'icon' => 'Bag', 'is_active' => true],
                    ['name' => 'Baby Carriers', 'slug' => 'baby-carriers', 'icon' => 'Baby', 'is_active' => true],
                    ['name' => 'Baby Walkers', 'slug' => 'baby-walkers', 'icon' => 'Baby', 'is_active' => true],
                    ['name' => 'Kids Accessories', 'slug' => 'kids-accessories', 'icon' => 'Shirt', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 5. FASHION
            // ============================================================
            [
                'name' => 'Fashion',
                'slug' => 'fashion',
                'icon' => 'Shirt',
                'description' => 'Clothing, shoes, bags, jewelry, and fashion accessories for men and women',
                'is_active' => true,
                'sort_order' => 4,
                'subcategories' => [
                    ['name' => "Men's Clothing", 'slug' => 'men-clothing', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => "Women's Clothing", 'slug' => 'women-clothing', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Unisex Clothing', 'slug' => 'unisex-clothing', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Native Wear', 'slug' => 'native-wear', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Corporate Wear', 'slug' => 'corporate-wear', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Shoes', 'slug' => 'shoes', 'icon' => 'Footprints', 'is_active' => true],
                    ['name' => 'Sneakers', 'slug' => 'sneakers', 'icon' => 'Footprints', 'is_active' => true],
                    ['name' => 'Sandals', 'slug' => 'sandals', 'icon' => 'Footprints', 'is_active' => true],
                    ['name' => 'Bags', 'slug' => 'bags', 'icon' => 'Bag', 'is_active' => true],
                    ['name' => 'Watches', 'slug' => 'watches', 'icon' => 'Watch', 'is_active' => true],
                    ['name' => 'Jewelry', 'slug' => 'jewelry', 'icon' => 'Gem', 'is_active' => true],
                    ['name' => 'Wedding Wear', 'slug' => 'wedding-wear', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Fashion Accessories', 'slug' => 'fashion-accessories', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Caps & Hats', 'slug' => 'caps-hats', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Belts', 'slug' => 'belts', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Sunglasses', 'slug' => 'sunglasses', 'icon' => 'Sun', 'is_active' => true],
                    ['name' => 'Underwear', 'slug' => 'underwear', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Sleepwear', 'slug' => 'sleepwear', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Sportswear', 'slug' => 'sportswear', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Luxury Fashion', 'slug' => 'luxury-fashion', 'icon' => 'Gem', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 6. HOME, FURNITURE & APPLIANCES
            // ============================================================
            [
                'name' => 'Home, Furniture & Appliances',
                'slug' => 'home-furniture',
                'icon' => 'Sofa',
                'description' => 'Furniture, home decor, kitchen and large appliances, bedding, and lighting',
                'is_active' => true,
                'sort_order' => 5,
                'subcategories' => [
                    ['name' => 'Furniture', 'slug' => 'furniture', 'icon' => 'Sofa', 'is_active' => true],
                    ['name' => 'Home Decor', 'slug' => 'home-decor', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Kitchen Appliances', 'slug' => 'kitchen-appliances', 'icon' => 'Coffee', 'is_active' => true],
                    ['name' => 'Large Appliances', 'slug' => 'large-appliances', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Small Appliances', 'slug' => 'small-appliances', 'icon' => 'Coffee', 'is_active' => true],
                    ['name' => 'Bedding', 'slug' => 'bedding', 'icon' => 'Sofa', 'is_active' => true],
                    ['name' => 'Lighting', 'slug' => 'lighting', 'icon' => 'Sun', 'is_active' => true],
                    ['name' => 'Home Accessories', 'slug' => 'home-accessories', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Cookware', 'slug' => 'cookware', 'icon' => 'Coffee', 'is_active' => true],
                    ['name' => 'Dining & Glassware', 'slug' => 'dining-glassware', 'icon' => 'Coffee', 'is_active' => true],
                    ['name' => 'Storage & Organization', 'slug' => 'storage-organization', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Home Improvement', 'slug' => 'home-improvement', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Gardening Tools', 'slug' => 'gardening-tools', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'DIY Materials', 'slug' => 'diy-materials', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Cleaning Equipment', 'slug' => 'cleaning-equipment', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Curtains & Blinds', 'slug' => 'curtains-blinds', 'icon' => 'Home', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 7. HEALTH & BEAUTY
            // ============================================================
            [
                'name' => 'Health & Beauty',
                'slug' => 'health-beauty',
                'icon' => 'Heart',
                'description' => 'Skincare, makeup, hair products, fragrances, supplements, and wellness',
                'is_active' => true,
                'sort_order' => 6,
                'subcategories' => [
                    ['name' => 'Skincare', 'slug' => 'skincare', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Face Care', 'slug' => 'face-care', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Body Care', 'slug' => 'body-care', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Makeup', 'slug' => 'makeup', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Hair Products', 'slug' => 'haircare', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Hair Extensions', 'slug' => 'hair-extensions', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Fragrances', 'slug' => 'fragrances', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Oral Care', 'slug' => 'oral-care', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Personal Care', 'slug' => 'personal-care', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Beauty Tools', 'slug' => 'beauty-tools', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Salon Equipment', 'slug' => 'salon-equipment', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Spa Equipment', 'slug' => 'spa-equipment', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Vitamins', 'slug' => 'vitamins', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Supplements', 'slug' => 'supplements', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Weight Management', 'slug' => 'weight-management', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Feminine Care', 'slug' => 'feminine-care', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Grooming Tools', 'slug' => 'grooming-tools', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Medical Beauty Devices', 'slug' => 'medical-beauty-devices', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Organic Beauty', 'slug' => 'organic-beauty', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Wellness Products', 'slug' => 'wellness-products', 'icon' => 'Heart', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 8. JOBS
            // ============================================================
            [
                'name' => 'Jobs',
                'slug' => 'jobs',
                'icon' => 'Briefcase',
                'description' => 'Job listings across all industries including tech, healthcare, finance, and more',
                'is_active' => true,
                'sort_order' => 7,
                'subcategories' => [
                    ['name' => 'Technology Jobs', 'slug' => 'tech-jobs', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Driver Jobs', 'slug' => 'driver-jobs', 'icon' => 'Car', 'is_active' => true],
                    ['name' => 'Office Jobs', 'slug' => 'office-jobs', 'icon' => 'Briefcase', 'is_active' => true],
                    ['name' => 'Hotel Jobs', 'slug' => 'hotel-jobs', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Construction Jobs', 'slug' => 'construction-jobs', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Healthcare Jobs', 'slug' => 'healthcare-jobs', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Security Jobs', 'slug' => 'security-jobs', 'icon' => 'Shield', 'is_active' => true],
                    ['name' => 'Sales Jobs', 'slug' => 'sales-jobs', 'icon' => 'Briefcase', 'is_active' => true],
                    ['name' => 'Marketing Jobs', 'slug' => 'marketing-jobs', 'icon' => 'Briefcase', 'is_active' => true],
                    ['name' => 'Customer Service Jobs', 'slug' => 'customer-service-jobs', 'icon' => 'Briefcase', 'is_active' => true],
                    ['name' => 'Engineering Jobs', 'slug' => 'engineering-jobs', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Remote Jobs', 'slug' => 'remote-jobs', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Part-Time Jobs', 'slug' => 'part-time-jobs', 'icon' => 'Briefcase', 'is_active' => true],
                    ['name' => 'Internship Jobs', 'slug' => 'internship-jobs', 'icon' => 'Briefcase', 'is_active' => true],
                    ['name' => 'Freelance Jobs', 'slug' => 'freelance-jobs', 'icon' => 'Briefcase', 'is_active' => true],
                    ['name' => 'Teaching Jobs', 'slug' => 'teaching-jobs', 'icon' => 'Book', 'is_active' => true],
                    ['name' => 'Factory Jobs', 'slug' => 'factory-jobs', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Logistics Jobs', 'slug' => 'logistics-jobs', 'icon' => 'Truck', 'is_active' => true],
                    ['name' => 'Finance Jobs', 'slug' => 'finance-jobs', 'icon' => 'Briefcase', 'is_active' => true],
                    ['name' => 'Human Resources Jobs', 'slug' => 'hr-jobs', 'icon' => 'Users', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 9. PETS
            // ============================================================
            [
                'name' => 'Pets',
                'slug' => 'pets',
                'icon' => 'Dog',
                'description' => 'Dogs, cats, birds, fish, pet supplies, and veterinary services',
                'is_active' => true,
                'sort_order' => 8,
                'subcategories' => [
                    ['name' => 'Dogs', 'slug' => 'dogs', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Puppies', 'slug' => 'puppies', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Cats', 'slug' => 'cats', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Kittens', 'slug' => 'kittens', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Birds', 'slug' => 'birds', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Fish', 'slug' => 'fish', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Rabbits', 'slug' => 'rabbits', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Livestock Pets', 'slug' => 'livestock', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Pet Food', 'slug' => 'pet-food', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Pet Accessories', 'slug' => 'pet-accessories', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Pet Healthcare', 'slug' => 'pet-healthcare', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Aquariums', 'slug' => 'aquariums', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Pet Toys', 'slug' => 'pet-toys', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Pet Grooming', 'slug' => 'pet-grooming', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Pet Services', 'slug' => 'pet-services', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Pet Housing', 'slug' => 'pet-housing', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Reptiles', 'slug' => 'reptiles', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Exotic Pets', 'slug' => 'exotic-pets', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Pet Training', 'slug' => 'pet-training', 'icon' => 'Dog', 'is_active' => true],
                    ['name' => 'Veterinary Services', 'slug' => 'vet-services', 'icon' => 'Heart', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 10. PROPERTY
            // ============================================================
            [
                'name' => 'Property',
                'slug' => 'property',
                'icon' => 'Home',
                'description' => 'Apartments, houses, lands, commercial property, and real estate services',
                'is_active' => true,
                'sort_order' => 9,
                'subcategories' => [
                    ['name' => 'Apartments for Rent', 'slug' => 'apartments-rent', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Apartments for Sale', 'slug' => 'apartments-sale', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Houses for Rent', 'slug' => 'houses-rent', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Houses for Sale', 'slug' => 'houses-sale', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Lands & Plots', 'slug' => 'land-plots', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Commercial Property', 'slug' => 'commercial-property', 'icon' => 'Building', 'is_active' => true],
                    ['name' => 'Office Spaces', 'slug' => 'office-spaces', 'icon' => 'Building', 'is_active' => true],
                    ['name' => 'Shops', 'slug' => 'shops', 'icon' => 'Building', 'is_active' => true],
                    ['name' => 'Warehouses', 'slug' => 'warehouses', 'icon' => 'Building', 'is_active' => true],
                    ['name' => 'Event Centers', 'slug' => 'event-centers', 'icon' => 'Building', 'is_active' => true],
                    ['name' => 'Hotels', 'slug' => 'hotels', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Hostels', 'slug' => 'hostels', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Short Let', 'slug' => 'short-let', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Co-working Spaces', 'slug' => 'coworking-spaces', 'icon' => 'Building', 'is_active' => true],
                    ['name' => 'Factories', 'slug' => 'factories', 'icon' => 'Building', 'is_active' => true],
                    ['name' => 'Farms', 'slug' => 'farms', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Mixed-Use Property', 'slug' => 'mixed-use-property', 'icon' => 'Building', 'is_active' => true],
                    ['name' => 'Beach Property', 'slug' => 'beach-property', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Luxury Property', 'slug' => 'luxury-property', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Property Services', 'slug' => 'property-services', 'icon' => 'Home', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 11. SERVICES
            // ============================================================
            [
                'name' => 'Services',
                'slug' => 'services',
                'icon' => 'Wrench',
                'description' => 'Professional services including cleaning, repairs, digital, and event planning',
                'is_active' => true,
                'sort_order' => 10,
                'subcategories' => [
                    ['name' => 'Cleaning Services', 'slug' => 'cleaning-services', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Laundry Services', 'slug' => 'laundry-services', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Repair Services', 'slug' => 'repair-services', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Plumbing Services', 'slug' => 'plumbing-services', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Electrical Services', 'slug' => 'electrical-services', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Digital Services', 'slug' => 'digital-services', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Web Design', 'slug' => 'web-design', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Graphic Design', 'slug' => 'graphic-design', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Programming Services', 'slug' => 'programming-services', 'icon' => 'Monitor', 'is_active' => true],
                    ['name' => 'Photography Services', 'slug' => 'photography-services', 'icon' => 'Camera', 'is_active' => true],
                    ['name' => 'Videography Services', 'slug' => 'videography-services', 'icon' => 'Camera', 'is_active' => true],
                    ['name' => 'Delivery Services', 'slug' => 'delivery-services', 'icon' => 'Truck', 'is_active' => true],
                    ['name' => 'Beauty Services', 'slug' => 'beauty-services', 'icon' => 'Heart', 'is_active' => true],
                    ['name' => 'Catering Services', 'slug' => 'catering-services', 'icon' => 'Coffee', 'is_active' => true],
                    ['name' => 'Event Planning', 'slug' => 'event-planning', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Building Services', 'slug' => 'building-services', 'icon' => 'Wrench', 'is_active' => true],
                    ['name' => 'Interior Design', 'slug' => 'interior-design', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Moving Services', 'slug' => 'moving-services', 'icon' => 'Truck', 'is_active' => true],
                    ['name' => 'Printing Services', 'slug' => 'printing-services', 'icon' => 'Printer', 'is_active' => true],
                    ['name' => 'Consulting Services', 'slug' => 'consulting-services', 'icon' => 'Briefcase', 'is_active' => true],
                ],
            ],

            // ============================================================
            // 12. SPORTS & OUTDOOR
            // ============================================================
            [
                'name' => 'Sports & Outdoors',
                'slug' => 'sports',
                'icon' => 'Dumbbell',
                'description' => 'Gym equipment, bicycles, camping gear, sporting goods, and outdoor recreation',
                'is_active' => true,
                'sort_order' => 11,
                'subcategories' => [
                    ['name' => 'Gym Equipment', 'slug' => 'gym-equipment', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Fitness Accessories', 'slug' => 'fitness-accessories', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Treadmills', 'slug' => 'treadmills', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Dumbbells', 'slug' => 'dumbbells', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Bicycles', 'slug' => 'bicycles', 'icon' => 'Bike', 'is_active' => true],
                    ['name' => 'Camping Gear', 'slug' => 'camping-gear', 'icon' => 'Home', 'is_active' => true],
                    ['name' => 'Hiking Equipment', 'slug' => 'hiking-equipment', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Outdoor Furniture', 'slug' => 'outdoor-furniture', 'icon' => 'Sofa', 'is_active' => true],
                    ['name' => 'Football Equipment', 'slug' => 'football-equipment', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Basketball Equipment', 'slug' => 'basketball-equipment', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Swimming Equipment', 'slug' => 'swimming-equipment', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Boxing Equipment', 'slug' => 'boxing-equipment', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Indoor Games', 'slug' => 'indoor-games', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Jerseys', 'slug' => 'jerseys', 'icon' => 'Shirt', 'is_active' => true],
                    ['name' => 'Sports Shoes', 'slug' => 'sports-shoes', 'icon' => 'Footprints', 'is_active' => true],
                    ['name' => 'Yoga Equipment', 'slug' => 'yoga-equipment', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Fishing Equipment', 'slug' => 'fishing-equipment', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Running Equipment', 'slug' => 'running-equipment', 'icon' => 'Dumbbell', 'is_active' => true],
                    ['name' => 'Outdoor Cooking', 'slug' => 'outdoor-cooking', 'icon' => 'Coffee', 'is_active' => true],
                    ['name' => 'Travel Accessories', 'slug' => 'travel-accessories', 'icon' => 'Bag', 'is_active' => true],
                ],
            ],
        ];
    }
}
