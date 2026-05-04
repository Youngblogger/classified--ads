<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Ad;
use App\Models\AdImage;
use App\Models\Category;
use App\Models\Location;
use App\Models\User;
use Illuminate\Support\Str;

DB::statement('SET FOREIGN_KEY_CHECKS=0');
DB::table('ad_images')->delete();
DB::table('ads')->delete();
DB::statement('SET FOREIGN_KEY_CHECKS=1');

$adsData = [
    ['title' => 'Toyota Camry 2015 SE - Sharp Body', 'description' => 'Very clean Toyota Camry 2015 SE. Nothing to fix, engine and gear perfect. All papers complete. Just buy and drive.', 'short_description' => 'Clean Camry 2015', 'price' => 3800000, 'condition' => 'good', 'category' => 'cars', 'subcategory' => 'cars', 'images' => ['https://images.unsplash.com/photo-1621007945883-3c4d134ab4c7?w=800', 'https://images.unsplash.com/photo-1552519507-da3b142c6e34?w=800'], 'specifications' => ['brand' => 'Toyota', 'model' => 'Camry SE', 'year' => '2015', 'transmission' => 'Automatic', 'fuel_type' => 'Petrol', 'color' => 'Silver', 'mileage' => '95000']],
    ['title' => 'Honda Accord 2013 - Nigerian Used', 'description' => 'Honda Accord 2013 foreign used. Engine very sound, no knock. Body straight clean. Buy and drive go straight.', 'short_description' => 'Foreign used Honda Accord', 'price' => 3200000, 'condition' => 'good', 'category' => 'cars', 'subcategory' => 'cars', 'images' => ['https://images.unsplash.com/photo-1606611013016-969c19ba27ee?w=800', 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=800'], 'specifications' => ['brand' => 'Honda', 'model' => 'Accord', 'year' => '2013', 'transmission' => 'Automatic', 'fuel_type' => 'Petrol', 'color' => 'Black', 'mileage' => '120000']],
    ['title' => 'Lexus RX 350 2016 - Full Option', 'description' => 'Lexus RX 350 2016 foreign used. Full option, everything work. Sunroof, navigation, heated seats.', 'short_description' => 'Full option Lexus RX 350', 'price' => 18500000, 'condition' => 'like_new', 'category' => 'cars', 'subcategory' => 'cars', 'images' => ['https://images.unsplash.com/photo-1549399542-7e3f4b3a8c0b?w=800', 'https://images.unsplash.com/photo-1549317661-bd32f42a5a80?w=800'], 'specifications' => ['brand' => 'Lexus', 'model' => 'RX 350', 'year' => '2016', 'transmission' => 'Automatic', 'fuel_type' => 'Petrol', 'color' => 'White', 'mileage' => '45000']],
    ['title' => 'iPhone 13 Pro Max 256GB - Like New', 'description' => 'iPhone 13 Pro Max 256GB. Very clean, no scratch. Battery health 89%. All accessories.', 'short_description' => 'iPhone 13 Pro Max', 'price' => 420000, 'condition' => 'like_new', 'category' => 'smartphones', 'subcategory' => 'smartphones', 'images' => ['https://images.unsplash.com/photo-1632661674596-df4be0b64304?w=800', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'], 'specifications' => ['brand' => 'Apple', 'model' => 'iPhone 13 Pro Max', 'storage' => '256GB', 'RAM' => '6GB', 'battery' => '89%']],
    ['title' => 'Samsung Galaxy S22 Ultra - 256GB', 'description' => 'Samsung S22 Ultra. Very clean. S Pen working. 256GB storage. Nigerian used, well kept.', 'short_description' => 'Samsung S22 Ultra', 'price' => 280000, 'condition' => 'like_new', 'category' => 'smartphones', 'subcategory' => 'smartphones', 'images' => ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', 'https://images.unsplash.com/photo-1598321741563-84c00bfb5e12?w=800'], 'specifications' => ['brand' => 'Samsung', 'model' => 'Galaxy S22 Ultra', 'storage' => '256GB', 'RAM' => '8GB', 'battery' => '90%']],
    ['title' => 'iPhone 14 Pro 128GB - Deep Purple', 'description' => 'iPhone 14 Pro 128GB. Deep purple color. Very clean. Battery 95%. Box and charger included.', 'short_description' => 'iPhone 14 Pro', 'price' => 480000, 'condition' => 'like_new', 'category' => 'smartphones', 'subcategory' => 'smartphones', 'images' => ['https://images.unsplash.com/photo-1656508899679-e9c7e63da8df?w=800', 'https://images.unsplash.com/photo-1678247676212-a1c6f5272e04?w=800'], 'specifications' => ['brand' => 'Apple', 'model' => 'iPhone 14 Pro', 'storage' => '128GB', 'RAM' => '6GB', 'battery' => '95%']],
    ['title' => 'MacBook Pro 14 inch M2 - 512GB', 'description' => 'MacBook Pro 14 inch with M2 chip. 512GB storage. Very fast. Battery cycle 45. No scratches.', 'short_description' => 'MacBook Pro 14 M2', 'price' => 650000, 'condition' => 'like_new', 'category' => 'laptops', 'subcategory' => 'laptops', 'images' => ['https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800'], 'specifications' => ['brand' => 'Apple', 'model' => 'MacBook Pro 14 M2', 'storage' => '512GB', 'RAM' => '16GB', 'processor' => 'M2']],
    ['title' => 'Dell XPS 13 - 512GB', 'description' => 'Dell XPS 13. Good condition. 512GB SSD. Fast laptop. Good for office work.', 'short_description' => 'Dell XPS 13', 'price' => 320000, 'condition' => 'good', 'category' => 'laptops', 'subcategory' => 'laptops', 'images' => ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62bfe?w=800', 'https://images.unsplash.com/photo-1593642702821-c8ee6774d7e2?w=800'], 'specifications' => ['brand' => 'Dell', 'model' => 'XPS 13', 'storage' => '512GB', 'RAM' => '16GB', 'processor' => 'Intel i7']],
    ['title' => 'Samsung 55 inch Smart TV - 4K', 'description' => 'Samsung 55 inch Smart TV. 4K resolution. Good picture. Apps working. Remote good.', 'short_description' => 'Samsung 55 inch 4K', 'price' => 280000, 'condition' => 'good', 'category' => 'tvs', 'subcategory' => 'tvs', 'images' => ['https://images.unsplash.com/photo-1596496050827-8293e56c7dc0?w=800', 'https://images.unsplash.com/photo-1585314062340-f4a56d7681a1?w=800'], 'specifications' => ['brand' => 'Samsung', 'model' => 'Smart TV', 'size' => '55 inch', 'resolution' => '4K']],
    ['title' => '2 Bedroom Flat at Ikoyi, Lagos', 'description' => 'Clean 2 bedroom flat in Ikoyi. Well painted, tiles and ceiling. Secure area. Available now.', 'short_description' => '2BR flat Ikoyi', 'price' => 3500000, 'condition' => 'new', 'category' => 'apartments-rent', 'subcategory' => 'apartments-rent', 'images' => ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], 'specifications' => ['type' => 'Flat', 'bedrooms' => 2, 'bathrooms' => 2, 'furnished' => 'No', 'location' => 'Ikoyi, Lagos']],
    ['title' => '3 Bedroom Apartment at Victoria Island', 'description' => '3 bedroom flat in Victoria Island. Very nice finishing. All rooms en-suite. Clean.', 'short_description' => '3BR Victoria Island', 'price' => 5500000, 'condition' => 'new', 'category' => 'apartments-rent', 'subcategory' => 'apartments-rent', 'images' => ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800'], 'specifications' => ['type' => 'Apartment', 'bedrooms' => 3, 'bathrooms' => 3, 'furnished' => 'No', 'location' => 'Victoria Island, Lagos']],
    ['title' => 'Toyota Hilux 2018 - VGS Sportivo', 'description' => 'Toyota Hilux 2018 VGS. Strong engine, 4WD working. Good for rough road and village.', 'short_description' => 'Toyota Hilux 2018', 'price' => 12500000, 'condition' => 'good', 'category' => 'cars', 'subcategory' => 'cars', 'images' => ['https://images.unsplash.com/photo-1605218427368-35b0118c2c45?w=800', 'https://images.unsplash.com/photo-1621564415417-82a270e3a2c8?w=800'], 'specifications' => ['brand' => 'Toyota', 'model' => 'Hilux VGS', 'year' => '2018', 'transmission' => 'Manual', 'fuel_type' => 'Diesel', 'color' => 'White', 'mileage' => '65000']],
    ['title' => 'Mercedes Benz C300 2015', 'description' => 'Mercedes Benz C300 2015. German very good car. All function working. Just maintain well.', 'short_description' => 'Mercedes C300', 'price' => 9500000, 'condition' => 'good', 'category' => 'cars', 'subcategory' => 'cars', 'images' => ['https://images.unsplash.com/photo-1555215695-3000980afbba?w=800', 'https://images.unsplash.com/photo-1555215695-3000980afbba?w=800'], 'specifications' => ['brand' => 'Mercedes Benz', 'model' => 'C300', 'year' => '2015', 'transmission' => 'Automatic', 'fuel_type' => 'Petrol', 'color' => 'Black', 'mileage' => '85000']],
    ['title' => 'Apple Watch Series 7 - 45mm', 'description' => 'Apple Watch Series 7, 45mm. Very clean. All health features working. Box and charger.', 'short_description' => 'Apple Watch Series 7', 'price' => 145000, 'condition' => 'like_new', 'category' => 'smartwatches', 'subcategory' => 'smartwatches', 'images' => ['https://images.unsplash.com/photo-1434493789847-2f02a6f0f302?w=800', 'https://images.unsplash.com/photo-1508058198224-05bfb67f5ffd?w=800'], 'specifications' => ['brand' => 'Apple', 'model' => 'Watch Series 7', 'size' => '45mm']],
    ['title' => 'Infinix Note 12 - 128GB', 'description' => 'Infinix Note 12. Good condition. 128GB storage. All working. Cheaper than market.', 'short_description' => 'Infinix Note 12', 'price' => 95000, 'condition' => 'good', 'category' => 'smartphones', 'subcategory' => 'smartphones', 'images' => ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', 'https://images.unsplash.com/photo-1598321741563-84c00bfb5e12?w=800'], 'specifications' => ['brand' => 'Infinix', 'model' => 'Note 12', 'storage' => '128GB', 'RAM' => '8GB']],
    ['title' => 'Tecno Camon 19 - 128GB', 'description' => 'Tecno Camon 19. Clean. 128GB. Good camera. All working. Affordable.', 'short_description' => 'Tecno Camon 19', 'price' => 85000, 'condition' => 'good', 'category' => 'smartphones', 'subcategory' => 'smartphones', 'images' => ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', 'https://images.unsplash.com/photo-1598321741563-84c00bfb5e12?w=800'], 'specifications' => ['brand' => 'Tecno', 'model' => 'Camon 19', 'storage' => '128GB', 'RAM' => '6GB']],
    ['title' => 'OPPO Reno 8 - 256GB', 'description' => 'OPPO Reno 8. Very clean. 256GB. Good camera. Box complete. No issues.', 'short_description' => 'OPPO Reno 8', 'price' => 195000, 'condition' => 'like_new', 'category' => 'smartphones', 'subcategory' => 'smartphones', 'images' => ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'], 'specifications' => ['brand' => 'OPPO', 'model' => 'Reno 8', 'storage' => '256GB', 'RAM' => '8GB']],
    ['title' => 'JBL Xtreme 3 Speaker', 'description' => 'JBL Xtreme 3. Very loud speaker. Good bass. Battery last long. Waterproof.', 'short_description' => 'JBL Xtreme 3', 'price' => 95000, 'condition' => 'like_new', 'category' => 'audio', 'subcategory' => 'audio', 'images' => ['https://images.unsplash.com/photo-1608041804554-08a5c4f4f7c2?w=800', 'https://images.unsplash.com/photo-1608041804554-08a5c4f4f7c2?w=800'], 'specifications' => ['brand' => 'JBL', 'model' => 'Xtreme 3', 'type' => 'Bluetooth Speaker']],
    ['title' => 'Toyota Corolla 2012 - Standard', 'description' => 'Toyota Corolla 2012. Clean body, good engine. Nothing big to talk. Buy and drive.', 'short_description' => 'Clean Corolla 2012', 'price' => 2500000, 'condition' => 'good', 'category' => 'cars', 'subcategory' => 'cars', 'images' => ['https://images.unsplash.com/photo-1580273916558-e2963d16be43?w=800', 'https://images.unsplash.com/photo-1621007945883-3c4d134ab4c7?w=800'], 'specifications' => ['brand' => 'Toyota', 'model' => 'Corolla', 'year' => '2012', 'transmission' => 'Manual', 'fuel_type' => 'Petrol', 'color' => 'Silver', 'mileage' => '150000']],
    ['title' => 'Hyundai Sonata 2014 - Clean', 'description' => 'Hyundai Sonata 2014. Very clean. Engine perfect. No noise. All papers. Ac cool.', 'short_description' => 'Clean Hyundai Sonata', 'price' => 2800000, 'condition' => 'good', 'category' => 'cars', 'subcategory' => 'cars', 'images' => ['https://images.unsplash.com/photo-1568605117036-5fe0e4d1d9b0?w=800', 'https://images.unsplash.com/photo-1568605117036-5fe0e4d1d9b0?w=800'], 'specifications' => ['brand' => 'Hyundai', 'model' => 'Sonata', 'year' => '2014', 'transmission' => 'Automatic', 'fuel_type' => 'Petrol', 'color' => 'Grey', 'mileage' => '110000']],
];

$users = User::where('role', 'user')->get();
$locations = Location::all();

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
        'slug' => Str::slug($adData['title']) . '-' . time() . rand(100, 999),
        'description' => $adData['description'],
        'short_description' => $adData['short_description'],
        'price' => $adData['price'],
        'condition' => $adData['condition'],
        'status' => 'active',
        'attributes' => $adData['specifications'],
        'state' => $location->name,
        'lga' => $location->name,
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

echo "Created {$created} ads with real image URLs!\n";