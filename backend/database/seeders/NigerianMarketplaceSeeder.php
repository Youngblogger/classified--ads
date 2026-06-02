<?php

namespace Database\Seeders;

use App\Models\Ad;
use App\Models\AdImage;
use App\Models\Category;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;

class NigerianMarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        $this->createAds();
    }

    private function createAds()
    {
        $adsData = $this->getAdsData();
        $users = User::where('role', 'user')->get();
        $locations = Location::all();

        if ($users->isEmpty()) {
            $this->command->error('No users found. Run DatabaseSeeder first.');
            return;
        }

        $created = 0;
        foreach ($adsData as $adData) {
            $user = $users->random();
            $category = Category::where('slug', $adData['category'])->first();
            $subcategory = Category::where('slug', $adData['subcategory'])->first();
            $location = $locations->random();

            if (!$category) {
                continue;
            }

            $ad = Ad::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'subcategory_id' => $subcategory?->id,
                'location_id' => $location->id,
                'title' => $adData['title'],
                'slug' => \Illuminate\Support\Str::slug($adData['title']) . '-' . time() . rand(100, 999),
                'description' => $adData['description'],
                'short_description' => $adData['short_description'],
                'negotiable' => str_contains(mb_strtolower($adData['description']), 'negotiable') || (crc32($adData['title']) % 3 === 0),
                'price' => $adData['price'],
                'condition' => $adData['condition'],
                'status' => 'active',
                'attributes' => $adData['specifications'],
            ]);

            foreach ($adData['images'] as $index => $imagePath) {
                AdImage::create([
                    'ad_id' => $ad->id,
                    'url' => $imagePath,
                    'is_primary' => $index === 0,
                    'sort_order' => $index + 1,
                ]);
            }

            $created++;
        }

        $this->command->info("Created {$created} Nigerian marketplace ads!");
    }

    private function getAdsData(): array
    {
        return [
            // VEHICLES - Cars (10 ads)
            [
                'title' => 'Toyota Camry 2015 SE - Sharp Body',
                'description' => "Very clean Toyota Camry 2015 SE. Nothing to fix, engine and gear perfect. All papers complete. Just buy and drive. I don cast am because I buy new car. Ac wan cool. Tyres new. No accidents before.",
                'short_description' => 'Clean Camry 2015, nothing to fix',
                'price' => 3800000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/toyota_camry_2015_1.jpg', 'ads/vehicles/toyota_camry_2015_2.jpg', 'ads/vehicles/toyota_camry_2015_3.jpg'],
                'specifications' => [
                    'brand' => 'Toyota',
                    'model' => 'Camry SE',
                    'year' => '2015',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'Silver',
                    'mileage' => '95000',
                    'features' => ['ABS', 'Airbags', 'Air Conditioning', 'Power Steering'],
                ]
            ],
            [
                'title' => 'Honda Accord 2013 - Nigerian Used',
                'description' => "Honda Accord 2013 foreign used. Engine very sound, no knock. Body straight clean.Buy and drive go straight. Nothing to fix at all. All documents sharp. Sharp.",
                'short_description' => 'Foreign used Honda Accord',
                'price' => 3200000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/honda_accord_2013_1.jpg', 'ads/vehicles/honda_accord_2013_2.jpg'],
                'specifications' => [
                    'brand' => 'Honda',
                    'model' => 'Accord',
                    'year' => '2013',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'Black',
                    'mileage' => '120000',
                    'features' => ['ABS', 'Airbags', 'Leather Seats'],
                ]
            ],
            [
                'title' => 'Lexus RX 350 2016 - Full Option',
                'description' => "Lexus RX 350 2016 foreign used. Full option, everything work. Sunroof, navigation, heated seats, everything. No stories. Sharp like new motor. Buy and enjoy.",
                'short_description' => 'Full option Lexus RX 350',
                'price' => 18500000,
                'condition' => 'like_new',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/lexus_rx350_1.jpg', 'ads/vehicles/lexus_rx350_2.jpg', 'ads/vehicles/lexus_rx350_3.jpg', 'ads/vehicles/lexus_rx350_4.jpg'],
                'specifications' => [
                    'brand' => 'Lexus',
                    'model' => 'RX 350',
                    'year' => '2016',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'White',
                    'mileage' => '45000',
                    'features' => ['Sunroof', 'Navigation', 'Heated Seats', 'Leather Seats', 'Bluetooth'],
                ]
            ],
            [
                'title' => 'Toyota Corolla 2012 - Standard',
                'description' => "Toyota Corolla 2012. Clean body, good engine. Nothing big to talk. Buy and drive. Ac cool. No noise.",
                'short_description' => 'Clean Corolla 2012',
                'price' => 2500000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/toyota_corolla_2012_1.jpg', 'ads/vehicles/toyota_corolla_2012_2.jpg'],
                'specifications' => [
                    'brand' => 'Toyota',
                    'model' => 'Corolla',
                    'year' => '2012',
                    'transmission' => 'Manual',
                    'fuel_type' => 'Petrol',
                    'color' => 'Silver',
                    'mileage' => '150000',
                    'features' => ['Air Conditioning', 'Power Windows'],
                ]
            ],
            [
                'title' => 'Mercedes Benz C300 2015 - Foreign Used',
                'description' => "Mercedes Benz C300 2015. German very good car. All function working. Just maintain well. No issues. Sharp.",
                'short_description' => 'Mercedes C300 foreign used',
                'price' => 9500000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/mercedes_c300_1.jpg', 'ads/vehicles/mercedes_c300_2.jpg', 'ads/vehicles/mercedes_c300_3.jpg'],
                'specifications' => [
                    'brand' => 'Mercedes Benz',
                    'model' => 'C300',
                    'year' => '2015',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'Black',
                    'mileage' => '85000',
                    'features' => ['Sunroof', 'Leather Seats', 'Bluetooth', 'ABS'],
                ]
            ],
            [
                'title' => 'Hyundai Sonata 2014 - Clean',
                'description' => "Hyundai Sonata 2014. Very clean. Engine perfect. No noise. All papers. Ac cool. Good car for family.",
                'short_description' => 'Clean Hyundai Sonata',
                'price' => 2800000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/hyundai_sonata_2014_1.jpg', 'ads/vehicles/hyundai_sonata_2014_2.jpg'],
                'specifications' => [
                    'brand' => 'Hyundai',
                    'model' => 'Sonata',
                    'year' => '2014',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'Grey',
                    'mileage' => '110000',
                    'features' => ['Air Conditioning', 'Power Windows'],
                ]
            ],
            [
                'title' => 'Toyota Hilux 2018 - VGS Sportivo',
                'description' => "Toyota Hilux 2018 VGS. Strong engine, 4WD working. Good for rough road and village. No problems. This one go last.",
                'short_description' => 'Toyota Hilux 2018',
                'price' => 12500000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/toyota_hilux_1.jpg', 'ads/vehicles/toyota_hilux_2.jpg', 'ads/vehicles/toyota_hilux_3.jpg'],
                'specifications' => [
                    'brand' => 'Toyota',
                    'model' => 'Hilux VGS',
                    'year' => '2018',
                    'transmission' => 'Manual',
                    'fuel_type' => 'Diesel',
                    'color' => 'White',
                    'mileage' => '65000',
                    'features' => ['4WD', 'Bluetooth', 'USB'],
                ]
            ],
            [
                'title' => 'Ford Edge 2015 - Limited',
                'description' => "Ford Edge 2015 Limited. Full option. Sunroof, leather seats. Foreign used. Sharp motor.",
                'short_description' => 'Ford Edge Limited',
                'price' => 6500000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/ford_edge_1.jpg', 'ads/vehicles/ford_edge_2.jpg', 'ads/vehicles/ford_edge_3.jpg'],
                'specifications' => [
                    'brand' => 'Ford',
                    'model' => 'Edge Limited',
                    'year' => '2015',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'Red',
                    'mileage' => '78000',
                    'features' => ['Sunroof', 'Leather Seats', 'Navigation'],
                ]
            ],
            [
                'title' => 'Kia Forte 2014 - Clean Title',
                'description' => "Kia Forte 2014. Good condition, nothing big. Engine and gear perfect. Good for first car. Cheap maintain.",
                'short_description' => 'Kia Forte 2014',
                'price' => 1800000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/kia_forte_1.jpg', 'ads/vehicles/kia_forte_2.jpg'],
                'specifications' => [
                    'brand' => 'Kia',
                    'model' => 'Forte',
                    'year' => '2014',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'Silver',
                    'mileage' => '100000',
                    'features' => ['Air Conditioning', 'Power Windows'],
                ]
            ],
            [
                'title' => 'Nissan Altima 2016 - Foreign',
                'description' => "Nissan Altima 2016 foreign used. Clean and sharp. No accidents. All working. Buy and drive.",
                'short_description' => 'Nissan Altima 2016',
                'price' => 3500000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/nissan_altima_1.jpg', 'ads/vehicles/nissan_altima_2.jpg', 'ads/vehicles/nissan_altima_3.jpg'],
                'specifications' => [
                    'brand' => 'Nissan',
                    'model' => 'Altima',
                    'year' => '2016',
                    'transmission' => 'CVT',
                    'fuel_type' => 'Petrol',
                    'color' => 'White',
                    'mileage' => '70000',
                    'features' => ['Backup Camera', 'Bluetooth'],
                ]
            ],

            // MOTORCYCLES (4 ads)
            [
                'title' => 'Honda CG125 - Nigeria Used',
                'description' => "Honda CG125, very strong engine. No noise. Good for commercial or personal. Tire good. Chain good. Just buy am.",
                'short_description' => 'Strong Honda CG125',
                'price' => 350000,
                'condition' => 'good',
                'category' => 'motorcycles',
                'subcategory' => 'motorcycles',
                'images' => ['ads/motorcycles/honda_cg125_1.jpg', 'ads/motorcycles/honda_cg125_2.jpg'],
                'specifications' => [
                    'brand' => 'Honda',
                    'model' => 'CG125',
                    'year' => '2019',
                    'engine' => '125cc',
                    'mileage' => '45000',
                ]
            ],
            [
                'title' => 'Yamaha DT125 - King of the Road',
                'description' => "Yamaha DT125. Very fast and reliable. Good for messenger work. No issues. Sharp bike.",
                'short_description' => 'Yamaha DT125',
                'price' => 480000,
                'condition' => 'good',
                'category' => 'motorcycles',
                'subcategory' => 'motorcycles',
                'images' => ['ads/motorcycles/yamaha_dt125_1.jpg', 'ads/motorcycles/yamaha_dt125_2.jpg'],
                'specifications' => [
                    'brand' => 'Yamaha',
                    'model' => 'DT125',
                    'year' => '2020',
                    'engine' => '125cc',
                    'mileage' => '38000',
                ]
            ],
            [
                'title' => 'Bajaj Boxer 150 - Heavy Duty',
                'description' => "Bajaj Boxer 150. Very strong engine, fit carry weight. Good for commercial. No problems.",
                'short_description' => 'Bajaj Boxer 150',
                'price' => 420000,
                'condition' => 'good',
                'category' => 'motorcycles',
                'subcategory' => 'motorcycles',
                'images' => ['ads/motorcycles/bajaj_boxer_1.jpg', 'ads/motorcycles/bajaj_boxer_2.jpg'],
                'specifications' => [
                    'brand' => 'Bajaj',
                    'model' => 'Boxer 150',
                    'year' => '2021',
                    'engine' => '150cc',
                    'mileage' => '30000',
                ]
            ],
            [
                'title' => 'Suzuki GN125 - Classic',
                'description' => "Suzuki GN125. Classic bike, good condition. No issues. Good for daily work. Cheap to maintain.",
                'short_description' => 'Suzuki GN125',
                'price' => 380000,
                'condition' => 'good',
                'category' => 'motorcycles',
                'subcategory' => 'motorcycles',
                'images' => ['ads/motorcycles/suzuki_gn125_1.jpg', 'ads/motorcycles/suzuki_gn125_2.jpg'],
                'specifications' => [
                    'brand' => 'Suzuki',
                    'model' => 'GN125',
                    'year' => '2018',
                    'engine' => '125cc',
                    'mileage' => '55000',
                ]
            ],

            // PROPERTY - Apartments for Rent (4 ads)
            [
                'title' => '2 Bedroom Flat at Ikoyi, Lagos',
                'description' => "Clean 2 bedroom flat in Ikoyi. Well painted, tiles and ceiling. Secure area. Agent fee apply. Available now.",
                'short_description' => '2BR flat Ikoyi',
                'price' => 3500000,
                'condition' => 'new',
                'category' => 'apartments-rent',
                'subcategory' => 'apartments-rent',
                'images' => ['ads/property/2br_flat_ikoyi_1.jpg', 'ads/property/2br_flat_ikoyi_2.jpg', 'ads/property/2br_flat_ikoyi_3.jpg'],
                'specifications' => [
                    'type' => 'Flat',
                    'bedrooms' => 2,
                    'bathrooms' => 2,
                    'furnished' => 'No',
                    'location' => 'Ikoyi, Lagos',
                    'parking' => 'Yes',
                ]
            ],
            [
                'title' => '3 Bedroom Apartment at Victoria Island',
                'description' => "3 bedroom flat in Victoria Island. Very nice finishing. All rooms en-suite. Clean. Available January.",
                'short_description' => '3BR Victoria Island',
                'price' => 5500000,
                'condition' => 'new',
                'category' => 'apartments-rent',
                'subcategory' => 'apartments-rent',
                'images' => ['ads/property/3br_victoria_island_1.jpg', 'ads/property/3br_victoria_island_2.jpg'],
                'specifications' => [
                    'type' => 'Apartment',
                    'bedrooms' => 3,
                    'bathrooms' => 3,
                    'furnished' => 'No',
                    'location' => 'Victoria Island, Lagos',
                    'parking' => 'Yes',
                ]
            ],
            [
                'title' => '1 Bedroom Self Contain at Yaba',
                'description' => "Small 1 bedroom self contain in Yaba. Good for student or single person. Light always. Cheap.",
                'short_description' => '1BR Yaba self contain',
                'price' => 450000,
                'condition' => 'good',
                'category' => 'apartments-rent',
                'subcategory' => 'apartments-rent',
                'images' => ['ads/property/1br_yaba_1.jpg', 'ads/property/1br_yaba_2.jpg'],
                'specifications' => [
                    'type' => 'Self Contain',
                    'bedrooms' => 1,
                    'bathrooms' => 1,
                    'furnished' => 'No',
                    'location' => 'Yaba, Lagos',
                    'parking' => 'No',
                ]
            ],
            [
                'title' => '4 Bedroom Penthouse at Lekki',
                'description' => "Big 4 bedroom penthouse in Lekki. Good view, nice finishing. All facilities. Agent fee apply.",
                'short_description' => '4BR Penthouse Lekki',
                'price' => 8000000,
                'condition' => 'new',
                'category' => 'apartments-rent',
                'subcategory' => 'apartments-rent',
                'images' => ['ads/property/4br_lekki_1.jpg', 'ads/property/4br_lekki_2.jpg', 'ads/property/4br_lekki_3.jpg'],
                'specifications' => [
                    'type' => 'Penthouse',
                    'bedrooms' => 4,
                    'bathrooms' => 4,
                    'furnished' => 'Yes',
                    'location' => 'Lekki, Lagos',
                    'parking' => 'Yes',
                ]
            ],

            // PROPERTY - Houses for Sale (4 ads)
            [
                'title' => '4 Bedroom House at Lugbe, Abuja',
                'description' => "Complete 4 bedroom house in Lugbe. All rooms en-suite. BQ. Plot of land. Documents ready.",
                'short_description' => '4BR House Lugbe',
                'price' => 45000000,
                'condition' => 'new',
                'category' => 'houses-sale',
                'subcategory' => 'houses-sale',
                'images' => ['ads/property/house_lugbe_1.jpg', 'ads/property/house_lugbe_2.jpg', 'ads/property/house_lugbe_3.jpg'],
                'specifications' => [
                    'type' => 'House',
                    'bedrooms' => 4,
                    'bathrooms' => 4,
                    'land_size' => '600sqm',
                    'location' => 'Lugbe, Abuja',
                    'parking' => 'Yes',
                ]
            ],
            [
                'title' => '5 Bedroom Duplex at Owerri',
                'description' => "Very big 5 bedroom duplex in Owerri. All rooms en-suite. Boys quarter. Gate house. Good area.",
                'short_description' => '5BR Duplex Owerri',
                'price' => 65000000,
                'condition' => 'new',
                'category' => 'houses-sale',
                'subcategory' => 'houses-sale',
                'images' => ['ads/property/duplex_owerri_1.jpg', 'ads/property/duplex_owerri_2.jpg', 'ads/property/duplex_owerri_3.jpg'],
                'specifications' => [
                    'type' => 'Duplex',
                    'bedrooms' => 5,
                    'bathrooms' => 5,
                    'land_size' => '500sqm',
                    'location' => 'Owerri, Imo',
                    'parking' => 'Yes',
                ]
            ],
            [
                'title' => '3 Bedroom Bungalow at Abeokuta',
                'description' => "3 bedroom bungalow in Abeokuta. Well built. No work needed. Documents complete. Good location.",
                'short_description' => '3BR Bungalow Abeokuta',
                'price' => 18000000,
                'condition' => 'good',
                'category' => 'houses-sale',
                'subcategory' => 'houses-sale',
                'images' => ['ads/property/bungalow_abeokuta_1.jpg', 'ads/property/bungalow_abeokuta_2.jpg'],
                'specifications' => [
                    'type' => 'Bungalow',
                    'bedrooms' => 3,
                    'bathrooms' => 2,
                    'land_size' => '300sqm',
                    'location' => 'Abeokuta, Ogun',
                    'parking' => 'Yes',
                ]
            ],
            [
                'title' => 'Land at Epe - 600sqm',
                'description' => "600sqm land in Epe. Dry land, good for building. C of O ready. Good road. Near the express.",
                'short_description' => '600sqm Land Epe',
                'price' => 8500000,
                'condition' => 'new',
                'category' => 'land',
                'subcategory' => 'land',
                'images' => ['ads/property/land_epe_1.jpg', 'ads/property/land_epe_2.jpg'],
                'specifications' => [
                    'type' => 'Land',
                    'land_size' => '600sqm',
                    'location' => 'Epe, Lagos',
                    'documents' => 'C of O',
                ]
            ],

            // MOBILE PHONES (8 ads)
            [
                'title' => 'iPhone 13 Pro Max 256GB - Like New',
                'description' => "iPhone 13 Pro Max 256GB. Very clean, no scratch. Battery health 89%. All accessories. Just upgraded.",
                'short_description' => 'iPhone 13 Pro Max',
                'price' => 420000,
                'condition' => 'like_new',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/iphone13pm_1.jpg', 'ads/phones/iphone13pm_2.jpg', 'ads/phones/iphone13pm_3.jpg'],
                'specifications' => [
                    'brand' => 'Apple',
                    'model' => 'iPhone 13 Pro Max',
                    'storage' => '256GB',
                    'RAM' => '6GB',
                    'battery' => '89%',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'iPhone 12 64GB - Good Condition',
                'description' => "iPhone 12 64GB. Good condition, minor scratches on back. Battery 82%. Works perfectly.",
                'short_description' => 'iPhone 12 64GB',
                'price' => 250000,
                'condition' => 'good',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/iphone12_1.jpg', 'ads/phones/iphone12_2.jpg'],
                'specifications' => [
                    'brand' => 'Apple',
                    'model' => 'iPhone 12',
                    'storage' => '64GB',
                    'RAM' => '4GB',
                    'battery' => '82%',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Samsung Galaxy S22 Ultra - 256GB',
                'description' => "Samsung S22 Ultra. Very clean. S Pen working. 256GB storage. Nigerian used, well kept. No issues.",
                'short_description' => 'Samsung S22 Ultra',
                'price' => 280000,
                'condition' => 'like_new',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/samsung_s22_ultra_1.jpg', 'ads/phones/samsung_s22_ultra_2.jpg', 'ads/phones/samsung_s22_ultra_3.jpg'],
                'specifications' => [
                    'brand' => 'Samsung',
                    'model' => 'Galaxy S22 Ultra',
                    'storage' => '256GB',
                    'RAM' => '8GB',
                    'battery' => '90%',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'iPhone 14 Pro 128GB - Deep Purple',
                'description' => "iPhone 14 Pro 128GB. Deep purple color. Very clean. Battery 95%. Box and charger included.",
                'short_description' => 'iPhone 14 Pro',
                'price' => 480000,
                'condition' => 'like_new',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/iphone14_pro_1.jpg', 'ads/phones/iphone14_pro_2.jpg', 'ads/phones/iphone14_pro_3.jpg'],
                'specifications' => [
                    'brand' => 'Apple',
                    'model' => 'iPhone 14 Pro',
                    'storage' => '128GB',
                    'RAM' => '6GB',
                    'battery' => '95%',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'Infinix Note 12 - 128GB',
                'description' => "Infinix Note 12. Good condition. 128GB storage. All working. Cheaper than market.",
                'short_description' => 'Infinix Note 12',
                'price' => 95000,
                'condition' => 'good',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/infinix_note12_1.jpg', 'ads/phones/infinix_note12_2.jpg'],
                'specifications' => [
                    'brand' => 'Infinix',
                    'model' => 'Note 12',
                    'storage' => '128GB',
                    'RAM' => '8GB',
                    'battery' => '88%',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Tecno Camon 19 - 128GB',
                'description' => "Tecno Camon 19. Clean. 128GB. Good camera. All working. Affordable.",
                'short_description' => 'Tecno Camon 19',
                'price' => 85000,
                'condition' => 'good',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/tecno_camon19_1.jpg', 'ads/phones/tecno_camon19_2.jpg'],
                'specifications' => [
                    'brand' => 'Tecno',
                    'model' => 'Camon 19',
                    'storage' => '128GB',
                    'RAM' => '6GB',
                    'battery' => '85%',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'OPPO Reno 8 - 256GB',
                'description' => "OPPO Reno 8. Very clean. 256GB. Good camera. Box complete. No issues.",
                'short_description' => 'OPPO Reno 8',
                'price' => 195000,
                'condition' => 'like_new',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/oppo_reno8_1.jpg', 'ads/phones/oppo_reno8_2.jpg', 'ads/phones/oppo_reno8_3.jpg'],
                'specifications' => [
                    'brand' => 'OPPO',
                    'model' => 'Reno 8',
                    'storage' => '256GB',
                    'RAM' => '8GB',
                    'battery' => '92%',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'Samsung Galaxy A53 - 128GB',
                'description' => "Samsung A53. Clean condition. 128GB storage. Good for daily use. Affordable.",
                'short_description' => 'Samsung Galaxy A53',
                'price' => 145000,
                'condition' => 'good',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/samsung_a53_1.jpg', 'ads/phones/samsung_a53_2.jpg'],
                'specifications' => [
                    'brand' => 'Samsung',
                    'model' => 'Galaxy A53',
                    'storage' => '128GB',
                    'RAM' => '6GB',
                    'battery' => '84%',
                    'condition' => 'Good',
                ]
            ],

            // TABLETS (2 ads)
            [
                'title' => 'iPad Pro 12.9 inch - 256GB',
                'description' => "iPad Pro 12.9 inch, 256GB. Very clean. Keyboard and pencil included. Good for work.",
                'short_description' => 'iPad Pro 12.9',
                'price' => 380000,
                'condition' => 'like_new',
                'category' => 'tablets',
                'subcategory' => 'tablets',
                'images' => ['ads/tablets/ipad_pro_1.jpg', 'ads/tablets/ipad_pro_2.jpg', 'ads/tablets/ipad_pro_3.jpg'],
                'specifications' => [
                    'brand' => 'Apple',
                    'model' => 'iPad Pro 12.9',
                    'storage' => '256GB',
                    'RAM' => '8GB',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'Samsung Tab S8 - 128GB',
                'description' => "Samsung Tab S8. Clean. Good for reading and browsing. S Pen included. No issues.",
                'short_description' => 'Samsung Tab S8',
                'price' => 220000,
                'condition' => 'good',
                'category' => 'tablets',
                'subcategory' => 'tablets',
                'images' => ['ads/tablets/samsung_tab_s8_1.jpg', 'ads/tablets/samsung_tab_s8_2.jpg'],
                'specifications' => [
                    'brand' => 'Samsung',
                    'model' => 'Tab S8',
                    'storage' => '128GB',
                    'RAM' => '8GB',
                    'condition' => 'Good',
                ]
            ],

            // SMARTWATCHES (2 ads)
            [
                'title' => 'Apple Watch Series 7 - 45mm',
                'description' => "Apple Watch Series 7, 45mm. Very clean. All health features working. Box and charger. Just upgraded.",
                'short_description' => 'Apple Watch Series 7',
                'price' => 145000,
                'condition' => 'like_new',
                'category' => 'smartwatches',
                'subcategory' => 'smartwatches',
                'images' => ['ads/wearables/apple_watch_7_1.jpg', 'ads/wearables/apple_watch_7_2.jpg'],
                'specifications' => [
                    'brand' => 'Apple',
                    'model' => 'Watch Series 7',
                    'size' => '45mm',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'Samsung Galaxy Watch 5',
                'description' => "Samsung Galaxy Watch 5. Good condition. Health tracking work. Charging dock included.",
                'short_description' => 'Samsung Galaxy Watch 5',
                'price' => 85000,
                'condition' => 'good',
                'category' => 'smartwatches',
                'subcategory' => 'smartwatches',
                'images' => ['ads/wearables/samsung_watch5_1.jpg', 'ads/wearables/samsung_watch5_2.jpg'],
                'specifications' => [
                    'brand' => 'Samsung',
                    'model' => 'Galaxy Watch 5',
                    'condition' => 'Good',
                ]
            ],

            // LAPTOPS (6 ads)
            [
                'title' => 'MacBook Pro 14 inch M2 - 512GB',
                'description' => "MacBook Pro 14 inch with M2 chip. 512GB storage. Very fast. Battery cycle 45. No scratches. Best for work.",
                'short_description' => 'MacBook Pro 14 M2',
                'price' => 650000,
                'condition' => 'like_new',
                'category' => 'laptops',
                'subcategory' => 'laptops',
                'images' => ['ads/laptops/macbook_pro_14_1.jpg', 'ads/laptops/macbook_pro_14_2.jpg', 'ads/laptops/macbook_pro_14_3.jpg'],
                'specifications' => [
                    'brand' => 'Apple',
                    'model' => 'MacBook Pro 14 M2',
                    'storage' => '512GB',
                    'RAM' => '16GB',
                    'processor' => 'M2',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'Dell XPS 13 - 512GB',
                'description' => "Dell XPS 13. Good condition. 512GB SSD. Fast laptop. Good for office work. Battery good.",
                'short_description' => 'Dell XPS 13',
                'price' => 320000,
                'condition' => 'good',
                'category' => 'laptops',
                'subcategory' => 'laptops',
                'images' => ['ads/laptops/dell_xps13_1.jpg', 'ads/laptops/dell_xps13_2.jpg', 'ads/laptops/dell_xps13_3.jpg'],
                'specifications' => [
                    'brand' => 'Dell',
                    'model' => 'XPS 13',
                    'storage' => '512GB',
                    'RAM' => '16GB',
                    'processor' => 'Intel i7',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'HP EliteBook 840 - Nigerian Used',
                'description' => "HP EliteBook 840. Good working condition. 256GB SSD. Good for business. Keyboard good.",
                'short_description' => 'HP EliteBook 840',
                'price' => 180000,
                'condition' => 'good',
                'category' => 'laptops',
                'subcategory' => 'laptops',
                'images' => ['ads/laptops/hp_elitebook_1.jpg', 'ads/laptops/hp_elitebook_2.jpg'],
                'specifications' => [
                    'brand' => 'HP',
                    'model' => 'EliteBook 840',
                    'storage' => '256GB',
                    'RAM' => '8GB',
                    'processor' => 'Intel i5',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Lenovo ThinkPad X1 Carbon - 512GB',
                'description' => "Lenovo ThinkPad X1 Carbon. Very light and fast. 512GB. Good for traveling. No issues.",
                'short_description' => 'ThinkPad X1 Carbon',
                'price' => 350000,
                'condition' => 'good',
                'category' => 'laptops',
                'subcategory' => 'laptops',
                'images' => ['ads/laptops/lenovo_x1_1.jpg', 'ads/laptops/lenovo_x1_2.jpg'],
                'specifications' => [
                    'brand' => 'Lenovo',
                    'model' => 'ThinkPad X1 Carbon',
                    'storage' => '512GB',
                    'RAM' => '16GB',
                    'processor' => 'Intel i7',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'MacBook Air M1 - 256GB',
                'description' => "MacBook Air M1. Very clean. 256GB. Battery health 94%. Fast. Good for students.",
                'short_description' => 'MacBook Air M1',
                'price' => 420000,
                'condition' => 'like_new',
                'category' => 'laptops',
                'subcategory' => 'laptops',
                'images' => ['ads/laptops/macbook_air_1.jpg', 'ads/laptops/macbook_air_2.jpg', 'ads/laptops/macbook_air_3.jpg'],
                'specifications' => [
                    'brand' => 'Apple',
                    'model' => 'MacBook Air M1',
                    'storage' => '256GB',
                    'RAM' => '8GB',
                    'processor' => 'M1',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'Asus VivoBook 15 - 512GB',
                'description' => "Asus VivoBook 15. Good condition. 512GB SSD. Good for everyday use. Numeric keypad.",
                'short_description' => 'Asus VivoBook 15',
                'price' => 195000,
                'condition' => 'good',
                'category' => 'laptops',
                'subcategory' => 'laptops',
                'images' => ['ads/laptops/asus_vivobook_1.jpg', 'ads/laptops/asus_vivobook_2.jpg'],
                'specifications' => [
                    'brand' => 'Asus',
                    'model' => 'VivoBook 15',
                    'storage' => '512GB',
                    'RAM' => '8GB',
                    'processor' => 'Intel i5',
                    'condition' => 'Good',
                ]
            ],

            // TELEVISIONS (3 ads)
            [
                'title' => 'Samsung 55 inch Smart TV',
                'description' => "Samsung 55 inch Smart TV. 4K resolution. Good picture. Apps working. Remote good.",
                'short_description' => 'Samsung 55 inch 4K',
                'price' => 280000,
                'condition' => 'good',
                'category' => 'tvs',
                'subcategory' => 'tvs',
                'images' => ['ads/tvs/samsung_55_1.jpg', 'ads/tvs/samsung_55_2.jpg', 'ads/tvs/samsung_55_3.jpg'],
                'specifications' => [
                    'brand' => 'Samsung',
                    'model' => 'Smart TV',
                    'size' => '55 inch',
                    'resolution' => '4K',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'LG 50 inch OLED TV',
                'description' => "LG 50 inch OLED TV. Very clear picture. Smart features. Thin design. Good for movies.",
                'short_description' => 'LG OLED 50 inch',
                'price' => 320000,
                'condition' => 'good',
                'category' => 'tvs',
                'subcategory' => 'tvs',
                'images' => ['ads/tvs/lg_oled_1.jpg', 'ads/tvs/lg_oled_2.jpg', 'ads/tvs/lg_oled_3.jpg'],
                'specifications' => [
                    'brand' => 'LG',
                    'model' => 'OLED TV',
                    'size' => '50 inch',
                    'resolution' => '4K',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'TCL 43 inch Android TV',
                'description' => "TCL 43 inch Android TV. Good for Netflix, YouTube. Remote working. Affordable.",
                'short_description' => 'TCL Android TV 43',
                'price' => 145000,
                'condition' => 'good',
                'category' => 'tvs',
                'subcategory' => 'tvs',
                'images' => ['ads/tvs/tcl_43_1.jpg', 'ads/tvs/tcl_43_2.jpg'],
                'specifications' => [
                    'brand' => 'TCL',
                    'model' => 'Android TV',
                    'size' => '43 inch',
                    'resolution' => 'Full HD',
                    'condition' => 'Good',
                ]
            ],

            // AUDIO EQUIPMENT (3 ads)
            [
                'title' => 'JBL Xtreme 3 Speaker',
                'description' => "JBL Xtreme 3. Very loud speaker. Good bass. Battery last long. Waterproof. Good for parties.",
                'short_description' => 'JBL Xtreme 3',
                'price' => 95000,
                'condition' => 'like_new',
                'category' => 'audio',
                'subcategory' => 'audio',
                'images' => ['ads/audio/jbl_xtreme_1.jpg', 'ads/audio/jbl_xtreme_2.jpg'],
                'specifications' => [
                    'brand' => 'JBL',
                    'model' => 'Xtreme 3',
                    'type' => 'Bluetooth Speaker',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'Sony WH-1000XM4 Headphones',
                'description' => "Sony WH-1000XM4. Noise cancelling works well. Good sound. Comfy. Box included. Battery long.",
                'short_description' => 'Sony WH-1000XM4',
                'price' => 120000,
                'condition' => 'good',
                'category' => 'audio',
                'subcategory' => 'audio',
                'images' => ['ads/audio/sony_xm4_1.jpg', 'ads/audio/sony_xm4_2.jpg'],
                'specifications' => [
                    'brand' => 'Sony',
                    'model' => 'WH-1000XM4',
                    'type' => 'Headphones',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Home Theatre System - Samsung',
                'description' => "Samsung Home Theatre. Good sound for movies. All speakers working. Subwoofer strong.",
                'short_description' => 'Samsung Home Theatre',
                'price' => 165000,
                'condition' => 'good',
                'category' => 'audio',
                'subcategory' => 'audio',
                'images' => ['ads/audio/home_theatre_1.jpg', 'ads/audio/home_theatre_2.jpg', 'ads/audio/home_theatre_3.jpg'],
                'specifications' => [
                    'brand' => 'Samsung',
                    'model' => 'Home Theatre',
                    'type' => 'Home Cinema',
                    'condition' => 'Good',
                ]
            ],

            // FASHION (8 ads)
            [
                'title' => 'Men Native Wears - Complete Set',
                'description' => "Complete native wear for men. Senator and shirt. Good material. Good for traditional occasions. Size 40.",
                'short_description' => 'Mens Native Wear',
                'price' => 45000,
                'condition' => 'new',
                'category' => 'men-clothing',
                'subcategory' => 'men-clothing',
                'images' => ['ads/fashion/men_native_1.jpg', 'ads/fashion/men_native_2.jpg'],
                'specifications' => [
                    'type' => 'Native Wear',
                    'size' => '40',
                    'color' => 'Blue',
                    'material' => 'Cotton',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Nike Running Shoes',
                'description' => "Nike running shoes. Size 42. Good for gym and running. Clean. Almost new.",
                'short_description' => 'Nike Running Shoes',
                'price' => 35000,
                'condition' => 'like_new',
                'category' => 'shoes',
                'subcategory' => 'shoes',
                'images' => ['ads/fashion/nike_shoes_1.jpg', 'ads/fashion/nike_shoes_2.jpg'],
                'specifications' => [
                    'brand' => 'Nike',
                    'size' => '42',
                    'color' => 'Black/Red',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'Women Handbag - Designer',
                'description' => "Designer handbag for women. Good leather. Can fit phone and keys. Nice color.",
                'short_description' => 'Designer Handbag',
                'price' => 28000,
                'condition' => 'new',
                'category' => 'bags',
                'subcategory' => 'bags',
                'images' => ['ads/fashion/handbag_1.jpg', 'ads/fashion/handbag_2.jpg'],
                'specifications' => [
                    'type' => 'Handbag',
                    'color' => 'Brown',
                    'material' => 'Leather',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Men Wrist Watch - Fossil',
                'description' => "Fossil watch for men. Good quality. Working. Nice design. Leather strap.",
                'short_description' => 'Fossil Watch',
                'price' => 42000,
                'condition' => 'good',
                'category' => 'watches',
                'subcategory' => 'watches',
                'images' => ['ads/fashion/fossil_watch_1.jpg', 'ads/fashion/fossil_watch_2.jpg'],
                'specifications' => [
                    'brand' => 'Fossil',
                    'type' => 'Wrist Watch',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Women Ankle Boots',
                'description' => "Women ankle boots. Size 38. Good quality. Nice for jeans and gowns. Fashion.",
                'short_description' => 'Women Ankle Boots',
                'price' => 22000,
                'condition' => 'new',
                'category' => 'shoes',
                'subcategory' => 'shoes',
                'images' => ['ads/fashion/women_boots_1.jpg', 'ads/fashion/women_boots_2.jpg'],
                'specifications' => [
                    'size' => '38',
                    'color' => 'Black',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Men Jean Trousers - Levi',
                'description' => "Levi jeans for men. Size 32. Good quality. Not faded. Clean.",
                'short_description' => 'Levi Jeans',
                'price' => 18000,
                'condition' => 'good',
                'category' => 'men-clothing',
                'subcategory' => 'men-clothing',
                'images' => ['ads/fashion/levi_jeans_1.jpg', 'ads/fashion/levi_jeans_2.jpg'],
                'specifications' => [
                    'brand' => 'Levi\'s',
                    'size' => '32',
                    'color' => 'Blue',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Women Dress - Ankara',
                'description' => "Beautiful ankara dress. Good material. Nice for parties and events. Size 40.",
                'short_description' => 'Ankara Dress',
                'price' => 25000,
                'condition' => 'new',
                'category' => 'women-clothing',
                'subcategory' => 'women-clothing',
                'images' => ['ads/fashion/ankara_dress_1.jpg', 'ads/fashion/ankara_dress_2.jpg'],
                'specifications' => [
                    'size' => '40',
                    'color' => 'Multi',
                    'material' => 'Ankara',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Backpack - adidas',
                'description' => "adidas backpack. Good for school and travel. Laptop compartment. Durable material.",
                'short_description' => 'adidas Backpack',
                'price' => 15000,
                'condition' => 'new',
                'category' => 'bags',
                'subcategory' => 'bags',
                'images' => ['ads/fashion/adidas_backpack_1.jpg', 'ads/fashion/adidas_backpack_2.jpg'],
                'specifications' => [
                    'brand' => 'adidas',
                    'type' => 'Backpack',
                    'condition' => 'New',
                ]
            ],

            // FURNITURE (4 ads)
            [
                'title' => '3-Seater Sofa - Fabric',
                'description' => "Good 3-seater sofa. Clean fabric. Good for sitting room. No tear. Strong.",
                'short_description' => '3-Seater Sofa',
                'price' => 120000,
                'condition' => 'good',
                'category' => 'furniture',
                'subcategory' => 'furniture',
                'images' => ['ads/furniture/sofa_3seater_1.jpg', 'ads/furniture/sofa_3seater_2.jpg'],
                'specifications' => [
                    'type' => 'Sofa',
                    'seats' => 3,
                    'material' => 'Fabric',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Dining Table - 6 Chairs',
                'description' => "Dining table with 6 chairs. Good wood. Good for family. No scratch. Solid.",
                'short_description' => 'Dining Table 6 Chairs',
                'price' => 180000,
                'condition' => 'good',
                'category' => 'furniture',
                'subcategory' => 'furniture',
                'images' => ['ads/furniture/dining_table_1.jpg', 'ads/furniture/dining_table_2.jpg', 'ads/furniture/dining_table_3.jpg'],
                'specifications' => [
                    'type' => 'Dining Set',
                    'chairs' => 6,
                    'material' => 'Wood',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Queen Size Bed with Mattress',
                'description' => "Queen size bed with mattress. Good quality. Strong frame. Mattress comfortable.",
                'short_description' => 'Queen Bed',
                'price' => 145000,
                'condition' => 'good',
                'category' => 'furniture',
                'subcategory' => 'furniture',
                'images' => ['ads/furniture/queen_bed_1.jpg', 'ads/furniture/queen_bed_2.jpg'],
                'specifications' => [
                    'type' => 'Bed',
                    'size' => 'Queen',
                    'material' => 'Wood',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Office Chair - Ergonomic',
                'description' => "Ergonomic office chair. Good for back. Adjustable. Good for long hours work.",
                'short_description' => 'Office Chair',
                'price' => 65000,
                'condition' => 'like_new',
                'category' => 'furniture',
                'subcategory' => 'furniture',
                'images' => ['ads/furniture/office_chair_1.jpg', 'ads/furniture/office_chair_2.jpg'],
                'specifications' => [
                    'type' => 'Office Chair',
                    'material' => 'Mesh',
                    'condition' => 'Like New',
                ]
            ],

            // KITCHEN APPLIANCES (3 ads)
            [
                'title' => 'LG Refrigerator - Double Door',
                'description' => "LG double door fridge. Working well. Freezer cold. Clean inside. Energy saving.",
                'short_description' => 'LG Double Door Fridge',
                'price' => 185000,
                'condition' => 'good',
                'category' => 'large-appliances',
                'subcategory' => 'large-appliances',
                'images' => ['ads/appliances/lg_fridge_1.jpg', 'ads/appliances/lg_fridge_2.jpg'],
                'specifications' => [
                    'brand' => 'LG',
                    'type' => 'Refrigerator',
                    'capacity' => 'Double Door',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Samsung Washing Machine',
                'description' => "Samsung front loader washing machine. Working well. Good for clothes. Auto.",
                'short_description' => 'Samsung Washing Machine',
                'price' => 145000,
                'condition' => 'good',
                'category' => 'large-appliances',
                'subcategory' => 'large-appliances',
                'images' => ['ads/appliances/washing_machine_1.jpg', 'ads/appliances/washing_machine_2.jpg'],
                'specifications' => [
                    'brand' => 'Samsung',
                    'type' => 'Washing Machine',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Microwave Oven - LG',
                'description' => "LG microwave oven. Working well. Good for heating food. Easy to use.",
                'short_description' => 'LG Microwave',
                'price' => 45000,
                'condition' => 'good',
                'category' => 'small-appliances',
                'subcategory' => 'small-appliances',
                'images' => ['ads/appliances/microwave_1.jpg', 'ads/appliances/microwave_2.jpg'],
                'specifications' => [
                    'brand' => 'LG',
                    'type' => 'Microwave',
                    'condition' => 'Good',
                ]
            ],

            // GENERATOR (2 ads)
            [
                'title' => 'Generac 7.5KVA Generator',
                'description' => "Generac 7.5KVA generator. Strong. Good for big house. Diesel. Starts easy.",
                'short_description' => 'Generac 7.5KVA',
                'price' => 450000,
                'condition' => 'good',
                'category' => 'large-appliances',
                'subcategory' => 'large-appliances',
                'images' => ['ads/appliances/generator_1.jpg', 'ads/appliances/generator_2.jpg'],
                'specifications' => [
                    'brand' => 'Generac',
                    'capacity' => '7.5KVA',
                    'fuel_type' => 'Diesel',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Eiger Inverter 5KVA',
                'description' => "Eiger 5KVA inverter. Good for light and fan. Silent. No fuel worry. Solar ready.",
                'short_description' => 'Eiger Inverter 5KVA',
                'price' => 650000,
                'condition' => 'new',
                'category' => 'large-appliances',
                'subcategory' => 'large-appliances',
                'images' => ['ads/appliances/inverter_1.jpg', 'ads/appliances/inverter_2.jpg', 'ads/appliances/inverter_3.jpg'],
                'specifications' => [
                    'brand' => 'Eiger',
                    'capacity' => '5KVA',
                    'type' => 'Inverter',
                    'condition' => 'New',
                ]
            ],

            // JOBS (4 ads)
            [
                'title' => 'Sales Executive Needed - Lagos',
                'description' => "We need sales executive. Experience required. Good communication. Commission based. Apply now.",
                'short_description' => 'Sales Executive',
                'price' => 80000,
                'condition' => 'new',
                'category' => 'full-time',
                'subcategory' => 'full-time',
                'images' => ['ads/jobs/sales_executive_1.jpg'],
                'specifications' => [
                    'job_title' => 'Sales Executive',
                    'job_type' => 'Full-time',
                    'salary' => '₦80,000 + Commission',
                    'experience' => '1-2 years',
                    'location' => 'Lagos',
                ]
            ],
            [
                'title' => 'Graphics Designer - Remote',
                'description' => "Remote graphics designer needed. Good portfolio. Can work from home. Flexible hours. Apply.",
                'short_description' => 'Remote Graphics Designer',
                'price' => 120000,
                'condition' => 'new',
                'category' => 'remote',
                'subcategory' => 'remote',
                'images' => ['ads/jobs/graphics_designer_1.jpg'],
                'specifications' => [
                    'job_title' => 'Graphics Designer',
                    'job_type' => 'Remote',
                    'salary' => '₦120,000',
                    'experience' => '1 year',
                    'location' => 'Remote',
                ]
            ],
            [
                'title' => 'Internships for NYSC - Marketer',
                'description' => "Marketing internship for serving NYSC. Good learning. Stipend available. Apply now.",
                'short_description' => 'Marketing Internship',
                'price' => 40000,
                'condition' => 'new',
                'category' => 'internships',
                'subcategory' => 'internships',
                'images' => ['ads/jobs/intern_1.jpg'],
                'specifications' => [
                    'job_title' => 'Marketing Intern',
                    'job_type' => 'Internship',
                    'salary' => 'Stipend',
                    'experience' => 'Fresh',
                    'location' => 'Abuja',
                ]
            ],
            [
                'title' => 'Part-time Driver - Lekki',
                'description' => "Part-time driver needed. Weekend work. Must know Lagos roads. Experience required.",
                'short_description' => 'Part-time Driver',
                'price' => 60000,
                'condition' => 'new',
                'category' => 'part-time',
                'subcategory' => 'part-time',
                'images' => ['ads/jobs/driver_1.jpg'],
                'specifications' => [
                    'job_title' => 'Driver',
                    'job_type' => 'Part-time',
                    'salary' => '₦60,000',
                    'experience' => '3 years',
                    'location' => 'Lekki, Lagos',
                ]
            ],

            // SERVICES (4 ads)
            [
                'title' => 'AC Repair & Maintenance',
                'description' => "Expert AC repair and maintenance. All brands. Good service. Call for booking. Lagos and Abuja.",
                'short_description' => 'AC Repair Service',
                'price' => 15000,
                'condition' => 'new',
                'category' => 'repair',
                'subcategory' => 'repair',
                'images' => ['ads/services/ac_repair_1.jpg', 'ads/services/ac_repair_2.jpg'],
                'specifications' => [
                    'service_type' => 'AC Repair',
                    'availability' => '24/7',
                    'location' => 'Lagos, Abuja',
                ]
            ],
            [
                'title' => 'House Cleaning Service',
                'description' => "Professional house cleaning. Deep clean available. Good products. Weekly and monthly. Book now.",
                'short_description' => 'House Cleaning',
                'price' => 8000,
                'condition' => 'new',
                'category' => 'cleaning',
                'subcategory' => 'cleaning',
                'images' => ['ads/services/cleaning_1.jpg', 'ads/services/cleaning_2.jpg'],
                'specifications' => [
                    'service_type' => 'Cleaning',
                    'availability' => 'Mon-Sat',
                    'location' => 'Lagos',
                ]
            ],
            [
                'title' => 'Moving & Logistics',
                'description' => "Moving service. Clean van. Reliable. Good rates. House and office relocation.",
                'short_description' => 'Moving Service',
                'price' => 12000,
                'condition' => 'new',
                'category' => 'moving',
                'subcategory' => 'moving',
                'images' => ['ads/services/moving_1.jpg', 'ads/services/moving_2.jpg'],
                'specifications' => [
                    'service_type' => 'Moving',
                    'availability' => 'Daily',
                    'location' => 'Lagos',
                ]
            ],
            [
                'title' => 'Event Planning Service',
                'description' => "Professional event planning. Weddings, birthdays, corporate. Full package. Good prices.",
                'short_description' => 'Event Planning',
                'price' => 50000,
                'condition' => 'new',
                'category' => 'events',
                'subcategory' => 'events',
                'images' => ['ads/services/event_1.jpg', 'ads/services/event_2.jpg'],
                'specifications' => [
                    'service_type' => 'Event Planning',
                    'availability' => 'Booking Open',
                    'location' => 'Nationwide',
                ]
            ],

            // PETS (4 ads)
            [
                'title' => 'German Shepherd Puppy',
                'description' => "German Shepherd puppy. 3 months old. Vaccinated. Good pedigree. Active. Loyal dog.",
                'short_description' => 'German Shepherd Puppy',
                'price' => 150000,
                'condition' => 'new',
                'category' => 'dogs',
                'subcategory' => 'dogs',
                'images' => ['ads/pets/german_shepherd_1.jpg', 'ads/pets/german_shepherd_2.jpg'],
                'specifications' => [
                    'breed' => 'German Shepherd',
                    'age' => '3 months',
                    'gender' => 'Male',
                    'vaccinated' => 'Yes',
                ]
            ],
            [
                'title' => 'Bull Mastiff',
                'description' => "Bull Mastiff. Big and strong. Guard dog. Good for security. Vaccinated.",
                'short_description' => 'Bull Mastiff',
                'price' => 200000,
                'condition' => 'new',
                'category' => 'dogs',
                'subcategory' => 'dogs',
                'images' => ['ads/pets/bull_mastiff_1.jpg', 'ads/pets/bull_mastiff_2.jpg'],
                'specifications' => [
                    'breed' => 'Bull Mastiff',
                    'age' => '4 months',
                    'gender' => 'Male',
                    'vaccinated' => 'Yes',
                ]
            ],
            [
                'title' => 'Persian Cat',
                'description' => "Persian cat. Fluffy and cute. Good for home. Vaccinated. Litter trained.",
                'short_description' => 'Persian Cat',
                'price' => 85000,
                'condition' => 'new',
                'category' => 'cats',
                'subcategory' => 'cats',
                'images' => ['ads/pets/persian_cat_1.jpg', 'ads/pets/persian_cat_2.jpg'],
                'specifications' => [
                    'breed' => 'Persian',
                    'age' => '2 months',
                    'gender' => 'Female',
                    'vaccinated' => 'Yes',
                ]
            ],
            [
                'title' => 'African Grey Parrot',
                'description' => "African Grey Parrot. Talking bird. Smart. Can say many words. Friendly.",
                'short_description' => 'African Grey Parrot',
                'price' => 250000,
                'condition' => 'new',
                'category' => 'birds',
                'subcategory' => 'birds',
                'images' => ['ads/pets/african_grey_1.jpg', 'ads/pets/african_grey_2.jpg'],
                'specifications' => [
                    'breed' => 'African Grey',
                    'age' => '1 year',
                    'gender' => 'Male',
                    'vaccinated' => 'Yes',
                ]
            ],

            // HEALTH & BEAUTY (3 ads)
            [
                'title' => 'Organic Skincare Set',
                'description' => "Organic skincare set. Complete package. Good for face. Natural products. No side effects.",
                'short_description' => 'Organic Skincare',
                'price' => 28000,
                'condition' => 'new',
                'category' => 'skincare',
                'subcategory' => 'skincare',
                'images' => ['ads/beauty/skincare_1.jpg', 'ads/beauty/skincare_2.jpg'],
                'specifications' => [
                    'type' => 'Skincare Set',
                    'brand' => 'Organic',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Hair Extension - Brazilian',
                'description' => "Brazilian hair extension. 20 inches. Good quality. Can be reused. Natural look.",
                'short_description' => 'Brazilian Hair',
                'price' => 35000,
                'condition' => 'new',
                'category' => 'haircare',
                'subcategory' => 'haircare',
                'images' => ['ads/beauty/hair_extension_1.jpg', 'ads/beauty/hair_extension_2.jpg'],
                'specifications' => [
                    'type' => 'Hair Extension',
                    'length' => '20 inches',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Perfume - Channel No.5',
                'description' => "Original Channel No.5 perfume. 100ml. Long lasting. Good smell. Sealed. Gift for her.",
                'short_description' => 'Chanel Perfume',
                'price' => 42000,
                'condition' => 'new',
                'category' => 'fragrances',
                'subcategory' => 'fragrances',
                'images' => ['ads/beauty/perfume_1.jpg', 'ads/beauty/perfume_2.jpg'],
                'specifications' => [
                    'brand' => 'Chanel',
                    'size' => '100ml',
                    'condition' => 'New',
                ]
            ],

            // BABY & KIDS (3 ads)
            [
                'title' => 'Baby Stroller - Graco',
                'description' => "Graco stroller. Good condition. Convertible. Can lay flat. Safe. Good for travel.",
                'short_description' => 'Graco Stroller',
                'price' => 45000,
                'condition' => 'good',
                'category' => 'strollers',
                'subcategory' => 'strollers',
                'images' => ['ads/baby/stroller_1.jpg', 'ads/baby/stroller_2.jpg'],
                'specifications' => [
                    'brand' => 'Graco',
                    'type' => 'Stroller',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Baby Crib - Wooden',
                'description' => "Wooden baby crib. Good quality. Stable. Mattress included. For newborn. Safe design.",
                'short_description' => 'Baby Crib',
                'price' => 65000,
                'condition' => 'good',
                'category' => 'baby-clothing',
                'subcategory' => 'baby-clothing',
                'images' => ['ads/baby/baby_crib_1.jpg', 'ads/baby/baby_crib_2.jpg'],
                'specifications' => [
                    'type' => 'Crib',
                    'material' => 'Wood',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Kids Bicycle with Training Wheels',
                'description' => "Kids bicycle. 16 inch. With training wheels. Good for learning. Safe. Bright color.",
                'short_description' => 'Kids Bicycle',
                'price' => 35000,
                'condition' => 'new',
                'category' => 'kids-clothing',
                'subcategory' => 'kids-clothing',
                'images' => ['ads/baby/kids_bike_1.jpg', 'ads/baby/kids_bike_2.jpg'],
                'specifications' => [
                    'size' => '16 inch',
                    'type' => 'Bicycle',
                    'condition' => 'New',
                ]
            ],

            // SPORTS (3 ads)
            [
                'title' => 'Treadmill - Manual',
                'description' => "Manual treadmill. Good for home gym. Folds. Running belt good. No electric needed.",
                'short_description' => 'Manual Treadmill',
                'price' => 95000,
                'condition' => 'good',
                'category' => 'gym-equipment',
                'subcategory' => 'gym-equipment',
                'images' => ['ads/sports/treadmill_1.jpg', 'ads/sports/treadmill_2.jpg'],
                'specifications' => [
                    'type' => 'Treadmill',
                    'power' => 'Manual',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Adjustable Dumbbells Set',
                'description' => "Adjustable dumbbells. 5-25kg. Good for home gym. Save space. Easy to adjust.",
                'short_description' => 'Adjustable Dumbbells',
                'price' => 85000,
                'condition' => 'new',
                'category' => 'fitness',
                'subcategory' => 'fitness',
                'images' => ['ads/sports/dumbbells_1.jpg', 'ads/sports/dumbbells_2.jpg'],
                'specifications' => [
                    'type' => 'Dumbbells',
                    'weight_range' => '5-25kg',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Mountain Bicycle',
                'description' => "Mountain bike. 26 inch. Good for off-road. Strong frame. All gears working. Good for adventure.",
                'short_description' => 'Mountain Bike',
                'price' => 145000,
                'condition' => 'good',
                'category' => 'bicycles',
                'subcategory' => 'bicycles',
                'images' => ['ads/sports/mountain_bike_1.jpg', 'ads/sports/mountain_bike_2.jpg'],
                'specifications' => [
                    'type' => 'Mountain Bike',
                    'size' => '26 inch',
                    'condition' => 'Good',
                ]
            ],

            // ADD MORE CARS TO FILL
            [
                'title' => 'Toyota RAV4 2019 - Foreign Used',
                'description' => "Toyota RAV4 2019. Very clean. 4WD working. Good for family and adventure. No issues.",
                'short_description' => 'Toyota RAV4 2019',
                'price' => 9500000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/toyota_rav4_1.jpg', 'ads/vehicles/toyota_rav4_2.jpg', 'ads/vehicles/toyota_rav4_3.jpg'],
                'specifications' => [
                    'brand' => 'Toyota',
                    'model' => 'RAV4',
                    'year' => '2019',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'White',
                    'mileage' => '55000',
                    'features' => ['4WD', 'Sunroof', 'Leather Seats'],
                ]
            ],
            [
                'title' => 'BMW X5 2018',
                'description' => "BMW X5 2018 foreign used. Full option. Everything working. Good for big man.",
                'short_description' => 'BMW X5 2018',
                'price' => 12000000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/bmw_x5_1.jpg', 'ads/vehicles/bmw_x5_2.jpg', 'ads/vehicles/bmw_x5_3.jpg'],
                'specifications' => [
                    'brand' => 'BMW',
                    'model' => 'X5',
                    'year' => '2018',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'Black',
                    'mileage' => '65000',
                    'features' => ['Sunroof', 'Leather Seats', 'Navigation'],
                ]
            ],
            [
                'title' => 'Kia Sorento 2017',
                'description' => "Kia Sorento 2017. 7 seater. Clean. Good for big family. No problems.",
                'short_description' => 'Kia Sorento 2017',
                'price' => 4200000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/kia_sorento_1.jpg', 'ads/vehicles/kia_sorento_2.jpg'],
                'specifications' => [
                    'brand' => 'Kia',
                    'model' => 'Sorento',
                    'year' => '2017',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'White',
                    'mileage' => '95000',
                    'features' => ['7 Seater', 'Air Bags'],
                ]
            ],
            [
                'title' => 'Mazda CX-5 2016',
                'description' => "Mazda CX-5 2016. Clean. Good fuel consumption. Nice design. Sporty look. No issues.",
                'short_description' => 'Mazda CX-5 2016',
                'price' => 3800000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/mazda_cx5_1.jpg', 'ads/vehicles/mazda_cx5_2.jpg'],
                'specifications' => [
                    'brand' => 'Mazda',
                    'model' => 'CX-5',
                    'year' => '2016',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'Red',
                    'mileage' => '85000',
                    'features' => ['Bluetooth', 'Backup Camera'],
                ]
            ],
            [
                'title' => 'Hyundai Tucson 2018',
                'description' => "Hyundai Tucson 2018. Clean and sharp. Good for daily use. Fuel efficient. No issues.",
                'short_description' => 'Hyundai Tucson 2018',
                'price' => 4500000,
                'condition' => 'good',
                'category' => 'cars',
                'subcategory' => 'cars',
                'images' => ['ads/vehicles/hyundai_tucson_1.jpg', 'ads/vehicles/hyundai_tucson_2.jpg'],
                'specifications' => [
                    'brand' => 'Hyundai',
                    'model' => 'Tucson',
                    'year' => '2018',
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Petrol',
                    'color' => 'Grey',
                    'mileage' => '72000',
                    'features' => ['Reverse Camera', 'Bluetooth'],
                ]
            ],
            // AIRPODS
            [
                'title' => 'AirPods Pro 2nd Generation',
                'description' => "AirPods Pro 2. Very clean. ANC working. Battery strong. Original. Box included.",
                'short_description' => 'AirPods Pro 2',
                'price' => 115000,
                'condition' => 'like_new',
                'category' => 'phone-accessories',
                'subcategory' => 'phone-accessories',
                'images' => ['ads/audio/airpods_pro2_1.jpg', 'ads/audio/airpods_pro2_2.jpg'],
                'specifications' => [
                    'brand' => 'Apple',
                    'model' => 'AirPods Pro 2',
                    'condition' => 'Like New',
                ]
            ],
            [
                'title' => 'AirPods 3rd Generation',
                'description' => "AirPods 3. Clean. Good sound. Spatial audio working. Box and charging.",
                'short_description' => 'AirPods 3',
                'price' => 85000,
                'condition' => 'good',
                'category' => 'phone-accessories',
                'subcategory' => 'phone-accessories',
                'images' => ['ads/audio/airpods_3_1.jpg', 'ads/audio/airpods_3_2.jpg'],
                'specifications' => [
                    'brand' => 'Apple',
                    'model' => 'AirPods 3',
                    'condition' => 'Good',
                ]
            ],
            // GAMING
            [
                'title' => 'PlayStation 5 - Disc Edition',
                'description' => "PS5 Disc Edition. New. With 2 controllers. 2 games included. Box complete.",
                'short_description' => 'PS5 Disc Edition',
                'price' => 450000,
                'condition' => 'new',
                'category' => 'gaming',
                'subcategory' => 'gaming',
                'images' => ['ads/gaming/ps5_1.jpg', 'ads/gaming/ps5_2.jpg', 'ads/gaming/ps5_3.jpg'],
                'specifications' => [
                    'brand' => 'Sony',
                    'model' => 'PS5 Disc',
                    'storage' => '825GB',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Xbox Series X',
                'description' => "Xbox Series X. New. 1TB storage. 2 controllers. 3 games included. Box complete.",
                'short_description' => 'Xbox Series X',
                'price' => 380000,
                'condition' => 'new',
                'category' => 'gaming',
                'subcategory' => 'gaming',
                'images' => ['ads/gaming/xbox_seriesx_1.jpg', 'ads/gaming/xbox_seriesx_2.jpg'],
                'specifications' => [
                    'brand' => 'Microsoft',
                    'model' => 'Xbox Series X',
                    'storage' => '1TB',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Nintendo Switch OLED',
                'description' => "Nintendo Switch OLED. New. With dock. 2 controllers. Games included.",
                'short_description' => 'Nintendo Switch OLED',
                'price' => 250000,
                'condition' => 'new',
                'category' => 'gaming',
                'subcategory' => 'gaming',
                'images' => ['ads/gaming/nintendo_switch_1.jpg', 'ads/gaming/nintendo_switch_2.jpg'],
                'specifications' => [
                    'brand' => 'Nintendo',
                    'model' => 'Switch OLED',
                    'condition' => 'New',
                ]
            ],
            // POWER BANKS
            [
                'title' => 'Anker 20000mAh Power Bank',
                'description' => "Anker 20000mAh. Fast charging. Can charge phone 4 times. Good quality. Works well.",
                'short_description' => 'Anker 20000mAh',
                'price' => 25000,
                'condition' => 'new',
                'category' => 'power-banks',
                'subcategory' => 'power-banks',
                'images' => ['ads/accessories/anker_powerbank_1.jpg', 'ads/accessories/anker_powerbank_2.jpg'],
                'specifications' => [
                    'brand' => 'Anker',
                    'capacity' => '20000mAh',
                    'condition' => 'New',
                ]
            ],
            // CAMERAS
            [
                'title' => 'Canon EOS 80D - DSLR',
                'description' => "Canon EOS 80D. Good camera for photography. 2 lenses included. Working well. Clean.",
                'short_description' => 'Canon EOS 80D',
                'price' => 320000,
                'condition' => 'good',
                'category' => 'cameras',
                'subcategory' => 'cameras',
                'images' => ['ads/cameras/canon_80d_1.jpg', 'ads/cameras/canon_80d_2.jpg', 'ads/cameras/canon_80d_3.jpg'],
                'specifications' => [
                    'brand' => 'Canon',
                    'model' => 'EOS 80D',
                    'type' => 'DSLR',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Sony A6400 Mirrorless',
                'description' => "Sony A6400. Compact camera. 4K video. Good for vlogging. Clean.",
                'short_description' => 'Sony A6400',
                'price' => 450000,
                'condition' => 'like_new',
                'category' => 'cameras',
                'subcategory' => 'cameras',
                'images' => ['ads/cameras/sony_a6400_1.jpg', 'ads/cameras/sony_a6400_2.jpg'],
                'specifications' => [
                    'brand' => 'Sony',
                    'model' => 'A6400',
                    'type' => 'Mirrorless',
                    'condition' => 'Like New',
                ]
            ],
            // ADD MORE UNIFORM DISTRIBUTION
            // More property options
            [
                'title' => '3 Bedroom Flat at Gwarinpa, Abuja',
                'description' => "3 bedroom flat in Gwarinpa. Clean and spacious. All rooms en-suite. Good security.",
                'short_description' => '3BR Flat Gwarinpa',
                'price' => 2500000,
                'condition' => 'new',
                'category' => 'apartments-rent',
                'subcategory' => 'apartments-rent',
                'images' => ['ads/property/3br_gwarinpa_1.jpg', 'ads/property/3br_gwarinpa_2.jpg'],
                'specifications' => [
                    'type' => 'Flat',
                    'bedrooms' => 3,
                    'bathrooms' => 3,
                    'furnished' => 'No',
                    'location' => 'Gwarinpa, Abuja',
                    'parking' => 'Yes',
                ]
            ],
            [
                'title' => 'Mini Warehouse at Ojota',
                'description' => "Mini warehouse in Ojota. Good for storage. Ground floor. easy access. Affordable.",
                'short_description' => 'Warehouse Ojota',
                'price' => 1800000,
                'condition' => 'new',
                'category' => 'commercial',
                'subcategory' => 'commercial',
                'images' => ['ads/property/warehouse_ojota_1.jpg', 'ads/property/warehouse_ojota_2.jpg'],
                'specifications' => [
                    'type' => 'Warehouse',
                    'size' => '200sqft',
                    'location' => 'Ojota, Lagos',
                ]
            ],
            // More services
            [
                'title' => 'Web Development Services',
                'description' => "Professional web development. WordPress, React, PHP. Good rates. Portfolio available. Call now.",
                'short_description' => 'Web Development',
                'price' => 50000,
                'condition' => 'new',
                'category' => 'digital',
                'subcategory' => 'digital',
                'images' => ['ads/services/web_dev_1.jpg'],
                'specifications' => [
                    'service_type' => 'Web Development',
                    'availability' => 'Remote',
                ]
            ],
            [
                'title' => 'CCTV Installation',
                'description' => "CCTV camera installation. 4 to 16 cameras. Remote viewing. Quality service. Lagos wide.",
                'short_description' => 'CCTV Installation',
                'price' => 35000,
                'condition' => 'new',
                'category' => 'repair',
                'subcategory' => 'repair',
                'images' => ['ads/services/cctv_1.jpg', 'ads/services/cctv_2.jpg'],
                'specifications' => [
                    'service_type' => 'CCTV',
                    'availability' => 'Lagos',
                ]
            ],
            // More electronics
            [
                'title' => 'Desktop Computer - Dell OptiPlex',
                'description' => "Dell OptiPlex desktop. i5 processor. 8GB RAM. 256GB SSD. Monitor included. Good for office.",
                'short_description' => 'Dell OptiPlex Desktop',
                'price' => 145000,
                'condition' => 'good',
                'category' => 'desktops',
                'subcategory' => 'desktops',
                'images' => ['ads/computers/dell_desktop_1.jpg', 'ads/computers/dell_desktop_2.jpg'],
                'specifications' => [
                    'brand' => 'Dell',
                    'model' => 'OptiPlex',
                    'processor' => 'Intel i5',
                    'RAM' => '8GB',
                    'condition' => 'Good',
                ]
            ],
            // More phones
            [
                'title' => 'Vivo Y22s - 128GB',
                'description' => "Vivo Y22s. Clean. 128GB. Good for everyday use. Affordable smartphone.",
                'short_description' => 'Vivo Y22s',
                'price' => 75000,
                'condition' => 'good',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/vivo_y22s_1.jpg', 'ads/phones/vivo_y22s_2.jpg'],
                'specifications' => [
                    'brand' => 'Vivo',
                    'model' => 'Y22s',
                    'storage' => '128GB',
                    'RAM' => '6GB',
                    'condition' => 'Good',
                ]
            ],
            [
                'title' => 'Nokia G50 - 128GB',
                'description' => "Nokia G50. Clean. 128GB. Good battery. Durable phone. Android update.",
                'short_description' => 'Nokia G50',
                'price' => 95000,
                'condition' => 'good',
                'category' => 'smartphones',
                'subcategory' => 'smartphones',
                'images' => ['ads/phones/nokia_g50_1.jpg', 'ads/phones/nokia_g50_2.jpg'],
                'specifications' => [
                    'brand' => 'Nokia',
                    'model' => 'G50',
                    'storage' => '128GB',
                    'RAM' => '4GB',
                    'condition' => 'Good',
                ]
            ],
            // More accessories
            [
                'title' => 'Laptop Bag - Targus',
                'description' => "Targus laptop bag. 15.6 inch. Good quality. Multiple pockets. Water resistant. Comfortable.",
                'short_description' => 'Targus Laptop Bag',
                'price' => 12000,
                'condition' => 'new',
                'category' => 'electronics-accessories',
                'subcategory' => 'electronics-accessories',
                'images' => ['ads/accessories/laptop_bag_1.jpg'],
                'specifications' => [
                    'brand' => 'Targus',
                    'size' => '15.6 inch',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Wireless Mouse - Logitech',
                'description' => "Logitech wireless mouse. Smooth tracking. Long battery. Good for laptop.",
                'short_description' => 'Logitech Mouse',
                'price' => 5500,
                'condition' => 'new',
                'category' => 'electronics-accessories',
                'subcategory' => 'electronics-accessories',
                'images' => ['ads/accessories/logitech_mouse_1.jpg'],
                'specifications' => [
                    'brand' => 'Logitech',
                    'type' => 'Wireless Mouse',
                    'condition' => 'New',
                ]
            ],
            [
                'title' => 'Phone Charger - Original',
                'description' => "Original phone charger. Fast charging. All brands. Good quality. Safe for phone.",
                'short_description' => 'Phone Charger',
                'price' => 3500,
                'condition' => 'new',
                'category' => 'chargers',
                'subcategory' => 'chargers',
                'images' => ['ads/accessories/phone_charger_1.jpg'],
                'specifications' => [
                    'type' => 'Charger',
                    'condition' => 'New',
                ]
            ],
        ];
    }
}
