<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NigerianAdsSeeder extends Seeder
{
    private $nigerianNames = [
        'Chinedu Okafor', 'Musa Ibrahim', 'Sola Adeyemi', 'Aisha Bello', 'Tunde Bakare',
        'Blessing Etim', 'Emeka Okonkwo', 'Fatima Yusuf', 'Oluwaseun Adebayo', 'Chioma Nwosu',
        'Ibrahim Mohammed', 'Ngozi Okeke', 'Yusuf Abdullahi', 'Kemi Ogundimu', 'Uche Okoro',
        'Hauwa Aliyu', 'Babatunde Fashola', 'Amina Sanusi', 'Chukwuma Obi', 'Zainab Hassan',
        'Femi Ogunleye', 'Adunni Williams', 'Tijani Ahmed', 'Nneka Eze', 'Abdul Rahman',
        'Folake Adeleke', 'Kelechi Okonkwo', 'Hajara Musa', 'Damilola Ojo', 'Chidinma Okafor'
    ];

    private $locations = [
        ['state' => 'Lagos', 'lga' => 'Yaba', 'location_id' => 1289],
        ['state' => 'Lagos', 'lga' => 'Lekki', 'location_id' => 1287],
        ['state' => 'Lagos', 'lga' => 'Ajah', 'location_id' => 1287],
        ['state' => 'Lagos', 'lga' => 'Ikorodu', 'location_id' => 1290],
        ['state' => 'Lagos', 'lga' => 'Surulere', 'location_id' => 1298],
        ['state' => 'Lagos', 'lga' => 'Ikeja', 'location_id' => 1289],
        ['state' => 'Abuja', 'lga' => 'Wuse', 'location_id' => 803],
        ['state' => 'Abuja', 'lga' => 'Gwarinpa', 'location_id' => 803],
        ['state' => 'Abuja', 'lga' => 'Kubwa', 'location_id' => 804],
        ['state' => 'Oyo', 'lga' => 'Ibadan', 'location_id' => 1400],
        ['state' => 'Kwara', 'lga' => 'Ilorin', 'location_id' => 1268],
        ['state' => 'Ogun', 'lga' => 'Abeokuta', 'location_id' => 1336],
        ['state' => 'Edo', 'lga' => 'Benin', 'location_id' => 1020],
        ['state' => 'Rivers', 'lga' => 'Port Harcourt', 'location_id' => 1464],
        ['state' => 'Kano', 'lga' => 'Kano', 'location_id' => 1164],
        ['state' => 'Enugu', 'lga' => 'Enugu', 'location_id' => 1045],
        ['state' => 'Delta', 'lga' => 'Warri', 'location_id' => 993],
        ['state' => 'Anambra', 'lga' => 'Onitsha', 'location_id' => 874],
        ['state' => 'Ondo', 'lga' => 'Akure', 'location_id' => 1364],
        ['state' => 'Imo', 'lga' => 'Owerri', 'location_id' => 1092]
    ];

    public function run(): void
    {
        $ads = array_merge(
            $this->getVehicleAds(),
            $this->getPropertyAds(),
            $this->getPhoneAds(),
            $this->getElectronicsAds(),
            $this->getFashionAds(),
            $this->getHomeAds(),
            $this->getJobAds(),
            $this->getServiceAds(),
            $this->getPetAds(),
            $this->getHealthAds(),
            $this->getBabyAds(),
            $this->getSportsAds()
        );

        foreach ($ads as $ad) {
            $ad['user_id'] = 1;
            $ad['phone'] = $ad['seller_phone'];
            unset($ad['seller_name']);
            unset($ad['seller_phone']);
            unset($ad['seller_verified']);
            
            $images = json_decode($ad['images'], true);
            unset($ad['images']);
            
            $adId = DB::table('ads')->insertGetId($ad);
            
            foreach ($images as $idx => $img) {
                DB::table('ad_images')->insert([
                    'ad_id' => $adId,
                    'url' => $img['url'],
                    'original_url' => $img['full_url'],
                    'medium_url' => $img['full_url'],
                    'thumbnail_url' => $img['full_url'],
                    'is_primary' => $idx === 0 ? 1 : 0,
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        $this->command->info('240 Nigerian ads seeded successfully!');
    }

    private function getVehicleAds(): array
    {
        $vehicles = [
            ['Toyota Camry 2018 Big Daddy - Full Option', '2018 Toyota Camry XSE. First body, no accident. AC very cold, engine perfect. Leather interior, sunroof. Buy and drive.', '8500000.00', 'toyota-camry-nigeria', 'car'],
            ['Lexus RX 350 2016 - Tokunbo', 'Clean Lexus RX 350. White color, black interior. Full option. Engine and gear A1. Location Lekki.', '12500000.00', 'lexus-rx-nigeria', 'car'],
            ['Honda Accord 2019 End of Discussion', '2019 Honda Accord Sport. Grey color, very clean. Nothing to fix. Serious buyer only.', '9800000.00', 'honda-accord-nigeria', 'car'],
            ['Toyota Corolla 2015 - Very Clean', '2015 Toyota Corolla LE. Silver color, engine smooth. AC working. Good for personal use.', '4200000.00', 'toyota-corolla-nigeria', 'car'],
            ['Mercedes Benz C300 2017 AMG', 'C300 AMG line. Red interior, panoramic roof. Very sharp. Come and check.', '11000000.00', 'mercedes-c300-nigeria', 'car'],
            ['Toyota Highlander 2016 Limited', 'Highlander Limited 7 seater. White on black. Full option with reverse camera.', '13500000.00', 'toyota-highlander-nigeria', 'suv'],
            ['Honda CRV 2018 - Neatly Used', '2018 CRV EX. Very fuel efficient. AC cold, no fault. Location Surulere.', '9200000.00', 'honda-crv-nigeria', 'suv'],
            ['Nissan Pathfinder 2015', 'Pathfinder SL. 7 seater, leather seats. Engine perfect. Slightly negotiable.', '7500000.00', 'nissan-pathfinder-nigeria', 'suv'],
            ['Toyota Sienna 2014 XLE', 'Sienna XLE 8 seater. Very clean interior. AC blowing cold. Family car.', '8800000.00', 'toyota-sienna-nigeria', 'van'],
            ['Volkswagen Golf 2016 TSI', 'Golf TSI Turbo. Very fast, fuel efficient. Neatly used. Last price.', '5500000.00', 'volkswagen-golf-nigeria', 'car'],
            ['Hyundai Sonata 2017 - Full Option', 'Sonata Limited. Sunroof, leather, reverse camera. Very sharp car.', '6200000.00', 'hyundai-sonata-nigeria', 'car'],
            ['Kia Rio 2016 - Tokunbo', '2016 Kia Rio. Very fuel efficient. AC working. Good for Uber.', '3800000.00', 'kia-rio-nigeria', 'car'],
            ['Toyota Avalon 2016 Limited', 'Avalon Limited. Full option, very clean. Engine and gear A1.', '7800000.00', 'toyota-avalon-nigeria', 'car'],
            ['Ford Edge 2017 SEL', 'Ford Edge SEL. AWD, leather seats. Very neat. Come test drive.', '8500000.00', 'ford-edge-nigeria', 'suv'],
            ['Acura MDX 2016 - 7 Seater', 'MDX Technology Package. Very clean, full option. Location Ikeja.', '10500000.00', 'acura-mdx-nigeria', 'suv'],
            ['Infiniti FX35 2014', 'FX35 AWD. Very fast SUV. Engine perfect. Slightly negotiable.', '6800000.00', 'infiniti-fx35-nigeria', 'suv'],
            ['Toyota RAV4 2018 - Clean Title', '2018 RAV4 XLE. White color, very neat. AC cold, no fault.', '9500000.00', 'toyota-rav4-nigeria', 'suv'],
            ['Mazda CX-5 2017 Grand Touring', 'CX-5 GT. Leather, sunroof, Bose sound. Very sharp.', '7200000.00', 'mazda-cx5-nigeria', 'suv'],
            ['Chevrolet Equinox 2018', 'Equinox LT. Very fuel efficient. Clean title, no accident.', '6500000.00', 'chevrolet-equinox-nigeria', 'suv'],
            ['GMC Terrain 2017 SLE', 'Terrain SLE. Spacious interior, very neat. Engine smooth.', '7000000.00', 'gmc-terrain-nigeria', 'suv']
        ];

        return array_map(function($v, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $v[0],
                'description' => $v[1],
                'short_description' => substr($v[1], 0, 100) . '...',
                'price' => $v[2],
                'currency' => 'NGN',
                'category_id' => 1,
                'condition' => ['new', 'like_new', 'good', 'fair'][array_rand(['new', 'like_new', 'good', 'fair'])],
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $v[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $v[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?car', 'full_url' => 'https://source.unsplash.com/featured/800x600/?car']
                ]),
                'seller_name' => $this->nigerianNames[$i % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($v[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $vehicles, array_keys($vehicles));
    }

    private function getPropertyAds(): array
    {
        $properties = [
            ['Self Contain Room - Yaba', 'Self contain room with running water. Tiled floor, POP ceiling. Near UNILAG. Rent 180k per year.', '180000.00', 'self-contain-yaba', 'rental'],
            ['Mini Flat - Lekki Phase 1', 'Spacious mini flat. Fitted kitchen, water heater. 24hrs light. Rent 1.2M per year.', '1200000.00', 'mini-flat-lekki', 'rental'],
            ['3 Bedroom Flat - Surulere', '3 bedroom flat with boys quarter. Good neighborhood. Rent 800k per year.', '800000.00', '3bedroom-surulere', 'rental'],
            ['Shop Space - Ikeja Computer Village', 'Shop space inside Computer Village. Good for phone business. Rent 500k per year.', '500000.00', 'shop-ikeja', 'commercial'],
            ['Office Space - Wuse 2 Abuja', 'Office space in Wuse 2. Air conditioned, 24hrs security. Rent 2M per year.', '2000000.00', 'office-wuse', 'commercial'],
            ['Land for Sale - Ibeju Lekki', 'Plot of land at Ibeju Lekki. Dry land, good title. Good investment.', '3500000.00', 'land-ibeju-lekki', 'sale'],
            ['2 Bedroom Flat - Ajah', '2 bedroom flat with balcony. Good road access. Rent 450k per year.', '450000.00', '2bedroom-ajah', 'rental'],
            ['Room and Parlor - Ikorodu', 'Room and parlor self contain. Tiled, POP. Rent 150k per year.', '150000.00', 'room-parlor-ikorodu', 'rental'],
            ['4 Bedroom Duplex - Gwarinpa', '4 bedroom detached duplex. BQ, fitted kitchen. Rent 5M per year.', '5000000.00', 'duplex-gwarinpa', 'rental'],
            ['Warehouse - Ikorodu', 'Warehouse space 500sqm. Good for storage. Rent 3M per year.', '3000000.00', 'warehouse-ikorodu', 'commercial'],
            ['Studio Apartment - Yaba', 'Studio apartment near UNILAG. Good for student. Rent 120k per year.', '120000.00', 'studio-yaba', 'rental'],
            ['1 Bedroom Flat - Kubwa Abuja', '1 bedroom flat in Kubwa. Tiled, water supply. Rent 200k per year.', '200000.00', '1bedroom-kubwa', 'rental'],
            ['Shop - Balogun Market', 'Shop space at Balogun Market. Good for fabric business. Rent 300k per year.', '300000.00', 'shop-balogun', 'commercial'],
            ['Land - Mowe Ofada', 'Plot of land at Mowe Ofada. Dry land, good title. 800k per plot.', '800000.00', 'land-mowe', 'sale'],
            ['5 Bedroom House - Ikeja GRA', '5 bedroom house at Ikeja GRA. Swimming pool, garden. Rent 15M per year.', '15000000.00', 'house-ikeja-gra', 'rental'],
            ['Office Space - VI Lagos', 'Office space in Victoria Island. Premium location. Rent 8M per year.', '8000000.00', 'office-vi', 'commercial'],
            ['2 Bedroom Flat - Wuse Abuja', '2 bedroom flat in Wuse. Good condition. Rent 600k per year.', '600000.00', '2bedroom-wuse', 'rental'],
            ['Self Contain - Ibadan', 'Self contain room at Ibadan. Clean, water supply. Rent 80k per year.', '80000.00', 'self-contain-ibadan', 'rental'],
            ['3 Bedroom Flat - Port Harcourt', '3 bedroom flat at PH. Tiled, fitted kitchen. Rent 700k per year.', '700000.00', '3bedroom-ph', 'rental'],
            ['Land - Epe Lagos', 'Plot of land at Epe. Good for investment. 500k per plot.', '500000.00', 'land-epe', 'sale']
        ];

        return array_map(function($p, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $p[0],
                'description' => $p[1],
                'short_description' => substr($p[1], 0, 100) . '...',
                'price' => $p[2],
                'currency' => 'NGN',
                'category_id' => 2,
                'condition' => 'good',
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $p[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $p[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?house', 'full_url' => 'https://source.unsplash.com/featured/800x600/?house']
                ]),
                'seller_name' => $this->nigerianNames[($i + 5) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($p[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $properties, array_keys($properties));
    }

    private function getPhoneAds(): array
    {
        $phones = [
            ['iPhone 13 Pro Max 256GB - UK Used', 'iPhone 13 Pro Max 256GB. UK used, very clean. Battery health 90%. No crack.', '450000.00', 'iphone-13-pro-max', 'phone'],
            ['Samsung Galaxy S21 Ultra', 'S21 Ultra 256GB. Neatly used. All functions working. Come and check.', '280000.00', 'samsung-s21-ultra', 'phone'],
            ['Tecno Camon 20 Pro', 'Camon 20 Pro 256GB. Brand new, sealed. 1 year warranty.', '180000.00', 'tecno-camon-20', 'phone'],
            ['Infinix Note 30 Pro', 'Note 30 Pro 128GB. Very neat, battery lasting. Charger included.', '95000.00', 'infinix-note-30', 'phone'],
            ['iPhone 11 128GB - UK Used', 'iPhone 11 128GB. UK used, clean body. Battery health 85%. No face ID.', '180000.00', 'iphone-11', 'phone'],
            ['Samsung Galaxy A54 5G', 'A54 5G 128GB. Brand new in box. 1 year warranty.', '220000.00', 'samsung-a54', 'phone'],
            ['Itel S23+', 'Itel S23+ 128GB. New condition. Good budget phone.', '55000.00', 'itel-s23', 'phone'],
            ['iPhone 14 Pro 256GB', 'iPhone 14 Pro 256GB. UK used, very sharp. Battery health 92%.', '550000.00', 'iphone-14-pro', 'phone'],
            ['Tecno Spark 10 Pro', 'Spark 10 Pro 128GB. Neatly used. Good condition.', '65000.00', 'tecno-spark-10', 'phone'],
            ['Samsung Galaxy A14', 'A14 64GB. Brand new sealed. Good entry level phone.', '85000.00', 'samsung-a14', 'phone'],
            ['Infinix Hot 30', 'Hot 30 128GB. Very neat. Battery lasting well.', '75000.00', 'infinix-hot-30', 'phone'],
            ['iPhone 12 64GB - UK Used', 'iPhone 12 64GB. UK used, clean. Battery health 88%.', '250000.00', 'iphone-12', 'phone'],
            ['Samsung Galaxy S22', 'S22 128GB. Neatly used. All functions working.', '320000.00', 'samsung-s22', 'phone'],
            ['Tecno Pova 5 Pro', 'Pova 5 Pro 256GB. Brand new. Gaming phone.', '135000.00', 'tecno-pova-5', 'phone'],
            ['Infinix Zero 30 5G', 'Zero 30 5G 256GB. Very neat. Fast phone.', '165000.00', 'infinix-zero-30', 'phone'],
            ['iPhone XR 64GB - UK Used', 'iPhone XR 64GB. UK used. Battery health 82%. No crack.', '120000.00', 'iphone-xr', 'phone'],
            ['Samsung Galaxy A34', 'A34 128GB. Brand new in box. 5G phone.', '175000.00', 'samsung-a34', 'phone'],
            ['Itel A60s', 'Itel A60s 64GB. New condition. Budget phone.', '35000.00', 'itel-a60s', 'phone'],
            ['iPhone 13 128GB', 'iPhone 13 128GB. UK used, very clean. Battery health 89%.', '350000.00', 'iphone-13', 'phone'],
            ['Tecno Camon 19 Pro', 'Camon 19 Pro 128GB. Neatly used. Good camera phone.', '95000.00', 'tecno-camon-19', 'phone']
        ];

        return array_map(function($p, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $p[0],
                'description' => $p[1],
                'short_description' => substr($p[1], 0, 100) . '...',
                'price' => $p[2],
                'currency' => 'NGN',
                'category_id' => 3,
                'condition' => strpos($p[0], 'UK Used') !== false ? 'good' : 'new',
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $p[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $p[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?phone', 'full_url' => 'https://source.unsplash.com/featured/800x600/?phone']
                ]),
                'seller_name' => $this->nigerianNames[($i + 10) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($p[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $phones, array_keys($phones));
    }

    private function getElectronicsAds(): array
    {
        $electronics = [
            ['LG 55" Smart TV 4K', 'LG 55 inch Smart TV 4K. Very sharp picture. Remote and stand included.', '280000.00', 'lg-smart-tv', 'tv'],
            ['Hisense 43" Android TV', 'Hisense 43 inch Android TV. Netflix, YouTube. Good condition.', '145000.00', 'hisense-tv', 'tv'],
            ['I Better Pass My Neighbor Generator', '3.5KVA generator. Very powerful. Engine smooth. Light your whole house.', '185000.00', 'generator-nigeria', 'generator'],
            ['Samsung 65" QLED TV', 'Samsung 65 inch QLED. 4K Smart TV. Very sharp. Remote included.', '520000.00', 'samsung-qled', 'tv'],
            ['Polystar 32" TV', 'Polystar 32 inch TV. Good condition. Remote working.', '65000.00', 'polystar-tv', 'tv'],
            ['Nexus 50" Smart TV', 'Nexus 50 inch Smart TV. Android TV. Good picture quality.', '175000.00', 'nexus-tv', 'tv'],
            ['TCL 40" Android TV', 'TCL 40 inch Android TV. Netflix ready. Good condition.', '125000.00', 'tcl-tv', 'tv'],
            ['Sumec Firman Generator 2.5KVA', 'Sumec Firman 2.5KVA. Very neat. Engine perfect. Light house.', '145000.00', 'sumec-firman', 'generator'],
            ['LG 43" Smart TV', 'LG 43 inch Smart TV. WebOS. Good condition. Remote included.', '155000.00', 'lg-43-tv', 'tv'],
            ['Hisense 55" Smart TV', 'Hisense 55 inch Smart TV. 4K UHD. Very sharp.', '235000.00', 'hisense-55', 'tv'],
            ['Tiger Generator 3.5KVA', 'Tiger 3.5KVA generator. Powerful engine. Good for house.', '165000.00', 'tiger-generator', 'generator'],
            ['Sony 50" Bravia TV', 'Sony 50 inch Bravia. 4K HDR. Very sharp picture.', '295000.00', 'sony-bravia', 'tv'],
            ['Hisense 32" TV', 'Hisense 32 inch TV. Good condition. Remote working.', '72000.00', 'hisense-32', 'tv'],
            ['Nexus 43" Smart TV', 'Nexus 43 inch Smart TV. Android. Good picture.', '135000.00', 'nexus-43', 'tv'],
            ['Binatone Generator 1.5KVA', 'Binatone 1.5KVA. Small generator. Good for shop.', '85000.00', 'binatone-generator', 'generator'],
            ['Samsung 50" Crystal UHD', 'Samsung 50 inch Crystal UHD. 4K Smart TV. Very neat.', '265000.00', 'samsung-crystal', 'tv'],
            ['LG 32" TV', 'LG 32 inch TV. Good condition. Picture clear.', '78000.00', 'lg-32-tv', 'tv'],
            ['Polystar 40" Smart TV', 'Polystar 40 inch Smart TV. Android. Good condition.', '145000.00', 'polystar-40', 'tv'],
            ['Honda Generator 5KVA', 'Honda 5KVA generator. Very powerful. Engine A1.', '285000.00', 'honda-generator', 'generator'],
            ['TCL 55" 4K TV', 'TCL 55 inch 4K TV. Android TV. Very sharp.', '215000.00', 'tcl-55', 'tv']
        ];

        return array_map(function($e, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $e[0],
                'description' => $e[1],
                'short_description' => substr($e[1], 0, 100) . '...',
                'price' => $e[2],
                'currency' => 'NGN',
                'category_id' => 4,
                'condition' => ['new', 'like_new', 'good'][array_rand(['new', 'like_new', 'good'])],
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $e[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $e[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?electronics', 'full_url' => 'https://source.unsplash.com/featured/800x600/?electronics']
                ]),
                'seller_name' => $this->nigerianNames[($i + 15) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($e[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $electronics, array_keys($electronics));
    }

    private function getFashionAds(): array
    {
        $fashion = [
            ['Ankara Gown - Ready to Wear', 'Beautiful Ankara gown. Size M. Ready to wear. Very neat.', '15000.00', 'ankara-gown-nigeria', 'dress'],
            ['Human Hair Wig 20 inches', 'Human hair wig 20 inches. Very natural. Can style anyway.', '85000.00', 'human-hair-wig', 'wig'],
            ['Senator Wear - Complete Set', 'Senator wear complete. Shirt and trouser. Size L. Very sharp.', '35000.00', 'senator-wear', 'men'],
            ['Palm Slippers - Original', 'Original palm slippers. Very comfortable. All sizes available.', '8000.00', 'palm-slippers', 'shoes'],
            ['Lace Fabric - 5 Yards', 'Original lace fabric. 5 yards. Very neat. Good for owambe.', '45000.00', 'lace-fabric', 'fabric'],
            ['Nike Air Force 1 - Original', 'Nike Air Force 1. Original. Size 42. Very clean.', '35000.00', 'nike-air-force', 'shoes'],
            ['Bubu Gown - Plus Size', 'Bubu gown plus size. Very comfortable. Good for home wear.', '12000.00', 'bubu-gown', 'dress'],
            ['Men\'s Cap - Traditional', 'Traditional men\'s cap. Very neat. Good for occasions.', '5000.00', 'mens-cap', 'accessories'],
            ['Adidas Slides - Original', 'Adidas slides original. Size 43. Very comfortable.', '18000.00', 'adidas-slides', 'shoes'],
            ['Guinea Lace - 6 Yards', 'Guinea lace 6 yards. Very neat. Good for wedding.', '55000.00', 'guinea-lace', 'fabric'],
            ['Kaftan - Senator Style', 'Senator kaftan. Size XL. Very sharp. Ready to wear.', '28000.00', 'kaftan-senator', 'men'],
            ['Braided Wig - Knotless', 'Knotless braided wig. Very natural. Easy to wear.', '25000.00', 'braided-wig', 'wig'],
            ['Timberland Boots - Original', 'Timberland boots original. Size 44. Very neat.', '65000.00', 'timberland-boots', 'shoes'],
            ['Aso Oke - Complete Set', 'Aso Oke complete set. Very neat. Good for traditional wedding.', '75000.00', 'aso-oke', 'fabric'],
            ['Polo Shirt - Ralph Lauren', 'Ralph Lauren polo. Size L. Original. Very clean.', '22000.00', 'ralph-lauren-polo', 'men'],
            ['Converse Sneakers - Original', 'Converse sneakers original. Size 40. Very neat.', '28000.00', 'converse-sneakers', 'shoes'],
            ['Swiss Lace - 5 Yards', 'Swiss lace 5 yards. Very neat. Good for church.', '38000.00', 'swiss-lace', 'fabric'],
            ['Agbada - Complete Set', 'Agbada complete set. Size XXL. Very sharp. Ready to wear.', '55000.00', 'agbada-set', 'men'],
            ['Vans Old Skool - Original', 'Vans Old Skool original. Size 41. Very clean.', '32000.00', 'vans-old-skool', 'shoes'],
            ['Velvet Fabric - 7 Yards', 'Velvet fabric 7 yards. Very neat. Good for gown.', '42000.00', 'velvet-fabric', 'fabric']
        ];

        return array_map(function($f, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $f[0],
                'description' => $f[1],
                'short_description' => substr($f[1], 0, 100) . '...',
                'price' => $f[2],
                'currency' => 'NGN',
                'category_id' => 5,
                'condition' => ['new', 'like_new'][array_rand(['new', 'like_new'])],
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $f[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $f[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?fashion', 'full_url' => 'https://source.unsplash.com/featured/800x600/?fashion']
                ]),
                'seller_name' => $this->nigerianNames[($i + 20) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($f[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $fashion, array_keys($fashion));
    }

    private function getHomeAds(): array
    {
        $home = [
            ['Plastic Chair - Strong', 'Strong plastic chair. Good for event. Bulk purchase available.', '3500.00', 'plastic-chair', 'furniture'],
            ['Center Table - Glass Top', 'Glass top center table. Very neat. Good for sitting room.', '45000.00', 'center-table', 'furniture'],
            ['Gas Cooker - 4 Burner', '4 burner gas cooker. Very neat. All burners working.', '35000.00', 'gas-cooker', 'appliance'],
            ['Double Bed Mattress', 'Double bed mattress. Very comfortable. Good condition.', '55000.00', 'double-mattress', 'furniture'],
            ['Wardrobe - 4 Door', '4 door wardrobe. Spacious. Good condition. Come and take.', '85000.00', 'wardrobe-4door', 'furniture'],
            ['Freezer - 200 Liters', '200 liters freezer. Working perfectly. Good for business.', '125000.00', 'freezer-200l', 'appliance'],
            ['Dining Table - 6 Seater', '6 seater dining table. Very neat. Good for family.', '95000.00', 'dining-table-6', 'furniture'],
            ['Washing Machine - LG 7kg', 'LG 7kg washing machine. Working perfectly. Good condition.', '85000.00', 'lg-washing', 'appliance'],
            ['Sofa Set - 7 Seater', '7 seater sofa set. Very comfortable. Good condition.', '145000.00', 'sofa-7seater', 'furniture'],
            ['Fridge - Samsung Double Door', 'Samsung double door fridge. Working perfectly. Very neat.', '165000.00', 'samsung-fridge', 'appliance'],
            ['Bookshelf - Wooden', 'Wooden bookshelf. Very neat. Good for office.', '35000.00', 'bookshelf-wood', 'furniture'],
            ['Microwave Oven - Samsung', 'Samsung microwave oven. Working perfectly. Good condition.', '45000.00', 'samsung-microwave', 'appliance'],
            ['Office Chair - Executive', 'Executive office chair. Very comfortable. Good condition.', '55000.00', 'office-chair', 'furniture'],
            ['Blender - Philips', 'Philips blender. Working perfectly. Good for smoothies.', '25000.00', 'philips-blender', 'appliance'],
            ['Shoe Rack - 5 Tier', '5 tier shoe rack. Very neat. Good for organizing.', '18000.00', 'shoe-rack', 'furniture'],
            ['Iron - Philips Steam', 'Philips steam iron. Working perfectly. Good condition.', '15000.00', 'philips-iron', 'appliance'],
            ['TV Stand - Modern', 'Modern TV stand. Very neat. Good for 55 inch TV.', '42000.00', 'tv-stand', 'furniture'],
            ['Rice Cooker - 1.8L', '1.8L rice cooker. Working perfectly. Good for home.', '12000.00', 'rice-cooker', 'appliance'],
            ['Curtain - Full Set', 'Full set curtain. Very neat. Good for 2 windows.', '28000.00', 'curtain-set', 'home'],
            ['Vacuum Cleaner - Philips', 'Philips vacuum cleaner. Working perfectly. Good condition.', '55000.00', 'philips-vacuum', 'appliance']
        ];

        return array_map(function($h, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $h[0],
                'description' => $h[1],
                'short_description' => substr($h[1], 0, 100) . '...',
                'price' => $h[2],
                'currency' => 'NGN',
                'category_id' => 6,
                'condition' => ['new', 'like_new', 'good'][array_rand(['new', 'like_new', 'good'])],
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $h[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $h[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?furniture', 'full_url' => 'https://source.unsplash.com/featured/800x600/?furniture']
                ]),
                'seller_name' => $this->nigerianNames[($i + 25) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($h[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $home, array_keys($home));
    }

    private function getJobAds(): array
    {
        $jobs = [
            ['Sales Girl Needed - Urgent', 'Sales girl needed for shop. Salary 40k monthly. Must be honest. Location Surulere.', '40000.00', 'sales-girl', 'job'],
            ['Driver Wanted - Company Driver', 'Company driver needed. Must have valid license. Salary 60k monthly.', '60000.00', 'company-driver', 'job'],
            ['Cleaner Needed - Office', 'Office cleaner needed. Morning shift. Salary 30k monthly.', '30000.00', 'office-cleaner', 'job'],
            ['POS Attendant - Lekki', 'POS attendant needed. Must be trustworthy. Salary 35k monthly.', '35000.00', 'pos-attendant', 'job'],
            ['Receptionist - Hotel', 'Hotel receptionist needed. Must be presentable. Salary 50k monthly.', '50000.00', 'receptionist', 'job'],
            ['Accountant - Small Business', 'Accountant needed for small business. Salary 70k monthly.', '70000.00', 'accountant', 'job'],
            ['Security Guard - Estate', 'Security guard needed for estate. Salary 35k monthly.', '35000.00', 'security-guard', 'job'],
            ['Waiter/Waitress - Restaurant', 'Waiter/waitress needed. Must have experience. Salary 40k monthly.', '40000.00', 'waiter', 'job'],
            ['Tailor - Fashion Designer', 'Tailor needed. Must know how to sew. Salary 45k monthly.', '45000.00', 'tailor', 'job'],
            ['Barber - Barbing Salon', 'Barber needed for salon. Must have experience. Salary 40k monthly.', '40000.00', 'barber', 'job'],
            ['Nanny - Baby Sitter', 'Nanny needed for baby. Must love children. Salary 45k monthly.', '45000.00', 'nanny', 'job'],
            ['Gardener - Estate', 'Gardener needed for estate. Salary 30k monthly.', '30000.00', 'gardener', 'job'],
            ['Cook - Restaurant', 'Cook needed for restaurant. Must have experience. Salary 50k monthly.', '50000.00', 'cook', 'job'],
            ['Marketing Officer - Company', 'Marketing officer needed. Must be smart. Salary 55k monthly.', '55000.00', 'marketing', 'job'],
            ['Laundry Attendant', 'Laundry attendant needed. Salary 35k monthly.', '35000.00', 'laundry', 'job'],
            ['Shop Attendant - Computer Village', 'Shop attendant needed. Must know phones. Salary 40k monthly.', '40000.00', 'shop-attendant', 'job'],
            ['House Help - Live In', 'House help needed. Live in. Salary 35k monthly.', '35000.00', 'house-help', 'job'],
            ['Electrician - Building', 'Electrician needed. Must have experience. Salary 55k monthly.', '55000.00', 'electrician', 'job'],
            ['Plumber - Maintenance', 'Plumber needed for maintenance. Salary 50k monthly.', '50000.00', 'plumber', 'job'],
            ['Content Writer - Remote', 'Content writer needed. Remote work. Salary 60k monthly.', '60000.00', 'content-writer', 'job']
        ];

        return array_map(function($j, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $j[0],
                'description' => $j[1],
                'short_description' => substr($j[1], 0, 100) . '...',
                'price' => $j[2],
                'currency' => 'NGN',
                'category_id' => 7,
                'condition' => 'new',
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $j[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $j[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?work', 'full_url' => 'https://source.unsplash.com/featured/800x600/?work']
                ]),
                'seller_name' => $this->nigerianNames[($i + 30) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($j[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $jobs, array_keys($jobs));
    }

    private function getServiceAds(): array
    {
        $services = [
            ['Barbing Salon - Home Service', 'Professional barber. I come to your house. Clean equipment. 2000 per cut.', '2000.00', 'barbing-service', 'service'],
            ['Makeup Artist - Bridal', 'Professional makeup artist. Bridal makeup. Very neat. 25k per session.', '25000.00', 'makeup-artist', 'service'],
            ['Plumber - Emergency Service', 'Professional plumber. Emergency service. Available 24/7. Call now.', '5000.00', 'plumber-service', 'service'],
            ['Photographer - Event Coverage', 'Professional photographer. Event coverage. Good quality. 50k per event.', '50000.00', 'photographer', 'service'],
            ['AC Repair - Technician', 'AC repair technician. Fast service. Good work. Call now.', '8000.00', 'ac-repair', 'service'],
            ['Catering Service - Small Chop', 'Catering service. Small chop for events. Good quality. 150k minimum.', '150000.00', 'catering', 'service'],
            ['Cleaning Service - House', 'Professional cleaning service. House cleaning. Very thorough. 20k per session.', '20000.00', 'cleaning-service', 'service'],
            ['Generator Repair - Technician', 'Generator repair technician. Fast service. Good work.', '6000.00', 'generator-repair', 'service'],
            ['Tailoring - Alteration', 'Tailoring service. Alteration. Fast delivery. Good work.', '3000.00', 'tailoring', 'service'],
            ['Laundry Service - Pickup', 'Laundry service. We pickup and deliver. Good quality. 5k minimum.', '5000.00', 'laundry-service', 'service'],
            ['Hair Stylist - Home Service', 'Professional hair stylist. Home service. Braiding, weaving. 10k minimum.', '10000.00', 'hair-stylist', 'service'],
            ['Electrical Repair - Technician', 'Electrical repair technician. Fast service. Good work.', '7000.00', 'electrical-repair', 'service'],
            ['Painting Service - House', 'Professional painting service. House painting. Good quality. 100k minimum.', '100000.00', 'painting-service', 'service'],
            ['Carpenter - Furniture Repair', 'Carpenter service. Furniture repair. Good work. Call now.', '8000.00', 'carpenter', 'service'],
            ['DJ Service - Event', 'DJ service for events. Good music. Affordable. 30k per event.', '30000.00', 'dj-service', 'service'],
            ['Tutor - Home Lesson', 'Home lesson tutor. Math, English, Science. 15k per month.', '15000.00', 'tutor', 'service'],
            ['Pest Control - Fumigation', 'Pest control service. Fumigation. Effective. 25k per session.', '25000.00', 'pest-control', 'service'],
            ['Car Wash - Mobile', 'Mobile car wash. We come to you. Good quality. 5k per wash.', '5000.00', 'car-wash', 'service'],
            ['Event Planner - Wedding', 'Event planner for wedding. Professional service. Good quality.', '200000.00', 'event-planner', 'service'],
            ['Web Developer - Website', 'Web developer. Website design. Good quality. 100k minimum.', '100000.00', 'web-developer', 'service']
        ];

        return array_map(function($s, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $s[0],
                'description' => $s[1],
                'short_description' => substr($s[1], 0, 100) . '...',
                'price' => $s[2],
                'currency' => 'NGN',
                'category_id' => 8,
                'condition' => 'new',
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $s[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $s[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?service', 'full_url' => 'https://source.unsplash.com/featured/800x600/?service']
                ]),
                'seller_name' => $this->nigerianNames[($i + 35) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($s[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $services, array_keys($services));
    }

    private function getPetAds(): array
    {
        $pets = [
            ['German Shepherd Puppy', 'German shepherd puppy. 3 months old. Very healthy. Vaccinated.', '85000.00', 'german-shepherd', 'dog'],
            ['Local Dog - Puppy', 'Local dog puppy. Very smart. Good for security. 15k each.', '15000.00', 'local-dog', 'dog'],
            ['Cat - Persian', 'Persian cat. Very neat. Good for home. 25k each.', '25000.00', 'persian-cat', 'cat'],
            ['Goat - For Meat', 'Goat for meat. Very healthy. Good size. 45k each.', '45000.00', 'goat-meat', 'livestock'],
            ['Chicken - Layers', 'Layer chickens. Good for egg production. 8k each.', '8000.00', 'layer-chicken', 'poultry'],
            ['Rabbit - Breeding', 'Rabbits for breeding. Very healthy. 12k per pair.', '12000.00', 'rabbit', 'pet'],
            ['Fish - Tilapia Fingerlings', 'Tilapia fingerlings. Good for fish farm. 50 naira each.', '50.00', 'tilapia', 'fish'],
            ['Duck - White Pekin', 'White Pekin ducks. Good for meat. 15k each.', '15000.00', 'duck', 'poultry'],
            ['Parrot - African Grey', 'African Grey parrot. Can talk. Very smart. 120k.', '120000.00', 'parrot', 'bird'],
            ['Hamster - Syrian', 'Syrian hamster. Very cute. Good for kids. 8k each.', '8000.00', 'hamster', 'pet'],
            ['Turtle - Land Turtle', 'Land turtle. Very healthy. Good pet. 20k each.', '20000.00', 'turtle', 'pet'],
            ['Guinea Fowl', 'Guinea fowl. Good for meat. 12k each.', '12000.00', 'guinea-fowl', 'poultry'],
            ['Pigeon - Racing', 'Racing pigeons. Very fast. 18k per pair.', '18000.00', 'pigeon', 'bird'],
            ['Sheep - For Breeding', 'Sheep for breeding. Very healthy. 55k each.', '55000.00', 'sheep', 'livestock'],
            ['Turkey - Bronze', 'Bronze turkey. Good for meat. 25k each.', '25000.00', 'turkey', 'poultry'],
            ['Chinchilla - Pet', 'Chinchilla pet. Very cute. Good for home. 35k each.', '35000.00', 'chinchilla', 'pet'],
            ['Snail - Giant African', 'Giant African snails. Good for farming. 5k each.', '5000.00', 'snail', 'livestock'],
            ['Beehive - With Bees', 'Beehive with bees. Good for honey. 40k each.', '40000.00', 'beehive', 'livestock'],
            ['Horse - Pony', 'Pony horse. Good for kids. Very gentle. 250k.', '250000.00', 'pony', 'horse'],
            ['Cow - For Meat', 'Cow for meat. Very healthy. Good size. 350k.', '350000.00', 'cow', 'livestock']
        ];

        return array_map(function($p, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $p[0],
                'description' => $p[1],
                'short_description' => substr($p[1], 0, 100) . '...',
                'price' => $p[2],
                'currency' => 'NGN',
                'category_id' => 9,
                'condition' => 'new',
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $p[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $p[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?pet', 'full_url' => 'https://source.unsplash.com/featured/800x600/?pet']
                ]),
                'seller_name' => $this->nigerianNames[($i + 40) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($p[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $pets, array_keys($pets));
    }

    private function getHealthAds(): array
    {
        $health = [
            ['Weight Loss Tea - Herbal', 'Herbal weight loss tea. Very effective. Lose 5kg in 2 weeks. 8k per box.', '8000.00', 'weight-loss-tea', 'health'],
            ['Body Cream - Lightening', 'Body lightening cream. Very effective. Make your skin glow. 12k per jar.', '12000.00', 'body-cream', 'beauty'],
            ['Spa Service - Home Visit', 'Professional spa service. Home visit. Very relaxing. 25k per session.', '25000.00', 'spa-service', 'service'],
            ['Fitness Trainer - Personal', 'Personal fitness trainer. Home workout. Get fit. 30k per month.', '30000.00', 'fitness-trainer', 'service'],
            ['Hair Growth Oil - Natural', 'Natural hair growth oil. Very effective. Stop hair fall. 5k per bottle.', '5000.00', 'hair-oil', 'beauty'],
            ['Acne Treatment - Cream', 'Acne treatment cream. Very effective. Clear your face. 8k per tube.', '8000.00', 'acne-cream', 'beauty'],
            ['Massage Therapist - Home', 'Professional massage therapist. Home service. Very relaxing. 15k per session.', '15000.00', 'massage', 'service'],
            ['Stretch Marks Cream', 'Stretch marks removal cream. Very effective. 10k per tube.', '10000.00', 'stretch-cream', 'beauty'],
            ['Detox Tea - Herbal', 'Herbal detox tea. Cleanse your body. Very effective. 6k per box.', '6000.00', 'detox-tea', 'health'],
            ['Nail Technician - Home Service', 'Professional nail technician. Home service. Gel, acrylic. 8k minimum.', '8000.00', 'nail-tech', 'service'],
            ['Eye Cream - Anti-Aging', 'Anti-aging eye cream. Reduce wrinkles. Very effective. 12k per tube.', '12000.00', 'eye-cream', 'beauty'],
            ['Dietician - Consultation', 'Professional dietician. Meal plan. Lose weight healthy. 20k consultation.', '20000.00', 'dietician', 'service'],
            ['Teeth Whitening Kit', 'Teeth whitening kit. Very effective. White teeth in 1 week. 15k.', '15000.00', 'teeth-whitening', 'beauty'],
            ['Collagen Powder - Supplement', 'Collagen powder supplement. Good for skin. Very effective. 18k per tub.', '18000.00', 'collagen', 'health'],
            ['Yoga Instructor - Home', 'Yoga instructor. Home service. Very relaxing. 25k per month.', '25000.00', 'yoga', 'service'],
            ['Face Mask - Charcoal', 'Charcoal face mask. Deep cleansing. Very effective. 3k per pack.', '3000.00', 'face-mask', 'beauty'],
            ['Protein Powder - Supplement', 'Protein powder supplement. Good for muscle. 25k per tub.', '25000.00', 'protein', 'health'],
            ['Lash Technician - Extensions', 'Professional lash technician. Extensions. Very natural. 15k per session.', '15000.00', 'lash-tech', 'service'],
            ['Vitamin C Serum - Skincare', 'Vitamin C serum. Brighten your skin. Very effective. 8k per bottle.', '8000.00', 'vitamin-c', 'beauty'],
            ['Physiotherapist - Home Visit', 'Professional physiotherapist. Home visit. Pain relief. 20k per session.', '20000.00', 'physio', 'service']
        ];

        return array_map(function($h, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $h[0],
                'description' => $h[1],
                'short_description' => substr($h[1], 0, 100) . '...',
                'price' => $h[2],
                'currency' => 'NGN',
                'category_id' => 10,
                'condition' => 'new',
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $h[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $h[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?beauty', 'full_url' => 'https://source.unsplash.com/featured/800x600/?beauty']
                ]),
                'seller_name' => $this->nigerianNames[($i + 45) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($h[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $health, array_keys($health));
    }

    private function getBabyAds(): array
    {
        $baby = [
            ['Baby Stroller - Foldable', 'Foldable baby stroller. Very neat. Good condition. 35k.', '35000.00', 'baby-stroller', 'stroller'],
            ['Baby Clothes - 0-6 months', 'Baby clothes 0-6 months. Very neat. Good condition. 15k for set.', '15000.00', 'baby-clothes', 'clothes'],
            ['Baby Toys - Educational', 'Educational baby toys. Very neat. Good for learning. 12k for set.', '12000.00', 'baby-toys', 'toys'],
            ['Baby Crib - Wooden', 'Wooden baby crib. Very neat. Good condition. 45k.', '45000.00', 'baby-crib', 'furniture'],
            ['Baby Formula - Similac', 'Similac baby formula. Sealed. Good condition. 18k per tin.', '18000.00', 'baby-formula', 'food'],
            ['Diapers - Pampers Size 3', 'Pampers diapers size 3. Sealed pack. Good condition. 12k per pack.', '12000.00', 'pampers', 'diapers'],
            ['Baby Walker - Musical', 'Musical baby walker. Very neat. Good condition. 25k.', '25000.00', 'baby-walker', 'walker'],
            ['Baby Bottle - Philips Avent', 'Philips Avent baby bottles. Very neat. Good condition. 8k for 3.', '8000.00', 'baby-bottle', 'feeding'],
            ['Baby Carrier - Ergonomic', 'Ergonomic baby carrier. Very neat. Good condition. 18k.', '18000.00', 'baby-carrier', 'carrier'],
            ['Baby Shoes - First Walk', 'Baby first walk shoes. Very neat. Good condition. 8k per pair.', '8000.00', 'baby-shoes', 'shoes'],
            ['Baby Blanket - Soft', 'Soft baby blanket. Very neat. Good condition. 10k each.', '10000.00', 'baby-blanket', 'bedding'],
            ['Baby Bath Tub', 'Baby bath tub. Very neat. Good condition. 12k.', '12000.00', 'baby-bath', 'bath'],
            ['Baby Monitor - Video', 'Video baby monitor. Very neat. Good condition. 35k.', '35000.00', 'baby-monitor', 'electronics'],
            ['Baby High Chair', 'Baby high chair. Very neat. Good condition. 28k.', '28000.00', 'baby-chair', 'furniture'],
            ['Baby Wipes - Pampers', 'Pampers baby wipes. Sealed pack. Good condition. 5k per pack.', '5000.00', 'baby-wipes', 'care'],
            ['Baby Swing - Electric', 'Electric baby swing. Very neat. Good condition. 45k.', '45000.00', 'baby-swing', 'swing'],
            ['Baby Bib - Waterproof', 'Waterproof baby bib. Very neat. Good condition. 3k each.', '3000.00', 'baby-bib', 'feeding'],
            ['Baby Gate - Safety', 'Safety baby gate. Very neat. Good condition. 22k.', '22000.00', 'baby-gate', 'safety'],
            ['Baby Thermometer - Digital', 'Digital baby thermometer. Very neat. Good condition. 8k.', '8000.00', 'baby-thermometer', 'health'],
            ['Baby Playpen - Large', 'Large baby playpen. Very neat. Good condition. 55k.', '55000.00', 'baby-playpen', 'play']
        ];

        return array_map(function($b, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $b[0],
                'description' => $b[1],
                'short_description' => substr($b[1], 0, 100) . '...',
                'price' => $b[2],
                'currency' => 'NGN',
                'category_id' => 11,
                'condition' => ['new', 'like_new', 'good'][array_rand(['new', 'like_new', 'good'])],
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $b[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $b[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?baby', 'full_url' => 'https://source.unsplash.com/featured/800x600/?baby']
                ]),
                'seller_name' => $this->nigerianNames[($i + 50) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($b[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $baby, array_keys($baby));
    }

    private function getSportsAds(): array
    {
        $sports = [
            ['Football Boots - Nike Mercurial', 'Nike Mercurial football boots. Size 42. Very neat. Good condition. 35k.', '35000.00', 'football-boots', 'shoes'],
            ['Gym Equipment - Dumbbells', 'Dumbbells set. 20kg total. Very neat. Good condition. 45k.', '45000.00', 'dumbbells', 'gym'],
            ['Bicycle - Mountain Bike', 'Mountain bike. Very neat. Good condition. 85k.', '85000.00', 'mountain-bike', 'bicycle'],
            ['Football Jersey - Manchester United', 'Manchester United jersey. Size L. Original. Very neat. 25k.', '25000.00', 'mufc-jersey', 'jersey'],
            ['Tennis Racket - Wilson', 'Wilson tennis racket. Very neat. Good condition. 38k.', '38000.00', 'tennis-racket', 'racket'],
            ['Boxing Gloves - Everlast', 'Everlast boxing gloves. Very neat. Good condition. 28k.', '28000.00', 'boxing-gloves', 'boxing'],
            ['Swimming Goggles - Speedo', 'Speedo swimming goggles. Very neat. Good condition. 12k.', '12000.00', 'swim-goggles', 'swimming'],
            ['Basketball - Spalding', 'Spalding basketball. Very neat. Good condition. 18k.', '18000.00', 'basketball', 'ball'],
            ['Yoga Mat - Thick', 'Thick yoga mat. Very neat. Good condition. 15k.', '15000.00', 'yoga-mat', 'yoga'],
            ['Running Shoes - Adidas', 'Adidas running shoes. Size 43. Very neat. Good condition. 42k.', '42000.00', 'adidas-running', 'shoes'],
            ['Football - Adidas', 'Adidas football. Very neat. Good condition. 15k.', '15000.00', 'adidas-football', 'ball'],
            ['Jump Rope - Speed', 'Speed jump rope. Very neat. Good condition. 5k.', '5000.00', 'jump-rope', 'fitness'],
            ['Cricket Bat - Willow', 'Willow cricket bat. Very neat. Good condition. 32k.', '32000.00', 'cricket-bat', 'cricket'],
            ['Skateboard - Complete', 'Complete skateboard. Very neat. Good condition. 28k.', '28000.00', 'skateboard', 'skate'],
            ['Badminton Racket - Yonex', 'Yonex badminton racket. Very neat. Good condition. 22k.', '22000.00', 'badminton-racket', 'racket'],
            ['Table Tennis Bat - Butterfly', 'Butterfly table tennis bat. Very neat. Good condition. 18k.', '18000.00', 'tt-bat', 'tabletennis'],
            ['Volleyball - Mikasa', 'Mikasa volleyball. Very neat. Good condition. 16k.', '16000.00', 'volleyball', 'ball'],
            ['Golf Club Set', 'Golf club set. Very neat. Good condition. 180k.', '180000.00', 'golf-set', 'golf'],
            ['Fishing Rod - Shimano', 'Shimano fishing rod. Very neat. Good condition. 35k.', '35000.00', 'fishing-rod', 'fishing'],
            ['Camping Tent - 4 Person', '4 person camping tent. Very neat. Good condition. 55k.', '55000.00', 'camping-tent', 'camping']
        ];

        return array_map(function($s, $i) {
            $location = $this->locations[$i % count($this->locations)];
            return [
                'title' => $s[0],
                'description' => $s[1],
                'short_description' => substr($s[1], 0, 100) . '...',
                'price' => $s[2],
                'currency' => 'NGN',
                'category_id' => 12,
                'condition' => ['new', 'like_new', 'good'][array_rand(['new', 'like_new', 'good'])],
                'location_id' => $location['location_id'],
                'lga' => $location['lga'],
                'images' => json_encode([
                    ['url' => 'https://source.unsplash.com/featured/?' . $s[3], 'full_url' => 'https://source.unsplash.com/featured/800x600/?' . $s[3]],
                    ['url' => 'https://source.unsplash.com/featured/800x600/?sports', 'full_url' => 'https://source.unsplash.com/featured/800x600/?sports']
                ]),
                'seller_name' => $this->nigerianNames[($i + 55) % count($this->nigerianNames)],
                'seller_phone' => $this->generateNigerianPhone(),
                'seller_verified' => rand(0, 1),
                'slug' => Str::slug($s[0]) . '-' . time() . '-' . $i,
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now()
            ];
        }, $sports, array_keys($sports));
    }

    private function generateNigerianPhone(): string
    {
        $prefixes = ['080', '081', '070', '090', '081', '091'];
        $prefix = $prefixes[array_rand($prefixes)];
        $suffix = str_pad(rand(0, 99999999), 8, '0', STR_PAD_LEFT);
        return $prefix . $suffix;
    }
}
