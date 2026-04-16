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
        $this->createSampleUsers();
        $this->createSampleCategories();
        $this->createSampleLocations();
        $this->createSampleAds();
        $this->createLargeDataset();
    }

    private function createSampleUsers()
    {
        $nigerianUsers = [
            ['name' => 'Emeka Okonkwo', 'email' => 'emeka@example.com', 'phone' => '08035729184', 'location' => 'Lagos'],
            ['name' => 'Chinedu Eze', 'email' => 'chinedu@example.com', 'phone' => '08062481753', 'location' => 'Abuja'],
            ['name' => 'Olumide Adeyemi', 'email' => 'olumide@example.com', 'phone' => '08051392647', 'location' => 'Ibadan'],
            ['name' => 'Ngozi Chukwu', 'email' => 'ngozi@example.com', 'phone' => '08074618392', 'location' => 'Port Harcourt'],
            ['name' => 'Ibrahim Musa', 'email' => 'ibrahim@example.com', 'phone' => '08105739284', 'location' => 'Kano'],
            ['name' => 'Adaeze Nwankwo', 'email' => 'adaeze@example.com', 'phone' => '08026481935', 'location' => 'Enugu'],
            ['name' => 'Ayodele Samuel', 'email' => 'ayodele@example.com', 'phone' => '08097531846', 'location' => 'Lagos'],
            ['name' => 'Blessing Udofia', 'email' => 'blessing@example.com', 'phone' => '08123849561', 'location' => 'Calabar'],
            ['name' => 'Oluwaseun Johnson', 'email' => 'oluwaseun@example.com', 'phone' => '07059283714', 'location' => 'Benin City'],
            ['name' => 'Fatima Aliyu', 'email' => 'fatima@example.com', 'phone' => '08154927638', 'location' => 'Kaduna'],
            ['name' => 'Tunde Bakare', 'email' => 'tunde@example.com', 'phone' => '09036472851', 'location' => 'Ibadan'],
            ['name' => 'Chiamaka Obi', 'email' => 'chiamaka@example.com', 'phone' => '08145839267', 'location' => 'Lagos'],
        ];

        foreach ($nigerianUsers as $userData) {
            $month = [1, 2, 3, 4][array_rand([1, 2, 3, 4])];
            $day = rand(1, 28);
            $createdDate = \Carbon\Carbon::create(2026, $month, $day, rand(0, 23), rand(0, 59), rand(0, 59));
            
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => bcrypt('password'),
                    'role' => 'user',
                    'status' => 'active',
                    'phone' => $userData['phone'],
                    'location' => $userData['location'],
                    'verified' => true,
                    'created_at' => $createdDate,
                    'updated_at' => $createdDate,
                ]
            );
        }

        User::updateOrCreate(
            ['email' => 'admin@ilist.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => '09094826173',
                'location' => 'Lagos',
                'verified' => true,
                'created_at' => \Carbon\Carbon::create(2026, 1, 15, 10, 0, 0),
                'updated_at' => \Carbon\Carbon::create(2026, 1, 15, 10, 0, 0),
            ]
        );
    }

    private function createSampleCategories()
    {
        $categoriesData = [
            ['name' => 'Vehicles', 'slug' => 'vehicles', 'icon' => 'Car', 'subcategories' => [
                ['name' => 'Cars', 'slug' => 'cars'],
                ['name' => 'Motorcycles', 'slug' => 'motorcycles'],
                ['name' => 'Buses & Vans', 'slug' => 'buses-vans'],
                ['name' => 'Trucks & Trailers', 'slug' => 'trucks-trailers'],
                ['name' => 'Tricycles', 'slug' => 'tricycles'],
                ['name' => 'Vehicle Parts', 'slug' => 'vehicle-parts'],
                ['name' => 'Vehicle Accessories', 'slug' => 'vehicle-accessories'],
                ['name' => 'Heavy Equipment', 'slug' => 'heavy-equipment'],
            ]],
            ['name' => 'Property', 'slug' => 'property', 'icon' => 'Home', 'subcategories' => [
                ['name' => 'Apartments for Rent', 'slug' => 'apartments-rent'],
                ['name' => 'Apartments for Sale', 'slug' => 'apartments-sale'],
                ['name' => 'Houses for Rent', 'slug' => 'houses-rent'],
                ['name' => 'Houses for Sale', 'slug' => 'houses-sale'],
                ['name' => 'Land & Plots', 'slug' => 'land'],
                ['name' => 'Commercial Property', 'slug' => 'commercial'],
                ['name' => 'Short Let / Airbnb', 'slug' => 'short-let'],
                ['name' => 'Event Spaces', 'slug' => 'event-spaces'],
            ]],
            ['name' => 'Mobile Phones & Tablets', 'slug' => 'mobile-phones', 'icon' => 'Smartphone', 'subcategories' => [
                ['name' => 'Smartphones', 'slug' => 'smartphones'],
                ['name' => 'Feature Phones', 'slug' => 'feature-phones'],
                ['name' => 'Tablets', 'slug' => 'tablets'],
                ['name' => 'Smartwatches', 'slug' => 'smartwatches'],
                ['name' => 'Phone Accessories', 'slug' => 'phone-accessories'],
                ['name' => 'Power Banks', 'slug' => 'power-banks'],
                ['name' => 'Chargers', 'slug' => 'chargers'],
                ['name' => 'Screen Protectors', 'slug' => 'screen-protectors'],
            ]],
            ['name' => 'Electronics', 'slug' => 'electronics', 'icon' => 'Laptop', 'subcategories' => [
                ['name' => 'Laptops', 'slug' => 'laptops'],
                ['name' => 'Desktop Computers', 'slug' => 'desktops'],
                ['name' => 'Televisions', 'slug' => 'tvs'],
                ['name' => 'Audio & Music Equipment', 'slug' => 'audio'],
                ['name' => 'Cameras & Photography', 'slug' => 'cameras'],
                ['name' => 'Gaming Consoles', 'slug' => 'gaming'],
                ['name' => 'Networking Equipment', 'slug' => 'networking'],
                ['name' => 'Accessories', 'slug' => 'electronics-accessories'],
            ]],
            ['name' => 'Fashion', 'slug' => 'fashion', 'icon' => 'Shirt', 'subcategories' => [
                ['name' => "Men's Clothing", 'slug' => 'men-clothing'],
                ['name' => "Women's Clothing", 'slug' => 'women-clothing'],
                ['name' => 'Shoes', 'slug' => 'shoes'],
                ['name' => 'Bags', 'slug' => 'bags'],
                ['name' => 'Watches', 'slug' => 'watches'],
                ['name' => 'Jewelry', 'slug' => 'jewelry'],
                ['name' => 'Sunglasses', 'slug' => 'sunglasses'],
                ['name' => 'Underwear & Sleepwear', 'slug' => 'underwear'],
            ]],
            ['name' => 'Home, Furniture & Appliances', 'slug' => 'home-furniture', 'icon' => 'Sofa', 'subcategories' => [
                ['name' => 'Furniture', 'slug' => 'furniture'],
                ['name' => 'Home Decor', 'slug' => 'home-decor'],
                ['name' => 'Kitchen Appliances', 'slug' => 'kitchen-appliances'],
                ['name' => 'Large Appliances', 'slug' => 'large-appliances'],
                ['name' => 'Small Appliances', 'slug' => 'small-appliances'],
                ['name' => 'Bedding', 'slug' => 'bedding'],
                ['name' => 'Lighting', 'slug' => 'lighting'],
                ['name' => 'Home Accessories', 'slug' => 'home-accessories'],
            ]],
            ['name' => 'Jobs', 'slug' => 'jobs', 'icon' => 'Briefcase', 'subcategories' => [
                ['name' => 'Full-time Jobs', 'slug' => 'full-time'],
                ['name' => 'Part-time Jobs', 'slug' => 'part-time'],
                ['name' => 'Remote Jobs', 'slug' => 'remote'],
                ['name' => 'Internships', 'slug' => 'internships'],
                ['name' => 'Contract Jobs', 'slug' => 'contract'],
                ['name' => 'Graduate Jobs', 'slug' => 'graduate'],
                ['name' => 'Driver Jobs', 'slug' => 'driver'],
                ['name' => 'Tech Jobs', 'slug' => 'tech'],
            ]],
            ['name' => 'Services', 'slug' => 'services', 'icon' => 'Wrench', 'subcategories' => [
                ['name' => 'Cleaning Services', 'slug' => 'cleaning'],
                ['name' => 'Repair & Maintenance', 'slug' => 'repair'],
                ['name' => 'Moving & Logistics', 'slug' => 'moving'],
                ['name' => 'Event Services', 'slug' => 'events'],
                ['name' => 'Digital Services', 'slug' => 'digital'],
                ['name' => 'Beauty Services', 'slug' => 'beauty-services'],
                ['name' => 'Automotive Services', 'slug' => 'auto-services'],
                ['name' => 'Home Services', 'slug' => 'home-services'],
            ]],
            ['name' => 'Pets', 'slug' => 'pets', 'icon' => 'PawPrint', 'subcategories' => [
                ['name' => 'Dogs', 'slug' => 'dogs'],
                ['name' => 'Cats', 'slug' => 'cats'],
                ['name' => 'Birds', 'slug' => 'birds'],
                ['name' => 'Fish', 'slug' => 'fish'],
                ['name' => 'Pet Food', 'slug' => 'pet-food'],
                ['name' => 'Pet Accessories', 'slug' => 'pet-accessories'],
                ['name' => 'Livestock', 'slug' => 'livestock'],
                ['name' => 'Veterinary Services', 'slug' => 'vet-services'],
            ]],
            ['name' => 'Health & Beauty', 'slug' => 'health-beauty', 'icon' => 'Sparkles', 'subcategories' => [
                ['name' => 'Skincare', 'slug' => 'skincare'],
                ['name' => 'Haircare', 'slug' => 'haircare'],
                ['name' => 'Makeup', 'slug' => 'makeup'],
                ['name' => 'Fragrances', 'slug' => 'fragrances'],
                ['name' => 'Personal Care', 'slug' => 'personal-care'],
                ['name' => 'Beauty Tools', 'slug' => 'beauty-tools'],
                ['name' => 'Supplements', 'slug' => 'supplements'],
                ['name' => 'Medical Supplies', 'slug' => 'medical-supplies'],
            ]],
            ['name' => 'Baby & Kids', 'slug' => 'baby-kids', 'icon' => 'Baby', 'subcategories' => [
                ['name' => 'Baby Clothing', 'slug' => 'baby-clothing'],
                ['name' => 'Kids Clothing', 'slug' => 'kids-clothing'],
                ['name' => 'Toys', 'slug' => 'toys'],
                ['name' => 'Strollers', 'slug' => 'strollers'],
                ['name' => 'Car Seats', 'slug' => 'car-seats'],
                ['name' => 'Baby Food', 'slug' => 'baby-food'],
                ['name' => 'School Supplies', 'slug' => 'school-supplies'],
                ['name' => 'Maternity', 'slug' => 'maternity'],
            ]],
            ['name' => 'Sports & Outdoors', 'slug' => 'sports', 'icon' => 'Dumbbell', 'subcategories' => [
                ['name' => 'Gym Equipment', 'slug' => 'gym-equipment'],
                ['name' => 'Fitness Accessories', 'slug' => 'fitness'],
                ['name' => 'Bicycles', 'slug' => 'bicycles'],
                ['name' => 'Outdoor Gear', 'slug' => 'outdoor'],
                ['name' => 'Sportswear', 'slug' => 'sportswear'],
                ['name' => 'Camping Equipment', 'slug' => 'camping'],
                ['name' => 'Football Equipment', 'slug' => 'football'],
                ['name' => 'Water Sports', 'slug' => 'water-sports'],
            ]],
        ];

        foreach ($categoriesData as $catData) {
            $subcategories = $catData['subcategories'];
            unset($catData['subcategories']);

            $parent = Category::updateOrCreate(
                ['slug' => $catData['slug']],
                $catData
            );

            foreach ($subcategories as $subData) {
                Category::updateOrCreate(
                    ['slug' => $subData['slug']],
                    [
                        'name' => $subData['name'],
                        'slug' => $subData['slug'],
                        'parent_id' => $parent->id,
                        'icon' => $parent->icon,
                    ]
                );
            }
        }
    }

    private function createSampleLocations()
    {
        $locationsWithLGAs = [
            ['name' => 'Abia', 'slug' => 'abia', 'lgas' => ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala-Ngwa North', 'Isiala-Ngwa South', 'Isuikwuato', 'Nbaise', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu-Nneochi']],
            ['name' => 'Abuja', 'slug' => 'abuja', 'lgas' => ['Abaji', 'Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali']],
            ['name' => 'Adamawa', 'slug' => 'adamawa', 'lgas' => ['Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Honga', 'Jada', 'Larmurde', 'Madagali', 'Maiha', 'Mayo-Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South']],
            ['name' => 'Akwa Ibom', 'slug' => 'akwa-ibom', 'lgas' => ['Abak', 'Eastern Obolo', 'Eket', 'Esit-Eket', 'Essien Udim', 'Etim-Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo-Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Uruan', 'Obot-Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Ukanafun', 'Udung-Uko', 'Uruan', 'Uyo']],
            ['name' => 'Anambra', 'slug' => 'anambra', 'lgas' => ['Awka North', 'Awka South', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi']],
            ['name' => 'Bauchi', 'slug' => 'bauchi', 'lgas' => ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darako', 'Dausu', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas-Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa-Balewa', 'Toro', 'Warji', 'Zaki']],
            ['name' => 'Bayelsa', 'slug' => 'bayelsa', 'lgas' => ['Brass', 'Ekeremor', 'Kolokuma-Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa']],
            ['name' => 'Benue', 'slug' => 'benue', 'lgas' => ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya']],
            ['name' => 'Borno', 'slug' => 'borno', 'lgas' => ['Abadam', 'Askira-Uba', 'Bama', 'Bayo', 'Birom', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala-Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani']],
            ['name' => 'Cross River', 'slug' => 'cross-river', 'lgas' => ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala']],
            ['name' => 'Delta', 'slug' => 'delta', 'lgas' => ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Warri North', 'Warri South', 'Warri South West']],
            ['name' => 'Ebonyi', 'slug' => 'ebonyi', 'lgas' => ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha']],
            ['name' => 'Edo', 'slug' => 'edo', 'lgas' => ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba-Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde']],
            ['name' => 'Ekiti', 'slug' => 'ekiti', 'lgas' => ['Ado-Ekiti', 'Aiyekire', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Ido-Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun', 'Ise-Orun', 'Oye']],
            ['name' => 'Enugu', 'slug' => 'enugu', 'lgas' => ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo-Etiti', 'Igbo-Eze North', 'Igbo-Eze South', 'Isi-Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi']],
            ['name' => 'Gombe', 'slug' => 'gombe', 'lgas' => ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu-Deba']],
            ['name' => 'Imo', 'slug' => 'imo', 'lgas' => ['Aboh-Mbaise', 'Ahiazu-Mbaise', 'Ehime-Mbano', 'Egbema', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte-Uboma', 'Ikeduru', 'Isiala-Mbano', 'Isu', 'Mbaitoli', 'Ngor-Okpala', 'Njaba', 'Nkwerre', 'Obowo', 'Oguta', 'Ohaji-Egbema', 'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West', 'Unuimo']],
            ['name' => 'Jigawa', 'slug' => 'jigawa', 'lgas' => ['Auyo', 'Babura', 'Biriniwa', 'Birnin-Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin-Madaki', 'Kaugama', 'Kazaure', 'Kiri kasamma', 'Kiyawa', 'Kukuyushtu', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule-Tankarkar', 'Taura', 'Yankwashi']],
            ['name' => 'Kaduna', 'slug' => 'kaduna', 'lgas' => ['Birnin-Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon-Gari', 'Sanga', 'Soba', 'Zaria']],
            ['name' => 'Kano', 'slug' => 'kano', 'lgas' => ['Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin-Kudu', 'Dawakin-Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun-Mallan', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin-Gado', 'Ringim', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun-Wada', 'Ungogo', 'Warawa', 'Wudil']],
            ['name' => 'Katsina', 'slug' => 'katsina', 'lgas' => ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan-Musa', 'Daura', 'Dutsi', 'Dutsin-Ma', 'Faskari', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai\'adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango']],
            ['name' => 'Kebbi', 'slug' => 'kebbi', 'lgas' => ['Aleiro', 'Arewa-Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin-Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko-Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru']],
            ['name' => 'Kogi', 'slug' => 'kogi', 'lgas' => ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela-Odolu', 'Ijumu', 'Kabba/Bunu', 'Koton-Karfe', 'Lokoja', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West']],
            ['name' => 'Kwara', 'slug' => 'kwara', 'lgas' => ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke-Ero', 'Omu-Aran', 'Pategi']],
            ['name' => 'Lagos', 'slug' => 'lagos', 'lgas' => ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere']],
            ['name' => 'Nasarawa', 'slug' => 'nasarawa', 'lgas' => ['Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa-Eggon', 'Obi', 'Toto', 'Wamba']],
            ['name' => 'Niger', 'slug' => 'niger', 'lgas' => ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi']],
            ['name' => 'Ogun', 'slug' => 'ogun', 'lgas' => ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Ewekoro', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North-East', 'Ijebu Ode', 'Ikenne', 'Imeko-Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Remo South', 'Sagamu']],
            ['name' => 'Ondo', 'slug' => 'ondo', 'lgas' => ['Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West', 'Akure North', 'Akure South', 'Ose', 'Owo', 'Ifedore', 'Ilaje', 'Ondo West', 'Ondo East', 'Odigbo']],
            ['name' => 'Osun', 'slug' => 'osun', 'lgas' => ['Aiyedaade', 'Aiyegunle', 'Atakunmosa East', 'Atakunmosa West', 'Atela', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irola', 'Isokan', 'Iwo', 'Obokun', 'Odo-Otin', 'Ola-Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo']],
            ['name' => 'Oyo', 'slug' => 'oyo', 'lgas' => ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomoso North', 'Ogbomoso South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona-Ara', 'Orelope', 'Ori Ire', 'Oyo', 'Oyo East', 'Saki East', 'Saki West', 'Surulere']],
            ['name' => 'Plateau', 'slug' => 'plateau', 'lgas' => ['Barkin-Ladi', 'Bassa', 'Bukuru', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase']],
            ['name' => 'Rivers', 'slug' => 'rivers', 'lgas' => ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba-Egbema-Ndoni', 'Ohaji-Egbema', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Port Harcourt', 'Tai']],
            ['name' => 'Sokoto', 'slug' => 'sokoto', 'lgas' => ['Binji', 'Bodinga', 'Dange-Shuni', 'Gada', 'Goronyo', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Raba', 'Sabon-Birni', 'Shagari', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo']],
            ['name' => 'Taraba', 'slug' => 'taraba', 'lgas' => ['Ardo-Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karaye', 'Kurfi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Zing']],
            ['name' => 'Yobe', 'slug' => 'yobe', 'lgas' => ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari']],
            ['name' => 'Zamfara', 'slug' => 'zamfara', 'lgas' => ['Anka', 'Bakura', 'Birnin-Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Chafe', 'Gummi', 'Gusau', 'Kaura-Namoda', 'Kiyawa', 'Maradun', 'Maru', 'Shinkafi', 'Talata-Mafara', 'Zurmi']],
        ];

        foreach ($locationsWithLGAs as $loc) {
            $lgas = $loc['lgas'] ?? [];
            unset($loc['lgas']);

            $state = Location::updateOrCreate(
                ['slug' => $loc['slug']],
                array_merge($loc, ['is_active' => true, 'parent_id' => null])
            );

            // Delete existing children to avoid duplicates, then re-add
            Location::where('parent_id', $state->id)->delete();

            foreach ($lgas as $lgaName) {
                Location::create([
                    'name' => $lgaName,
                    'slug' => $state->slug . '-' . Str::slug($lgaName),
                    'parent_id' => $state->id,
                    'is_active' => true
                ]);
            }
        }

        // Create multiple users with Nigerian names and phone numbers
        $nigerianUsers = [
            ['name' => 'Emeka Okonkwo', 'email' => 'emeka@example.com', 'phone' => '08037192846', 'location' => 'Lagos'],
            ['name' => 'Chinedu Eze', 'email' => 'chinedu@example.com', 'phone' => '08058264917', 'location' => 'Abuja'],
            ['name' => 'Olumide Adeyemi', 'email' => 'olumide@example.com', 'phone' => '08064938172', 'location' => 'Lagos'],
            ['name' => 'Adaeze Nnamdi', 'email' => 'adaeze@example.com', 'phone' => '08073619285', 'location' => 'Enugu'],
            ['name' => 'Ibrahim Garba', 'email' => 'ibrahim@example.com', 'phone' => '08081749263', 'location' => 'Kano'],
            ['name' => 'Blessing Etim', 'email' => 'blessing@example.com', 'phone' => '08092846153', 'location' => 'Port Harcourt'],
            ['name' => 'Tunde Bakare', 'email' => 'tunde@example.com', 'phone' => '08106482937', 'location' => 'Ibadan'],
            ['name' => 'Ngozi Obi', 'email' => 'ngozi@example.com', 'phone' => '08117593826', 'location' => 'Lagos'],
            ['name' => 'Kunle Williams', 'email' => 'kunle@example.com', 'phone' => '08129461837', 'location' => 'Abuja'],
            ['name' => 'Amaka Umeh', 'email' => 'amaka@example.com', 'phone' => '08138259174', 'location' => 'Onitsha'],
            ['name' => 'Segun Fashola', 'email' => 'segun@example.com', 'phone' => '08149173648', 'location' => 'Lagos'],
            ['name' => 'Halima Musa', 'email' => 'halima@example.com', 'phone' => '08153748296', 'location' => 'Kaduna'],
        ];

        foreach ($nigerianUsers as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => bcrypt('password'),
                    'role' => 'user',
                    'status' => 'active',
                    'phone' => $userData['phone'],
                    'location' => $userData['location'],
                    'verified' => true,
                ]
            );
        }

        User::updateOrCreate(
            ['email' => 'admin@ilist.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => '09083617294',
                'location' => 'Lagos',
                'verified' => true,
            ]
        );

    }

    private function createSampleAds()
    {
        $categories = Category::whereNotNull('parent_id')->get();
        $locations = Location::whereNull('parent_id')->take(10)->get();
        $users = User::where('role', 'user')->get();

        if ($categories->isEmpty() || $locations->isEmpty() || $users->isEmpty()) {
            echo "Warning: Cannot create sample ads. Need categories, locations, and users.\n";
            return;
        }

        // SPECIFIC PRODUCT IMAGES - Exact match to product titles
        // Key is product keyword, value is array of relevant Unsplash images
        $productImages = [
            // SMARTPHONES - Exact iPhone/Samsung models
            'iPhone 15 Pro' => ['https://images.unsplash.com/photo-1592750475338-74b7b2105b125?w=800&h=600', 'https://images.unsplash.com/photo-1695048133142-1a13154ebc44?w=800&h=600'],
            'iPhone 15' => ['https://images.unsplash.com/photo-1695048133142-1a13154ebc44?w=800&h=600', 'https://images.unsplash.com/photo-1592750475338-74b7b2105b125?w=800&h=600'],
            'iPhone 14 Pro' => ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600', 'https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800&h=600'],
            'iPhone 14' => ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600', 'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800&h=600'],
            'iPhone 13' => ['https://images.unsplash.com/photo-1632661674596-df6be585f3c83?w=800&h=600', 'https://images.unsplash.com/photo-1622769887660-2f6e96f3798d?w=800&h=600'],
            'iPhone 12' => ['https://images.unsplash.com/photo-1616348436123-6c4fd7e004c2?w=800&h=600', 'https://images.unsplash.com/photo-1609587312208-cea1b979846a?w=800&h=600'],
            'iPhone SE' => ['https://images.unsplash.com/photo-1610945265064-0e34e5519c1f?w=800&h=600'],
            'Samsung S24 Ultra' => ['https://images.unsplash.com/photo-1610945415299-d9bedc9d2c97?w=800&h=600', 'https://images.unsplash.com/photo-1610945265064-0e34e5519c1f?w=800&h=600'],
            'Samsung S24' => ['https://images.unsplash.com/photo-1610945415299-d9bedc9d2c97?w=800&h=600'],
            'Samsung S23 Ultra' => ['https://images.unsplash.com/photo-1610945415299-d9bedc9d2c97?w=800&h=600'],
            'Samsung S23' => ['https://images.unsplash.com/photo-1611173859644-d1cb766a9301?w=800&h=600'],
            'Samsung Galaxy S22' => ['https://images.unsplash.com/photo-1611173859644-d1cb766a9301?w=800&h=600'],
            'Samsung Galaxy A54' => ['https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800&h=600'],
            'Samsung Galaxy A34' => ['https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800&h=600'],
            'Samsung Z Flip' => ['https://images.unsplash.com/photo-1622618668707-85ec8c4c74cd?w=800&h=600', 'https://images.unsplash.com/photo-1622618668707-85ec8c4c74cd?w=800&h=600'],
            'Samsung Z Fold' => ['https://images.unsplash.com/photo-1622618668707-85ec8c4c74cd?w=800&h=600'],
            'Tecno Spark' => ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600'],
            'Tecno Camon' => ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600'],
            'Infinix Note' => ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600'],
            'Infinix Hot' => ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600'],
            'Infinix Zero' => ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600'],
            'OPPO Reno' => ['https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800&h=600'],
            'OPPO A78' => ['https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800&h=600'],
            'Vivo V30' => ['https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800&h=600'],
            'Vivo Y27' => ['https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800&h=600'],
            'Xiaomi' => ['https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800&h=600'],
            'Poco' => ['https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800&h=600'],
            'Pixel' => ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600', 'https://images.unsplash.com/photo-1585790050230-80c3f8f3350c?w=800&h=600'],
            'Nokia G42' => ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600'],
            
            // CARS - Exact models
            'Toyota Camry' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600'],
            'Toyota Corolla' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Toyota RAV4' => ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600'],
            'Toyota Highlander' => ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600'],
            'Toyota Land Cruiser' => ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600'],
            'Honda Civic' => ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600'],
            'Honda Accord' => ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600'],
            'Honda CR-V' => ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600'],
            'Mercedes C300' => ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Mercedes GLE' => ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600'],
            'Lexus RX' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'BMW X5' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'BMW X3' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Audi Q5' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Hyundai Tucson' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Ford Explorer' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Mazda CX-5' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Kia Sorento' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Nissan' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Volkswagen' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Porsche' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Range Rover' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            'Chevrolet' => ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600'],
            
            // LAPTOPS - Exact models
            'MacBook Pro' => ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600'],
            'MacBook Air' => ['https://images.unsplash.com/photo-1611186871348-b1ce6962c6fd?w=800&h=600'],
            'Dell XPS' => ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b2e?w=800&h=600'],
            'HP Omen' => ['https://images.unsplash.com/photo-1608231617344-851427f63d1a?w=800&h=600'],
            'HP Laptop' => ['https://images.unsplash.com/photo-1588702547923-b3c1859b71fa?w=800&h=600'],
            'Lenovo ThinkPad' => ['https://images.unsplash.com/photo-1588872657578-7efd1f9cd1d9?w=800&h=600'],
            'Lenovo Legion' => ['https://images.unsplash.com/photo-1588872657578-7efd1f9cd1d9?w=800&h=600'],
            'ASUS ROG' => ['https://images.unsplash.com/photo-1608231617344-851427f63d1a?w=800&h=600'],
            'ASUS ZenBook' => ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600'],
            'Acer Nitro' => ['https://images.unsplash.com/photo-1593642532973-d31b2c7a5c18?w=800&h=600'],
            'Acer Aspire' => ['https://images.unsplash.com/photo-1588702547923-b3c1859b71fa?w=800&h=600'],
            'MSI' => ['https://images.unsplash.com/photo-1608231617344-851427f63d1a?w=800&h=600'],
            'LG Gram' => ['https://images.unsplash.com/photo-1588702547923-b3c1859b71fa?w=800&h=600'],
            
            // TVs
            'Samsung 65 inch' => ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600'],
            'LG 55 inch' => ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600'],
            'Sony TV' => ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600'],
            
            // GAMING
            'PlayStation 5' => ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600'],
            'PS5' => ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600'],
            'Nintendo Switch' => ['https://images.unsplash.com/photo-1578303512597-81eec79c7062?w=800&h=600'],
            'Xbox' => ['https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&h=600'],
            
            // FURNITURE
            'Dining Table' => ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600'],
            'Sofa' => ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600'],
            'Bed' => ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600'],
            'Office Chair' => ['https://images.unsplash.com/photo-1580480055273-228a8ef8d4e0?w=800&h=600'],
            
            // Default category fallback images
            'Cars' => [
                'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1580273916550-e323be2ed5f6?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop',
            ],
            'Smartphones' => [
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800&h=600&fit=crop',
            ],
            'Laptops' => [
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1588702547923-b3c1859b71fa?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop',
            ],
            'Gaming' => [
                'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&h=600&fit=crop',
            ],
            'TVs' => [
                'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&h=600&fit=crop',
            ],
            'Furniture' => [
                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=600&fit=crop',
            ],
            'Appliances' => [
                'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=600&fit=crop',
            ],
            'Fashion' => [
                'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop',
            ],
            'Cameras' => [
                'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
            ],
            'Watches' => [
                'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
            ],
            'Real Estate' => [
                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
            ],
            'Gym' => [
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
            ],
            'Beauty' => [
                'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
            ],
        ];

        $sampleAds = [
            // CARS - Realistic Nigerian market descriptions
            ['title' => 'Toyota Camry 2022 XLE - Tokunbo', 'description' => 'My Toyota Camry 2022 XLE. First body, no accident at all. I bought it brand new from CFAO. AC is very cold, engine perfect. The leather seats are still clean. Selling because I\'m relocating abroad next month. Serious buyers should call me. Price is slightly negotiable.', 'price' => 22500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Mercedes C300 2023 AMG - First Body', 'description' => 'Tokunbo Mercedes C300 AMG line. White color, black interior. Full option with sunroof and burmester sound. I\'m the first owner, bought from Mercedes showroom in Lagos. Everything works perfectly. No issues at all. Serious buyers can come and inspect.', 'price' => 38500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Honda Accord 2021 Sport - Nigerian Used', 'description' => 'Honda Accord 2021 Sport trim. Very clean Nigerian used. Second owner, I bought from my uncle. The car has never given me any problem. 1.5L turbo engine, fuel consumption is very economical. I\'m selling to get a bigger car for family. Call or WhatsApp me.', 'price' => 16800000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Lexus RX 350 2020 - Full Option', 'description' => 'Tokunbo Lexus RX 350 2020. Clean title, no accident history. Full option with panoramic roof, Mark Levinson sound system, and adaptive suspension. The car is very comfortable for long trips. AC is ice cold. My guy that maintains it is very reliable. Serious buyers only.', 'price' => 36500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Toyota Corolla 2020 LE - Low Mileage', 'description' => 'Toyota Corolla 2020 LE. Low mileage, only 35,000 km. Nigerian used, first body. Perfect for someone looking for a reliable car without spending too much. No issues, just service it and drive. I\'m a doctor and I\'m selling to get an SUV.', 'price' => 13500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'BMW X5 2021 xDrive40i - Tokunbo', 'description' => 'Tokunbo BMW X5 2021 xDrive40i. M Sport package. I brought this car from the port myself, so I know the history. Everything is working. The engine is smooth, transmission is perfect. No warning lights. I\'m selling because I need a smaller car for the city.', 'price' => 47500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Honda Civic 2022 Touring - Clean Title', 'description' => 'Honda Civic 2022 Touring. Nigerian used, first body. Bought from Honda Nigeria. The car is very clean, both inside and outside. No scratches, no dents. Full option with Honda Sensing. I\'m a banker and I need to sell urgently. Price is firm.', 'price' => 19500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Mercedes GLE 450 2020 AMG', 'description' => 'Tokunbo Mercedes GLE 450 AMG. 3.0L biturbo engine. 4MATIC AWD. Air suspension. The car is very clean with no issues. I\'m a businessman and I have another G-Wagon so I rarely use this one. Selling at a good price for quick sale.', 'price' => 41500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Toyota RAV4 2023 Hybrid - Brand New', 'description' => 'Brand new Toyota RAV4 Hybrid 2023. White color. Not yet registered, I have the original receipt from Toyota Nigeria. Full option with JBL sound system. 40MPG fuel economy is amazing. I ordered this for my wife but she doesn\'t want to learn how to drive it anymore. Slightly negotiable.', 'price' => 32500000, 'condition' => 'new', 'category' => 'Cars'],
            ['title' => 'Porsche Cayenne 2020 - Sport Chrono', 'description' => 'Tokunbo Porsche Cayenne 2020. 3.0L turbo. Sport Chrono package. Very clean and well maintained. I\'m a car enthusiast and I\'ve kept this car in top condition. All services done at Porsche center. The car is for someone who appreciates German engineering. Price is negotiable for serious buyers.', 'price' => 54500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Audi Q5 2022 Premium Plus', 'description' => 'Tokunbo Audi Q5 2022 Premium Plus. 2.0L turbo. Quattro AWD. Virtual cockpit, Bang & Olufsen sound, matrix LED headlights. This car is in excellent condition. No accident history. I\'m relocating and need to sell fast. Reasonable offers will be considered.', 'price' => 35500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Hyundai Tucson 2022 - Clean', 'description' => 'Hyundai Tucson 2022. Nigerian used, very clean. 2.5L engine, AWD. The car is perfect for Nigerian roads. Good ground clearance, comfortable interior. I\'ve maintained it well. AC is very cold. Selling because I\'ve paid for a Toyota Camry. Quick sale needed.', 'price' => 18200000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Ford Explorer 2022 ST - V6 Turbo', 'description' => 'Ford Explorer ST 2022. 3.0L V6 twin-turbo, 400HP. 8-seater with third row. Nigerian used. The car is very powerful and comfortable. I\'m a pastor and I\'m selling to get a bus for my church. The car is clean with all papers. Serious buyers can call.', 'price' => 27500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Chevrolet Malibu 2022 LT', 'description' => 'Chevrolet Malibu 2022 LT. 1.5L turbo engine. Very clean Nigerian used. Apple CarPlay, Android Auto, heated seats. Fuel consumption is very good, about 12km per liter on highway. I\'m a civil servant and selling because I need money for my child\'s school fees.', 'price' => 12200000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Nissan Altima 2022 SV - Economical', 'description' => 'Nissan Altima 2022 SV. 2.5L engine, very economical. Perfect for someone who commutes long distances daily. The car is very comfortable with ProPILOT assist. Clean interior, no stains. I\'m a teacher and I\'m selling to upgrade to an SUV for my family.', 'price' => 13200000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Volkswagen Jetta GLI 2021 - Sport', 'description' => 'Volkswagen Jetta GLI 2021. 2.0L turbo, 6-speed manual. Sport suspension, very fun to drive. I\'m a young professional and I\'m selling because I\'m getting married and need a bigger car. The Jetta is for someone who loves driving. Very clean, well maintained.', 'price' => 16200000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Toyota Land Cruiser 2022 V8 - Full Option', 'description' => 'Toyota Land Cruiser 2022 V8. Tokunbo, first body. Full option with everything you can think of. Multi-terrain monitor, crawl control, refrigerator in the console. This is the ultimate go-anywhere vehicle. I\'m a politician and I\'m selling because I\'ve ordered a new one. Serious buyers only.', 'price' => 78000000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Kia Sorento 2023 - 7 Seater', 'description' => 'Brand new Kia Sorento 2023 SX. 7 seater SUV. 3.5L V6, AWD. I just bought it last month but my business ran into problems and I need cash urgently. Everything is still factory fresh. All papers intact. I\'ll sell at a significant loss. First serious buyer gets it.', 'price' => 34500000, 'condition' => 'new', 'category' => 'Cars'],
            ['title' => 'Range Rover Sport 2020 HSE', 'description' => 'Tokunbo Range Rover Sport 2020 HSE. V6 engine, full option. The car is very clean and well maintained. I\'ve never had any issues with it. Comfort is unmatched. I\'m a businesswoman and I need to downsize. The car is registered in my name. Call me for inspection.', 'price' => 51500000, 'condition' => 'good', 'category' => 'Cars'],
            ['title' => 'Mazda CX-5 2023 GT - Soul Red', 'description' => 'Brand new Mazda CX-5 2023 GT. Soul Red Crystal color. I ordered this from the showroom but then got a company car so I don\'t need it anymore. Never registered, never used. 5 years warranty from Mazda Nigeria. Price is negotiable for quick sale.', 'price' => 26500000, 'condition' => 'new', 'category' => 'Cars'],

            // PHONES - Humanized descriptions
            ['title' => 'iPhone 15 Pro Max 256GB - Titanium Blue', 'description' => 'My iPhone 15 Pro Max 256GB. Titanium Blue color. I\'ve used it for about 3 months, still looks brand new because I\'ve been using a case and screen protector. Battery health is at 98%. Comes with original box and charger. Selling because I\'m switching to Android. Serious buyers only.', 'price' => 1780000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'Samsung Galaxy S24 Ultra 512GB - Sealed', 'description' => 'Brand new Samsung S24 Ultra 512GB. Factory sealed, never opened. I bought two during a promo but only needed one. UK version, fully unlocked for all networks. Comes with Samsung warranty. Price is firm because I\'m already selling at below market rate.', 'price' => 2050000, 'condition' => 'new', 'category' => 'Smartphones'],
            ['title' => 'iPhone 14 Pro 128GB - Deep Purple', 'description' => 'iPhone 14 Pro 128GB, Deep Purple. Used for about 6 months. Battery health 91%. Very clean, no scratches on screen. Face ID works perfectly. I dropped it once and the corner got a small dent but screen is perfect. Original box and charger included. I\'m upgrading to the 15 Pro.', 'price' => 1320000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'Tecno Spark 20 Pro - Brand New', 'description' => 'Brand new Tecno Spark 20 Pro. 256GB, 8GB RAM. I\'m a phone dealer and I have a few of these available. Comes with full accessories: charger, earphones, case. Original Tecno products, not fake. Selling at wholesale price for quick sale. Bulk buyers get better discount.', 'price' => 275000, 'condition' => 'new', 'category' => 'Smartphones'],
            ['title' => 'Samsung Galaxy A54 5G - UK Used', 'description' => 'Samsung A54 5G, 128GB. UK used, very clean. I\'ve been using it for 2 months, switching back to iPhone. No scratches, no issues. The screen is beautiful, battery lasts all day. Includes case and extra screen protector. Price is slightly negotiable.', 'price' => 365000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'OPPO Reno 11 F 5G - Factory Sealed', 'description' => 'Brand new OPPO Reno 11 F 5G. Factory sealed. 256GB storage. 64MP camera takes amazing photos. I\'m an OPPO dealer, selling at a good price. Comes with free wireless earbuds and official OPPO warranty. I can also deliver within Lagos. WhatsApp me to order.', 'price' => 565000, 'condition' => 'new', 'category' => 'Smartphones'],
            ['title' => 'Infinix Note 40 Pro - 256GB', 'description' => 'Infinix Note 40 Pro. 256GB storage. Very clean, used for about a month. I received it as a gift but I already have a Samsung. The phone is perfect, no issues. Includes original charger and a nice case. Selling because I don\'t need two phones.', 'price' => 310000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'Google Pixel 7a - US Version', 'description' => 'Google Pixel 7a, 128GB. US version, fully unlocked. I imported this myself. The camera quality is amazing, best for photos and videos. Battery health at 94%. Minor scratch at the back but screen is perfect. I\'m selling because I\'m getting the Pixel 8. Great phone for those who love pure Android.', 'price' => 495000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'Vivo V30 5G - Brand New with Warranty', 'description' => 'Brand new Vivo V30 5G. 256GB, 12GB RAM with virtual RAM expansion. 50MP eye autofocus camera takes beautiful selfies. Aura light feature is great for night photos. I\'m a Vivo dealer, selling with 2 years official warranty. I can deliver within Lagos and Ibadan.', 'price' => 605000, 'condition' => 'new', 'category' => 'Smartphones'],
            ['title' => 'Samsung Galaxy Z Flip 4 - Bespoke Edition', 'description' => 'Samsung Z Flip 4 256GB, Bespoke Edition. Gold color with custom engraving. Very clean, no issues. The foldable display works perfectly, no dead pixels. I\'m a fashion blogger and I\'m selling because I\'m getting the Z Flip 5. Includes original box and all accessories. It\'s a beautiful phone.', 'price' => 875000, 'condition' => 'like_new', 'category' => 'Smartphones'],
            ['title' => 'iPhone 13 128GB - Good Condition', 'description' => 'iPhone 13 128GB, Blue color. I\'ve used it for a year. Battery health is 84%, which is okay but not great. Has a small crack on the back glass, not affecting use. Screen is perfect. I\'m selling because I\'m upgrading. Comes with a third-party case. Price reflects the battery condition.', 'price' => 650000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'Infinix Hot 40i - Budget Phone', 'description' => 'Brand new Infinix Hot 40i. 128GB. I\'m selling for a friend who is a phone dealer. Great phone for the price, perfect for students or as a backup phone. Free case and earphones included. I can also deliver within Ibadan. Serious buyers should WhatsApp me.', 'price' => 168000, 'condition' => 'new', 'category' => 'Smartphones'],
            ['title' => 'Xiaomi Poco X6 Pro 5G - Gaming Phone', 'description' => 'Xiaomi Poco X6 Pro 5G. 256GB, 12GB RAM. Dimensity 8300-Ultra chip, this phone is a beast for gaming. PUBG, COD, Fortnite all run at max settings without lag. I\'m selling because I\'m getting a gaming console instead. Very clean, no issues. Includes original charger.', 'price' => 468000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'Nokia G42 5G - Durable Phone', 'description' => 'Nokia G42 5G, 128GB. UK used, very clean. Nokia phones are known for their durability and this one is no exception. Android 13, clean software. Battery lasts forever, I charge once every two days with moderate use. Perfect for someone who wants a reliable phone without spending much.', 'price' => 185000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'iPhone SE 2022 - Budget iPhone', 'description' => 'iPhone SE 2022, 64GB. A15 Bionic chip, this little phone is fast. Battery health at 88%. Small dent at the bottom corner, doesn\'t affect use at all. Great entry point into iOS. I\'m selling because I prefer the Face ID on newer iPhones. Includes third-party charger.', 'price' => 365000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'Samsung Galaxy S23 FE - Mint Condition', 'description' => 'Samsung Galaxy S23 FE, 128GB. Mint condition, only used for 2 months. 6 months old, everything works perfectly. The phone is almost like new. I\'m selling because I won a Samsung flagship in a competition. Great phone for the price, sells for 850k new. Selling at a good discount.', 'price' => 625000, 'condition' => 'like_new', 'category' => 'Smartphones'],
            ['title' => 'Infinix Zero 30 5G - Selfie Phone', 'description' => 'Infinix Zero 30 5G, 256GB. 12GB RAM. The highlight is the 108MP front camera, amazing for selfies and TikTok. Curved AMOLED display looks beautiful. Very clean, used for about 3 weeks. I\'m a content creator and upgraded to iPhone for better video quality. Great phone for influencers.', 'price' => 405000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'Vivo Y27s - Brand New Sealed', 'description' => 'Brand new Vivo Y27s, 128GB. Sealed in box, never opened. 50MP camera, 5000mAh battery with 44W fast charging. Side fingerprint scanner is very fast. I\'m a Vivo dealer, selling at good price. Official warranty included. I can deliver in Kano and surrounding states.', 'price' => 218000, 'condition' => 'new', 'category' => 'Smartphones'],
            ['title' => 'Samsung Galaxy A34 5G - Clean', 'description' => 'Samsung Galaxy A34 5G, 128GB. Very clean Nigerian used. 6.6 inch Super AMOLED display is gorgeous. 5000mAh battery lasts all day. I\'m a student selling because I need money for exam fees. The phone is reliable, no issues. Includes case and screen protector.', 'price' => 335000, 'condition' => 'good', 'category' => 'Smartphones'],
            ['title' => 'Xiaomi Redmi Note 13 Pro 5G - Refurbished', 'description' => 'Xiaomi Redmi Note 13 Pro 5G. 256GB, 8GB RAM. 200MP camera takes incredible photos. I\'m a phone repair technician and I refurbished this phone myself. Everything works perfectly, looks almost like new. I\'m selling with a 3-month warranty from my shop. Great value for money.', 'price' => 285000, 'condition' => 'like_new', 'category' => 'Smartphones'],

            // LAPTOPS
            ['title' => 'MacBook Pro M3 14-inch - Space Black', 'description' => 'My MacBook Pro M3 14-inch, Space Black. 512GB SSD, 18GB RAM. I\'m a video editor and this machine has been my workhorse. It\'s powerful, fast, and the battery lasts all day. I\'m selling because I\'m upgrading to the 16-inch model for more screen real estate. Includes original charger and AppleCare+ until 2026.', 'price' => 2780000, 'condition' => 'good', 'category' => 'Laptops'],
            ['title' => 'Dell XPS 15 9530 - Core i9', 'description' => 'Dell XPS 15 9530. Intel Core i9, 13th gen. 32GB RAM, 1TB SSD. OLED 3.5K touchscreen display is absolutely stunning. I\'m a graphic designer and this laptop has been perfect for my work. Selling because I\'m switching to Mac. Includes Dell premium support until next year. Very clean, well ventilated.', 'price' => 1620000, 'condition' => 'good', 'category' => 'Laptops'],
            ['title' => 'HP Omen 16 Gaming Laptop - RTX 4070', 'description' => 'HP Omen 16 gaming laptop. Intel Core i7-13700HX, RTX 4070 8GB, 16GB DDR5 RAM, 512GB SSD. 165Hz display. I\'m a gamer and this laptop can handle any game at high settings. Plays Warzone, Cyberpunk, Starfield without issues. I\'m upgrading to desktop. Includes cooling pad and extra RAM (upgraded to 32GB).', 'price' => 1420000, 'condition' => 'good', 'category' => 'Gaming Laptops'],
            ['title' => 'MacBook Air M2 - Space Gray', 'description' => 'MacBook Air with M2 chip. 256GB, 8GB RAM. Space Gray. Used for 3 months, like new. I\'m a writer and I bought this for writing but ended up preferring my iPad. Battery health at 97%. Includes original charger and a sleeve. Great for students or light work. Selling because I need the cash.', 'price' => 1380000, 'condition' => 'like_new', 'category' => 'Laptops'],
            ['title' => 'ASUS ROG Strix G16 - Gaming Beast', 'description' => 'ASUS ROG Strix G16. Intel Core i9-14900HX, RTX 4080 12GB, 32GB DDR5 RAM, 1TB SSD. 240Hz display. This is a gaming beast, no compromise. I\'m a professional esports player and this laptop has helped me win tournaments. Selling because I\'m retiring from competitive gaming. Everything is perfect.', 'price' => 2800000, 'condition' => 'good', 'category' => 'Gaming Laptops'],
            ['title' => 'Dell Gaming G15 - Budget Gaming', 'description' => 'Dell Gaming G15. Intel Core i5, RTX 3050, 16GB RAM, 512GB SSD. Perfect for students or casual gamers. Plays most games at medium-high settings. I\'m a final year student and I\'m selling because I\'m graduating. The laptop is reliable, no issues. Includes charger and laptop bag.', 'price' => 580000, 'condition' => 'good', 'category' => 'Gaming Laptops'],
            ['title' => 'Lenovo ThinkPad X1 Carbon - Business', 'description' => 'Lenovo ThinkPad X1 Carbon. Intel Core i7, 16GB RAM, 512GB SSD. This is the ultimate business laptop, light and durable. I\'m an executive and I\'ve used it for 2 years. Selling because I got a new one from my company. Keyboard is amazing, very comfortable for typing. Includes dock.', 'price' => 950000, 'condition' => 'good', 'category' => 'Laptops'],
            ['title' => 'HP Laptop 15s Core i7 - Everyday Use', 'description' => 'HP 15s with Intel Core i7, 16GB RAM, 512GB SSD. Perfect for everyday use, office work, browsing. I\'m a banker and this has been my work laptop. Still in good condition. Includes Windows 11 installed and activated. Selling because my company provided a new laptop.', 'price' => 310000, 'condition' => 'good', 'category' => 'Laptops'],
            ['title' => 'MacBook Pro 16 M3 Max - Factory Sealed', 'description' => 'Brand new MacBook Pro 16 with M3 Max chip. 1TB SSD, 36GB RAM. Space Black. I won this in a raffle but I already have a MacBook Pro. Never opened, factory sealed. Includes full Apple warranty. Selling at a discount from market price. Serious buyers only.', 'price' => 4450000, 'condition' => 'new', 'category' => 'Laptops'],
            ['title' => 'LG Gram 17 - Super Light', 'description' => 'LG Gram 17. Intel Core i7-1360P, 16GB RAM, 1TB SSD. This laptop weighs only 1.35kg, incredibly light for a 17-inch laptop. Battery lasts 20 hours. I\'m a consultant and I travel a lot, but I\'m switching to a smaller laptop. Perfect for someone who wants a big screen without the weight.', 'price' => 1320000, 'condition' => 'like_new', 'category' => 'Laptops'],

            // TVs
            ['title' => 'Samsung 65 inch OLED 4K Smart TV', 'description' => 'Brand new Samsung 65 inch OLED Smart TV. I bought it for my new house but the room measurements were wrong and it doesn\'t fit. Still in original box, never mounted. Neural Quantum Processor, Dolby Atmos, Gaming Hub. Includes wall mount. Selling at cost price.', 'price' => 1800000, 'condition' => 'new', 'category' => 'Televisions'],
            ['title' => 'LG 55 inch NanoCell 4K TV - Used', 'description' => 'LG 55 inch NanoCell 4K Smart TV. Used for 8 months, very clean. α7 AI Processor, webOS 23, Dolby Vision IQ. The picture quality is amazing. I\'m moving to a smaller apartment and need to sell. Includes remote, base, and wall mount. The TV is perfect for movies and gaming.', 'price' => 565000, 'condition' => 'good', 'category' => 'Televisions'],
            ['title' => 'Samsung 75 inch QLED 8K TV - Refurbished', 'description' => 'Samsung 75 inch QLED 8K Smart TV. Refurbished but looks and works like new. Quantum Matrix Technology Pro, Neural Quantum 8K Processor. I\'m an electronics dealer and I refurbished this myself. Includes wall mount and 1-year warranty from my shop. Great for those who want the best picture quality.', 'price' => 3150000, 'condition' => 'like_new', 'category' => 'Televisions'],
            ['title' => 'LG C3 55 inch OLED evo TV - Brand New', 'description' => 'Brand new LG C3 55 inch OLED evo TV. Only opened the box to check, never mounted. α9 AI Processor Gen 6, Dolby Vision, G-Sync compatible. Perfect for next-gen gaming and movies. I\'m selling because my wife wants a smaller TV for our bedroom. Includes original box and all accessories.', 'price' => 1220000, 'condition' => 'new', 'category' => 'Televisions'],
            ['title' => 'Sony 55 inch 4K LED TV - Good Condition', 'description' => 'Sony 55 inch 4K LED Smart TV. Used for 2 years, still works perfectly. Picture quality is great, colors are natural. I\'m a movie lover and this TV has served me well. Selling because I\'m moving abroad and can\'t take it. Includes wall mount and smart remote.', 'price' => 385000, 'condition' => 'good', 'category' => 'Televisions'],

            // GAMING
            ['title' => 'PlayStation 5 Disc Edition - Complete Set', 'description' => 'PlayStation 5 Disc Edition. Complete in box with 2 DualSense controllers. I\'ve had it for 6 months, selling because I\'m getting a PC for gaming. Everything works perfectly, latest system update done. Includes 5 games: FC 24, GTA V, Spider-Man 2, God of War, and Horizon. Just plug and play.', 'price' => 665000, 'condition' => 'good', 'category' => 'Gaming Consoles'],
            ['title' => 'Nintendo Switch OLED + Games Bundle', 'description' => 'Nintendo Switch OLED Model, White color. 64GB internal storage. Comes with 4 games: Zelda Tears of the Kingdom, Mario Kart 8, Pokemon Violet, and Animal Crossing. Pro controller included. I\'m a collector and I\'m selling duplicates. Everything is clean and working. Great for family gaming.', 'price' => 415000, 'condition' => 'good', 'category' => 'Gaming Consoles'],
            ['title' => 'Xbox Series X - 1TB with Games', 'description' => 'Xbox Series X. 1TB SSD. Complete in box with 2 controllers. Includes Game Pass Ultimate for 6 months. I\'m a PC gamer and barely used this. It\'s been in my living room for 4 months. Perfect condition. Great for someone who wants the most powerful console.', 'price' => 575000, 'condition' => 'good', 'category' => 'Gaming Consoles'],
            ['title' => 'PS5 Slim Disc Edition - Brand New', 'description' => 'Brand new PlayStation 5 Slim Disc Edition. I won it in a competition but already have a PS5. Never opened. Includes 1 year PlayStation warranty. Also includes a copy of EA FC 24. Selling at market price or slightly below.', 'price' => 610000, 'condition' => 'new', 'category' => 'Gaming Consoles'],

            // FURNITURE & HOME
            ['title' => '7 Seater Dining Table Set - Solid Wood', 'description' => '7 seater dining table set. Solid wood table with 6 matching upholstered chairs. I bought this 2 years ago for 650k, selling because I\'m relocating abroad. The set is still in great condition, just cleaning and polishing needed. The chairs are very comfortable. Delivery can be arranged within Lagos for an extra fee.', 'price' => 420000, 'condition' => 'good', 'category' => 'Furniture'],
            ['title' => 'Leather Sofa Set 3+2+1 - Executive', 'description' => 'Genuine leather sofa set in brown. 3-seater, 2-seater, and 1-seater. Executive style, very comfortable. I\'m an interior designer and this set has been in my showroom. Very minimal use. Perfect for a reception or executive office. The leather is premium, no peeling. Serious buyers can inspect.', 'price' => 680000, 'condition' => 'like_new', 'category' => 'Furniture'],
            ['title' => 'King Size Bed with Orthopedic Mattress', 'description' => 'King size bed frame with 8-inch orthopedic memory foam mattress. Dark brown color, modern design. Storage drawers underneath. I bought this for my new house but ended up going with a different style. Mattress is still in plastic, never used. Selling at half the original price. Delivery can be arranged.', 'price' => 365000, 'condition' => 'like_new', 'category' => 'Furniture'],
            ['title' => 'Executive Office Chair - Leather', 'description' => 'High-back executive office chair. Premium leather, very comfortable. Adjustable armrests, lumbar support, 180-degree recline. Used for 6 months in my home office. I\'m getting a standing desk and need a different chair. The leather is still in great condition. Includes original box.', 'price' => 175000, 'condition' => 'good', 'category' => 'Furniture'],
            ['title' => 'Modern Centre Table - Glass Top', 'description' => 'Modern centre table with tempered glass top and wooden legs. 120cm x 60cm. Sleek design, fits any living room. Very stable and sturdy. I\'m redecorating and need a smaller table. This one is in perfect condition. Selling at a good price. Can deliver within Lagos for a small fee.', 'price' => 78000, 'condition' => 'good', 'category' => 'Furniture'],
            ['title' => 'Hisense 200L Chest Freezer - Brand New', 'description' => 'Brand new Hisense 200 liter chest freezer. Adjustable thermostat, fast freeze function, lockable lid. Energy efficient. I\'m a food vendor and bought two but only needed one. Still in original box. Selling at market price. Includes 1-year manufacturer warranty.', 'price' => 188000, 'condition' => 'new', 'category' => 'Large Appliances'],
            ['title' => 'LG 2HP Inverter AC - Installed', 'description' => 'LG 2HP Dual Inverter AC. 24000 BTU. Fast cooling, low noise operation. WiFi enabled, can control with phone. I installed this in my shop but the shop closed. Only used for 2 weeks. Includes installation but I can uninstall if needed. 5-year compressor warranty. Great for large rooms or shops.', 'price' => 435000, 'condition' => 'like_new', 'category' => 'Large Appliances'],
            ['title' => 'Samsung 1.5HP Inverter AC - Clean', 'description' => 'Samsung 1.5HP Inverter AC. Used for 1 year in my bedroom. Still works perfectly, cooling is excellent. Very energy efficient, my electricity bill reduced after installing it. Includes original remote and wall bracket. I\'m moving to a furnished apartment and can\'t take it. Price is negotiable.', 'price' => 265000, 'condition' => 'good', 'category' => 'Large Appliances'],
            ['title' => 'LG 8kg Front Load Washing Machine', 'description' => 'LG 8kg front load washing machine. Inverter direct drive motor, very quiet. 10 wash programs. WiFi enabled, can start cycles from your phone. I\'m relocating and need to sell quickly. The machine is very clean, no rust. I\'ve maintained it well. Includes installation if you\'re within Lagos.', 'price' => 265000, 'condition' => 'good', 'category' => 'Large Appliances'],
            ['title' => 'Standing Fan 24 inch - Powerful', 'description' => '24 inch standing fan. Very powerful air circulation, cools the whole room. 3 speed settings, oscillating function. Stable base, durable motor. I\'m an AC owner now so I don\'t need it anymore. Works perfectly, just cleaned. Great for power outages or as backup cooling.', 'price' => 42000, 'condition' => 'good', 'category' => 'Small Appliances'],
            ['title' => 'Electric Standing Desk - Adjustable', 'description' => 'Height adjustable electric standing desk. 140cm x 70cm bamboo top. Memory presets for different heights. USB charging ports built-in. Cable management system. I\'m a remote worker and this desk has been great for my health. Selling because I\'m going back to office. Includes everything in original box.', 'price' => 275000, 'condition' => 'good', 'category' => 'Furniture'],
            ['title' => '5 Layer Bookshelf - Modern Design', 'description' => '5 layer bookshelf in engineered wood. Modern white design. 180cm tall, can hold lots of books. Easy to assemble, I have the instructions. I\'m a student graduating and need to sell my room furniture. The shelf is still in good condition. Great for students or home office.', 'price' => 68000, 'condition' => 'good', 'category' => 'Furniture'],

            // FASHION & ACCESSORIES
            ['title' => 'Louis Vuitton Neverfull MM - Damier', 'description' => 'Louis Vuitton Neverfull MM in Damier Ebene canvas. Joan of arc charm included. Very clean, very minimal signs of use. Interior lining is clean, no stains. I\'m a fashion lover but I have too many bags. Selling because I need space. Includes LV dust bag and authenticity card. Can verify at any LV store.', 'price' => 1780000, 'condition' => 'good', 'category' => 'Bags'],
            ['title' => 'Dyson Airwrap Complete Long - Used Once', 'description' => 'Dyson Airwrap Complete Long. For long hair. 6 attachments all included. I bought it, used it once, and realized I\'m not a hair styling person. It\'s basically brand new, never used again. Includes original box and all accessories. Selling at a discount because it\'s been opened.', 'price' => 365000, 'condition' => 'like_new', 'category' => 'Beauty Tools'],
            ['title' => 'Ankara Fabric Bundle - 6 Yards Each', 'description' => 'Premium quality Ankara fabric bundle. 5 different designs, 6 yards each. 100% cotton, vibrant colors that don\'t fade after washing. I\'m a tailor and selling my excess fabric stock. Great for dresses, blouses, or home decor. Price is for the whole bundle. Wholesale prices available for larger quantities.', 'price' => 75000, 'condition' => 'new', 'category' => "Women's Clothing"],
            ['title' => 'Aso-oke Fabric - Hand-woven', 'description' => 'Hand-woven Aso-oke fabric. Pure cotton, very comfortable. Beautiful indigo blue color. 6 yards. Traditional quality that lasts for years. I\'m an elder and my children told me to sell my fabric collection. This is genuine hand-woven Aso-oke, not the machine-made ones. Perfect for traditional occasions.', 'price' => 35000, 'condition' => 'new', 'category' => "Women's Clothing"],
            ['title' => 'Chanel Chance Eau Tendre EDP - 100ml', 'description' => 'Chanel Chance Eau Tendre Eau de Parfum. 100ml spray bottle. About 90% remaining. Sweet, floral fragrance that lasts all day. I received this as a gift but I prefer my other perfume. Original box and packaging included. Can verify authenticity at any Chanel counter.', 'price' => 82000, 'condition' => 'good', 'category' => 'Fragrances'],
            ['title' => 'Adidas Ultraboost 23 - Size 42', 'description' => 'Adidas Ultraboost 23 running shoes. Size 42. Clean, worn only twice for testing. Boost technology is incredibly comfortable. I bought the wrong size, they\'re slightly tight on me. Original receipt included. Great for running or casual wear. Still in almost perfect condition.', 'price' => 125000, 'condition' => 'like_new', 'category' => 'Shoes'],
            ['title' => 'Nike Air Max 97 - Silver Bullet Size 44', 'description' => 'Nike Air Max 97 in Silver Bullet colorway. Size 44. Original Nike, not fake. Worn twice to events. Very clean, no creasing. The iconic design still turns heads. I\'m a collector selling duplicates. Includes original box and extra insoles. Great for sneakerheads or collectors.', 'price' => 135000, 'condition' => 'like_new', 'category' => 'Shoes'],
            ['title' => 'Sony WH-1000XM5 - Like New', 'description' => 'Sony WH-1000XM5 headphones. Industry-leading noise cancellation. Used for about 2 months, like new condition. 30-hour battery life. Crystal clear calls. I\'m a music producer and I\'m getting the newer model. Includes original case, cables, and box. Best noise-canceling headphones on the market.', 'price' => 235000, 'condition' => 'like_new', 'category' => 'Audio & Music Equipment'],
            ['title' => 'Bose QuietComfort Ultra - Premium ANC', 'description' => 'Bose QuietComfort Ultra Headphones. Premium noise cancellation. Used twice, basically brand new. Comfortable for all-day wear. I won these in a competition but already have the XM5s. Includes full accessories and Bose warranty. Great alternative to Sony for those who prefer Bose sound signature.', 'price' => 275000, 'condition' => 'like_new', 'category' => 'Audio & Music Equipment'],
            ['title' => 'Gold Plated Jewelry Set - Nigerian Style', 'description' => 'Luxury gold plated jewelry set. Includes necklace, earrings, and bracelet. Sparkling zirconia stones that look like real diamonds. Anti-tarnish coating. I\'m a jewelry vendor, these are premium quality that I import. Comes in gift box. Perfect for weddings, owambe, or special occasions. Wholesale prices available.', 'price' => 28000, 'condition' => 'new', 'category' => 'Jewelry'],
            ['title' => 'Casio G-Shock Mudmaster GWG-2000', 'description' => 'Casio G-Shock Mudmaster GWG-2000. Mud resistant, carbon core guard. Digital compass, thermometer, solar powered. This is the toughest G-Shock made. Used for 3 months, very clean. I\'m an outdoor enthusiast and I\'m getting a Garmin. Includes original box and manual. Great for construction workers, military, or outdoor adventurers.', 'price' => 175000, 'condition' => 'good', 'category' => 'Watches'],
            ['title' => 'Canon EOS R6 Mark II - Professional Camera', 'description' => 'Canon EOS R6 Mark II. 24.2MP full-frame mirrorless. 4K 60fps video, incredible autofocus. I\'m a professional photographer and this camera has been my workhorse. Shutter count only 3000. Includes RF 24-105mm f/4L lens. Everything is in perfect condition. I\'m upgrading to the R5 II. Includes 2 batteries and original box.', 'price' => 2750000, 'condition' => 'good', 'category' => 'Cameras & Photography'],
            ['title' => 'Designer Perfumes Bundle - Dior, Chanel, YSL', 'description' => 'Designer perfumes bundle. Includes Dior Sauvage 100ml, Chanel Bleu de Chanel 100ml, YSL La Nuit de L\'Homme 100ml. All original, sealed in box. I received these as gifts but already have similar fragrances. Perfect gift for him. Selling all three together or can sell individually. Market value is over 250k.', 'price' => 155000, 'condition' => 'new', 'category' => 'Fragrances'],

            // REAL ESTATE
            ['title' => '4 Bedroom Duplex in Lekki Phase 1', 'description' => '4 bedroom fully detached duplex in Lekki Phase 1. All rooms ensuite with walk-in closets. 5 bathrooms total. BQ (Boys Quarters). Fully serviced estate with 24/7 security, swimming pool, gym. Beautiful landscaping. C of O is available. I\'m the owner, selling because I\'m relocating. Serious buyers should call for inspection. Price is negotiable.', 'price' => 450000000, 'condition' => 'good', 'category' => 'Houses for Sale'],
            ['title' => '3 Bedroom Apartment in Ikoyi - Serviced', 'description' => 'Tastefully finished 3 bedroom apartment in Ikoyi. 3 bathrooms, 2 with bathtubs. 24/7 power supply, swimming pool, gym, 2 parking spaces. Estate is very secure with biometric access. I\'m a diplomat and I\'m leaving Nigeria. The apartment is well maintained. Viewings can be arranged. Furnished option available at extra cost.', 'price' => 85000000, 'condition' => 'good', 'category' => 'Apartments for Sale'],
            ['title' => '600sqm Land on Lekki-Epe Expressway', 'description' => '600 sqm land on Lekki-Epe Expressway. Good neighborhood with many houses already built. Survey plan and deed of assignment are ready. Layout plan approved. I bought this as an investment but I need cash for my business. Price is slightly negotiable for quick sale. Location is appreciating fast due to upcoming road construction.', 'price' => 35000000, 'condition' => 'good', 'category' => 'Land & Plots'],
            ['title' => 'Shop Space on Victoria Island - Ground Floor', 'description' => 'Commercial shop space on Victoria Island. Ground floor, 50 sqm. Very high foot traffic, perfect for retail or showroom. 24/7 security, stable power supply. I\'m a trader and I\'m moving my business to a different location. Lease terms are flexible. Short-term or long-term lease available. Service charge is included in the price for the first year.', 'price' => 45000000, 'condition' => 'good', 'category' => 'Commercial Property'],
            ['title' => 'Self Contain in Yaba - Secure Environment', 'description' => 'Clean self contain apartment in Yaba. Good for students or workers. Running water, constant electricity (inverter included), tiled floors. Secure environment with CCTV. I\'m the landlord and I have one unit available immediately. All bills are inclusive in the rent. No agent fee, deal directly with me. Ideal for UNILAG or Yabatech students.', 'price' => 3500000, 'condition' => 'good', 'category' => 'Apartments for Rent'],
            ['title' => '5 Bedroom Mansion in Banana Island', 'description' => 'Magnificent 5 bedroom mansion in Banana Island. All rooms ensuite with his and hers bathrooms. Cinema room, 2 living rooms, fully fitted kitchen with island. 4 parking spaces, swimming pool, beautiful gardens. The house is a statement of luxury. I\'m an oil tycoon and I\'m downsizing. C of O and building plan are ready. Viewings by appointment only.', 'price' => 1500000000, 'condition' => 'good', 'category' => 'Houses for Sale'],
            ['title' => '3 Bedroom Flat in Maitama - Clean Estate', 'description' => 'Beautifully finished 3 bedroom flat in Maitama. All rooms ensuite, fitted kitchen, store room. Estate has 24/7 security, swimming pool, and regular cleaning. I\'m a civil servant and I\'ve been transferred. The flat is very clean and well maintained. I need a serious tenant or buyer. Furniture can be included at extra cost.', 'price' => 55000000, 'condition' => 'good', 'category' => 'Houses for Rent'],
            ['title' => 'Warehouse in Ikeja Industrial Estate', 'description' => 'Industrial warehouse in Ikeja Industrial Estate. 5000 sqft. High ceiling, loading bay, power supply 3-phase. Good for storage, light manufacturing, or logistics. I run a distribution business and I\'m upgrading to a bigger warehouse. Current lease has 3 years remaining. Service charge is very reasonable for the estate.', 'price' => 120000000, 'condition' => 'good', 'category' => 'Commercial Property'],

            // SPORTS & FITNESS
            ['title' => 'Trek Marlin 7 2023 - Mountain Bike', 'description' => 'Trek Marlin 7 mountain bike. 2023 model, aluminum frame, 29-inch wheels. 12-speed Shimano gearing. Lockout fork for smooth roads. I\'m a mountain biking enthusiast and I\'m upgrading to a full-suspension bike. This Marlin has been well maintained, no issues. Great for trails or commuting. Selling with helmet included.', 'price' => 780000, 'condition' => 'good', 'category' => 'Bicycles'],
            ['title' => 'Adjustable Dumbbells 32kg - Home Gym', 'description' => 'Adjustable dumbbells set. 32kg total (16kg each). Quick-change weight system. Compact design, great for home gym. Includes stand. I\'m a personal trainer and I\'m moving to a gym, so I\'m selling my home equipment. Everything works perfectly. Great for someone building a home gym on a budget.', 'price' => 165000, 'condition' => 'good', 'category' => 'Gym Equipment'],
            ['title' => 'Yoga Mat Premium 6mm - Non-slip', 'description' => 'Premium yoga mat, 6mm thick. Non-slip surface, eco-friendly TPE material. Alignment lines printed on the mat. Multiple colors available. I\'m a yoga instructor and I have several of these. Includes carrying strap. Great for yoga, pilates, or floor exercises. Bulk discount available for studio owners.', 'price' => 22000, 'condition' => 'new', 'category' => 'Fitness'],
            ['title' => 'Camping Tent 4 Person - Waterproof', 'description' => '4 person camping tent. Waterproof with 2000mm hydrostatic head rating. Easy setup in 10 minutes. Rainfly, footprint, and storage pockets included. Very lightweight for its size. I\'m a camping guide and I\'m selling duplicate equipment. This tent has been used for about 20 trips but still in great condition.', 'price' => 68000, 'condition' => 'good', 'category' => 'Outdoor Gear'],
            ['title' => 'JBL PartyBox 310 - Portable Party Speaker', 'description' => 'JBL PartyBox 310. 240W power. Built-in light show syncs to music. Guitar and mic inputs with vocal effects. 18-hour battery life. I DJ small events and this speaker is amazing. Selling because I\'m upgrading to the PartyBox 1000. Everything works perfectly. Includes original charger and cables.', 'price' => 365000, 'condition' => 'good', 'category' => 'Audio & Music Equipment'],
            ['title' => 'Electric Treadmill for Home - 2.5HP', 'description' => 'Electric treadmill for home use. 2.5HP motor, max speed 16km/h. 12 preset programs, heart rate monitor. Folding design for easy storage. Cushioning deck reduces joint impact. I\'m a runner training for a marathon and I need a more professional treadmill. This one is great for beginners or intermediate runners. Includes maintenance tools.', 'price' => 265000, 'condition' => 'good', 'category' => 'Gym Equipment'],
            ['title' => 'Tactical Hiking Backpack 65L', 'description' => '65 liter tactical hiking backpack. MOLLE system, multiple compartments. Rain cover included, hip belt with pockets, sternum strap. Hydration compatible. I\'m a tour guide and I have several backpacks. This one is lightly used, great for multi-day hikes. Perfect for Kilimanjaro or any adventure. Includes free 2-day guided hike as bonus for serious buyer.', 'price' => 48000, 'condition' => 'good', 'category' => 'Outdoor Gear'],
            ['title' => 'Fishing Rod Combo Set - Complete Kit', 'description' => 'Fishing rod combo set. 2.1m telescopic rod, 5000 spinning reel. 4+1 ball bearings. Comes with full tackle box: lures, hooks, floats, weights. Perfect for beginners or intermediate anglers. I\'m a fishing enthusiast and upgrading to more professional gear. This kit is complete, just add line and bait. Good for river or lake fishing.', 'price' => 38000, 'condition' => 'new', 'category' => 'Outdoor Gear'],

            // BEAUTY & HEALTH
            ['title' => 'Organic African Skincare Set - Complete', 'description' => 'Organic African skincare set. Includes face wash, toner, serum, moisturizer, and eye cream. All natural ingredients, no chemicals. Great for all skin types. I\'m a beauty influencer and this is my go-to skincare brand. I have a sponsorship with a different brand now. Can deliver within Lagos. Sensitive skin friendly.', 'price' => 32000, 'condition' => 'new', 'category' => 'Skincare'],
            ['title' => 'Professional Hair Steamer - 1500W', 'description' => 'Professional hair steamer for home or salon use. 1500W power, 45-minute timer with auto shut off. Portable with wheels for easy movement. Distributes steam evenly for deep conditioning. I\'m a hairstylist and I\'m getting a bigger steamer. This one is perfect for home use. Very clean, works great.', 'price' => 58000, 'condition' => 'good', 'category' => 'Beauty Tools'],
            ['title' => 'Hair Products Nigerian Bundle - Kera Care, ORS', 'description' => 'Nigerian hair products bundle. Includes Kera Care shampoo and conditioner, ORS olive oil cream, Elasta QP hair lotion, SheaMoisture leave-in. All authentic products. I\'m a natural hair enthusiast with too much product. All items are sealed with good expiry dates. Perfect starter pack for natural hair journey.', 'price' => 22000, 'condition' => 'new', 'category' => 'Haircare'],
            ['title' => 'Glow Recipe Watermelon Glow Kit - Full Size', 'description' => 'Glow Recipe Watermelon Glow Kit. Full-size cleanser, toner, and moisturizer. Expiry is 2027. I\'m a skincare junkie and I received this as a gift but already have multiples. Great for oily or combination skin. The watermelon scent is amazing. Includes full size products worth over 35k. Selling at a good discount.', 'price' => 48000, 'condition' => 'new', 'category' => 'Skincare'],
            ['title' => 'Oster Classic 76 Hair Clippers - Pro', 'description' => 'Oster Classic 76 clipper. Professional grade, used in salons. Detachable blade, very powerful motor. This clipper can cut through any hair type. I\'m a barber and I\'m upgrading to a cordless model. Everything works perfectly, blades are sharp. Includes extra blade. Great for home grooming or starting a barbershop.', 'price' => 78000, 'condition' => 'good', 'category' => 'Beauty Tools'],

            // MORE ELECTRONICS
            ['title' => 'Samsung Galaxy Tab S9 Ultra - 256GB', 'description' => 'Samsung Galaxy Tab S9 Ultra. 256GB, 12GB RAM. 14.6 inch AMOLED display is absolutely gorgeous. S Pen included. WiFi version. I\'m a designer and I\'ve been using this for sketching and note-taking. It\'s perfect but I\'m switching to iPad Pro for the ecosystem. Very clean, no scratches. Includes book cover case.', 'price' => 950000, 'condition' => 'good', 'category' => 'Tablets'],
            ['title' => 'iPad Pro 12.9 M2 - With Accessories', 'description' => 'Apple iPad Pro 12.9 inch with M2 chip. 256GB, WiFi+Cellular. Includes Apple Pencil 2 and Magic Keyboard. I\'m an architect and this iPad has been amazing for CAD work. Selling because I\'m getting the new M4 model. Everything works perfectly, very clean. Cellular is activated. Includes 2-year AppleCare+.', 'price' => 1380000, 'condition' => 'good', 'category' => 'Tablets'],
            ['title' => 'Nintendo Switch OLED - White with Games', 'description' => 'Nintendo Switch OLED Model, white color. 64GB. Includes 3 games: Zelda, Mario Kart 8, and Animal Crossing. Pro controller. I\'m a parent and the kids have outgrown the Switch. Everything is clean and working. Great for family gaming or as a gift. Includes original box.', 'price' => 395000, 'condition' => 'good', 'category' => 'Gaming Consoles'],
        ];

        $imageCategories = [
            'Smartphones' => [
                'https://picsum.photos/seed/phone1/800/600',
                'https://picsum.photos/seed/phone2/800/600',
                'https://picsum.photos/seed/phone3/800/600',
            ],
            'Cars' => [
                'https://picsum.photos/seed/car1/800/600',
                'https://picsum.photos/seed/car2/800/600',
                'https://picsum.photos/seed/car3/800/600',
            ],
            'Laptops' => [
                'https://picsum.photos/seed/gaminglaptop2/800/600',
                'https://picsum.photos/seed/laptop2/800/600',
                'https://picsum.photos/seed/laptop3/800/600',
            ],
            'Televisions' => [
                'https://picsum.photos/seed/tv1/800/600',
                'https://picsum.photos/seed/tv2/800/600',
            ],
            'Gaming Consoles' => [
                'https://picsum.photos/seed/gaming1/800/600',
                'https://picsum.photos/seed/gaming2/800/600',
                'https://picsum.photos/seed/gaming3/800/600',
            ],
            'Furniture' => [
                'https://picsum.photos/seed/furniture1/800/600',
                'https://picsum.photos/seed/furniture2/800/600',
                'https://picsum.photos/seed/furniture3/800/600',
            ],
            'Large Appliances' => [
                'https://picsum.photos/seed/appliance1/800/600',
                'https://picsum.photos/seed/appliance2/800/600',
            ],
            'Shoes' => [
                'https://picsum.photos/seed/shoes1/800/600',
                'https://picsum.photos/seed/shoes2/800/600',
                'https://picsum.photos/seed/shoes3/800/600',
            ],
            'Houses for Sale' => [
                'https://picsum.photos/seed/house1/800/600',
                'https://picsum.photos/seed/house4/800/600',
                'https://picsum.photos/seed/house5/800/600',
            ],
            'Cameras & Photography' => [
                'https://picsum.photos/seed/camera1/800/600',
                'https://picsum.photos/seed/camera2/800/600',
            ],
            'Audio & Music Equipment' => [
                'https://picsum.photos/seed/audio1/800/600',
                'https://picsum.photos/seed/audio2/800/600',
            ],
            'Bags' => [
                'https://picsum.photos/seed/bag1/800/600',
                'https://picsum.photos/seed/bag2/800/600',
            ],
            'Bicycles' => [
                'https://picsum.photos/seed/bike1/800/600',
                'https://picsum.photos/seed/bike2/800/600',
            ],
            'Gym Equipment' => [
                'https://picsum.photos/seed/gym1/800/600',
                'https://picsum.photos/seed/gym2/800/600',
            ],
            'Tablets' => [
                'https://picsum.photos/seed/tablet1/800/600',
                'https://picsum.photos/seed/tablet2/800/600',
            ],
            'Beauty Tools' => [
                'https://picsum.photos/seed/beauty1/800/600',
                'https://picsum.photos/seed/beauty2/800/600',
            ],
            'Watches' => [
                'https://picsum.photos/seed/watch1/800/600',
                'https://picsum.photos/seed/watch2/800/600',
            ],
            'Jewelry' => [
                'https://picsum.photos/seed/jewelry1/800/600',
                'https://picsum.photos/seed/jewelry2/800/600',
            ],
            'Fabrics' => [
                'https://picsum.photos/seed/women1/800/600',
                'https://picsum.photos/seed/women2/800/600',
            ],
            'Fragrances' => [
                'https://picsum.photos/seed/fragrance1/800/600',
                'https://picsum.photos/seed/fragrance2/800/600',
            ],
            'Audio & Music Equipment' => [
                'https://picsum.photos/seed/audio1/800/600',
                'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
            ],
            'Skincare' => [
                'https://picsum.photos/seed/skincare1/800/600',
                'https://picsum.photos/seed/skincare2/800/600',
            ],
            'Haircare' => [
                'https://picsum.photos/seed/hair1/800/600',
                'https://picsum.photos/seed/hair2/800/600',
            ],
            'Fragrances' => [
                'https://picsum.photos/seed/fragrance1/800/600',
                'https://picsum.photos/seed/fragrance2/800/600',
            ],
            'Gym Equipment' => [
                'https://picsum.photos/seed/gym1/800/600',
                'https://picsum.photos/seed/smallappliance1/800/600',
            ],
            'Bicycles' => [
                'https://picsum.photos/seed/bike1/800/600',
                'https://picsum.photos/seed/bike2/800/600',
            ],
            'Fitness Accessories' => [
                'https://picsum.photos/seed/fitness1/800/600',
                'https://picsum.photos/seed/fitness2/800/600',
            ],
            'Outdoor Gear' => [
                'https://picsum.photos/seed/outdoor1/800/600',
                'https://picsum.photos/seed/outdoor2/800/600',
            ],
            'Houses for Sale' => [
                'https://picsum.photos/seed/house4/800/600',
                'https://picsum.photos/seed/house5/800/600',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            ],
            'Apartments for Sale' => [
                'https://picsum.photos/seed/apt3/800/600',
                'https://picsum.photos/seed/apt4/800/600',
            ],
            'Apartments for Rent' => [
                'https://picsum.photos/seed/apt3/800/600',
                'https://picsum.photos/seed/apt4/800/600',
            ],
            'Houses for Rent' => [
                'https://picsum.photos/seed/house4/800/600',
                'https://picsum.photos/seed/house5/800/600',
            ],
            'Land & Plots' => [
                'https://picsum.photos/seed/land1/800/600',
                'https://picsum.photos/seed/land2/800/600',
            ],
            'Commercial Property' => [
                'https://picsum.photos/seed/commercial1/800/600',
                'https://picsum.photos/seed/commercial2/800/600',
            ],
            'Gaming Consoles' => [
                'https://picsum.photos/seed/gaming1/800/600',
                'https://picsum.photos/seed/gaming2/800/600',
            ],
            'Gaming Laptops' => [
                'https://picsum.photos/seed/desktop2/800/600',
                'https://picsum.photos/seed/gaminglaptop2/800/600',
            ],
            'Large Appliances' => [
                'https://picsum.photos/seed/appliance1/800/600',
                'https://picsum.photos/seed/appliance2/800/600',
            ],
            'Small Appliances' => [
                'https://picsum.photos/seed/smallappliance1/800/600',
                'https://picsum.photos/seed/smallappliance2/800/600',
            ],
            "Women's Clothing" => [
                'https://picsum.photos/seed/women1/800/600',
                'https://picsum.photos/seed/women2/800/600',
            ],
            'Desktop Computers' => [
                'https://picsum.photos/seed/desktop1/800/600',
                'https://picsum.photos/seed/desktop2/800/600',
            ],
        ];

        $defaultImages = [
            'https://picsum.photos/seed/default1/800/600',
            'https://picsum.photos/seed/default2/800/600',
            'https://picsum.photos/seed/default3/800/600',
            'https://picsum.photos/seed/default4/800/600',
            'https://picsum.photos/seed/default5/800/600',
        ];

        $createdAds = 0;
        $maxAds = 120;

        foreach ($sampleAds as $adData) {
            if ($createdAds >= $maxAds) break;

            $category = $categories->where('name', $adData['category'])->first();
            if (!$category) {
                $category = $categories->random();
            }

            $location = $locations->random();
            $user = $users->random();

            $lgas = Location::where('parent_id', $location->id)->get();
            $lga = $lgas->isNotEmpty() ? $lgas->random()->name : null;

            // Get appropriate images for this category
            $categoryImages = $imageCategories[$adData['category']] ?? $defaultImages;
            $numImages = min(rand(3, 5), count($categoryImages));
            $selectedImages = array_slice($categoryImages, 0, $numImages);
            shuffle($selectedImages);

            $ad = Ad::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'location_id' => $location->id,
                'title' => $adData['title'],
                'slug' => Str::slug($adData['title'] . '-' . time() . '-' . $createdAds),
                'description' => $adData['description'],
                'price' => $adData['price'],
                'currency' => 'NGN',
                'condition' => $adData['condition'],
                'status' => 'active',
                'is_featured' => rand(0, 10) < 2, // 20% featured
                'is_verified' => rand(0, 10) < 3, // 30% verified
                'views' => rand(5, 800),
                'lga' => $lga,
                'expires_at' => now()->addDays(30),
            ]);

            // Create multiple ad images (3-5)
            foreach ($selectedImages as $index => $imageUrl) {
                \App\Models\AdImage::create([
                    'ad_id' => $ad->id,
                    'url' => $imageUrl,
                    'original_url' => $imageUrl,
                    'medium_url' => $imageUrl,
                    'thumbnail_url' => $imageUrl,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }

            $createdAds++;
        }

        echo "Created " . $createdAds . " sample ads with realistic descriptions and images.\n";
    }

    public function createLargeDataset(): void
    {
        $this->command->info('Generating large dataset (200+ ads)...');

        $categories = Category::whereNotNull('parent_id')->get()->keyBy('name');
        $locations = Location::whereNull('parent_id')->get();
        $users = User::where('role', 'user')->get();

        if ($users->isEmpty()) {
            $this->command->error('No users found. Please run createSampleUsers first.');
            return;
        }

        $nigerianFirstNames = ['Emeka', 'Chinedu', 'Olumide', 'Adebola', 'Kunle', 'Folake', 'Tunde', 'Ngozi', 'Ibrahim', 'Amaka',
            'Oluwaseun', 'Chidinma', 'Babatunde', 'Adaeze', 'Emmanuel', 'Chiamaka', 'Olufemi', 'Uchechi', 'Adekunle', 'Nneka',
            'Tochukwu', 'Bolaji', 'Ifeoma', 'Ayomide', 'Chukwuemeka', 'Omolabake', 'Obinna', 'Adaeze', 'Oluwafemi', 'Chioma',
            'Segun', 'Adaora', 'Tobi', 'Chinyere', 'Kenny', 'Uchenna', 'Funke', 'Wale', 'Nkiruka', 'Femi'];

        $nigerianLastNames = ['Okonkwo', 'Eze', 'Adeyemi', 'Olawale', 'Ibrahim', 'Nwachukwu', 'Ogunleye', 'Okeke', 'Bakare', 'Obi',
            'Ayodele', 'Chukwu', 'Oluwasanya', 'Okonkwo', 'Ogundimu', 'Onyekwere', 'Adebayo', 'Nnamdi', 'Olatunji', 'Odugbemi',
            'Ogunwale', 'Ekwueme', 'Akinyemi', 'Ubanwa', 'Ogbonna', 'Olumide', 'Ezeh', 'Adeleke', 'Okwu', 'Okafor'];

        $nigerianLocations = [
            'Lagos' => ['Victoria Island', 'Lekki', 'Ikoyi', 'Surulere', 'Yaba', 'Ikeja', 'Epe', 'Badagry', 'Apapa', 'Oshodi', 'Ajah', 'Banana Island'],
            'Abuja' => ['Wuse', 'Garki', 'Maitama', 'Jabi', 'Asokoro', 'Utako', 'Kubwa', 'Gwagwalada', 'Lugbe', 'Karmo', 'Karsana'],
            'Ibadan' => ['Bodija', 'Iyana Ipaja', 'Ring Road', ' Dugbe', 'Molete', 'Challenge', 'Ojoo', 'Akobo', 'New Bodija', 'Eleyele'],
            'Port Harcourt' => ['GRA', 'Trans Amadi', 'Diobu', 'Rumuola', 'Eliozu', 'Ada George', 'Ogbunabali', 'Iwofe', 'Choba', 'Oroazi'],
            'Kano' => ['Kano City', 'Tarauni', 'Fagge', 'Dala', 'Nassarawa', 'Kumbotso', 'Ungogo', 'Gwale', 'Kafin Hausa'],
            'Benin City' => ['GRA', 'Ugbowo', 'Ring Road', 'Slyva Bush', 'New Benin', 'Third Junction', 'Sapele Road'],
            'Calabar' => ['Calabar South', 'Calabar Municipal', 'Ekpo Abasi', 'Old Net', 'Marian Road', 'Ayade Glades'],
        ];

        $largeAds = [
            // CARS - 30 ads
            ['Toyota Camry 2023 XLE', 28500000, 'good', 'Cars', 'Toyota', 'Camry XLE 2023', 'Tokunbo Toyota Camry 2023 XLE. Very clean, first body no accident. Bought from CFAO Motors Lagos. Full option with leather seats, sunroof, and adaptive cruise control. AC is ice cold. I\'m relocating abroad so selling. All papers complete. Serious buyers should call.'],
            ['Honda Accord 2022 Sport', 18500000, 'good', 'Cars', 'Honda', 'Accord Sport 2022', 'Honda Accord 2022 Sport trim. Nigerian used, second owner. 1.5L turbo engine, fuel efficient. No accidents, all parts original. Selling because I need a bigger SUV for the family. Price is slightly negotiable.'],
            ['Mercedes C300 AMG 2022', 42000000, 'good', 'Cars', 'Mercedes', 'C300 AMG 2022', 'Tokunbo Mercedes C300 AMG Line. White color, black interior. Full option with panoramic roof and burmester sound. I imported this myself from Germany. Everything works perfectly. No issues at all.'],
            ['Lexus RX 350 2021', 32500000, 'good', 'Cars', 'Lexus', 'RX 350 2021', 'Clean Lexus RX 350 2021. Tokunbo with clean title. Full option including Mark Levinson sound and panoramic roof. The car is very comfortable. AC is very cold. My mechanic can testify to the condition.'],
            ['Toyota Corolla 2021 LE', 14500000, 'good', 'Cars', 'Toyota', 'Corolla LE 2021', 'Toyota Corolla 2021 LE. Low mileage at 45,000km. Nigerian used, first body. Perfect for someone who wants a reliable car. No problems at all, just regular service. Selling to upgrade.'],
            ['BMW X3 2022 xDrive30i', 38000000, 'like_new', 'Cars', 'BMW', 'X3 xDrive30i 2022', 'Tokunbo BMW X3 2022. M Sport package. I bought this 6 months ago but barely drive it. Only 15,000km on the clock. Everything is still factory fresh. Includes extended warranty.'],
            ['Hyundai Tucson 2023', 22500000, 'new', 'Cars', 'Hyundai', 'Tucson 2023', 'Brand new Hyundai Tucson 2023. White color. Not yet registered, I have the original receipt from Hyundai Nigeria. Full option with wireless charging and Bose sound. Selling because my company gave me a car.'],
            ['Ford Explorer 2021 ST', 24500000, 'good', 'Cars', 'Ford', 'Explorer ST 2021', 'Ford Explorer ST 2021. V6 twin-turbo, 400HP. 7-seater with third row. Nigerian used, very clean. Perfect for large families. AC works well. I\'m a pastor and need to sell for church bus.'],
            ['Audi Q5 2022 Premium Plus', 33500000, 'good', 'Cars', 'Audi', 'Q5 Premium Plus 2022', 'Tokunbo Audi Q5 2022. Quattro AWD. Virtual cockpit, Bang & Olufsen sound. Very clean, no issues. I\'m leaving Nigeria for schooling abroad. The car has all papers.'],
            ['Chevrolet Malibu 2021', 13500000, 'good', 'Cars', 'Chevrolet', 'Malibu LT 2021', 'Chevrolet Malibu 2021 LT. Clean Nigerian used. Apple CarPlay, Android Auto. Fuel consumption is very good. I\'m a civil servant and need to raise money for my child\'s surgery abroad.'],
            ['Nissan Rogue 2022 SL', 18500000, 'good', 'Cars', 'Nissan', 'Rogue SL 2022', 'Nissan Rogue SL 2022. AWD, very clean. ProPILOT assist works great. I\'m the original owner. Selling because I\'ve paid for a Toyota Land Cruiser. The car has never given me any problem.'],
            ['Volkswagen Tiguan 2022', 19500000, 'good', 'Cars', 'Volkswagen', 'Tiguan 2022', 'Volkswagen Tiguan 2022. 2.0L turbo, AWD. Very clean, well maintained. I\'m a businessman and I need to downsize. The Tiguan is great for city driving. All services done at VW center.'],
            ['Mazda CX-5 2023 GT', 23500000, 'like_new', 'Cars', 'Mazda', 'CX-5 GT 2023', 'Mazda CX-5 2023 GT. Soul Red Crystal. Used for only 3 months, basically new. I won this in a competition but already have a car. Includes 5-year warranty from Mazda Nigeria.'],
            ['Kia Sorento 2022 SX', 26500000, 'good', 'Cars', 'Kia', 'Sorento SX 2022', 'Kia Sorento 2022 SX. 7-seater SUV. Very clean, well maintained. I\'m a doctor and I\'m upgrading to a Mercedes GLE. The Sorento has been reliable. AC is ice cold.'],
            ['Jeep Grand Cherokee 2021', 28500000, 'good', 'Cars', 'Jeep', 'Grand Cherokee 2021', 'Jeep Grand Cherokee 2021 Overland. V6 engine, 4WD. Very clean with no issues. I\'m a police officer and I\'m retiring from active duty. Selling to get a smaller car.'],
            ['Porsche Macan 2020', 48500000, 'good', 'Cars', 'Porsche', 'Macan 2020', 'Tokunbo Porsche Macan 2020. 2.0L turbo. Sport chrono package. Very clean and well maintained. I\'m a business owner and I\'ve ordered a new Cayenne. The Macan is perfect for city driving.'],
            ['Range Rover Evoque 2021', 42500000, 'good', 'Cars', 'Land Rover', 'Range Rover Evoque 2021', 'Tokunbo Range Rover Evoque 2021. P250 engine. Very clean, well maintained. Leather interior is still pristine. I\'m downsizing due to fuel costs. Everything works perfectly.'],
            ['Toyota Highlander 2022', 28500000, 'good', 'Cars', 'Toyota', 'Highlander 2022', 'Toyota Highlander 2022. V6 AWD. Nigerian used, very clean. 7-seater with third row. Perfect for large families or school runs. AC is very cold. I\'m selling to get a bus.'],
            ['Subaru Outback 2022', 22500000, 'good', 'Cars', 'Subaru', 'Outback 2022', 'Subaru Outback 2022. AWD, very reliable. EyeSight driver assist works great. I\'m a diplomat and I\'m leaving my post. The car is registered in my name. All papers complete.'],
            ['GMC Yukon 2021 Denali', 38500000, 'good', 'Cars', 'GMC', 'Yukon Denali 2021', 'GMC Yukon Denali 2021. V8 engine, 4WD. Full option with rear entertainment. Very spacious, perfect for big families. I\'m a politician and I\'ve ordered a new Suburban.'],
            ['Toyota Sienna 2023 Hybrid', 31500000, 'like_new', 'Cars', 'Toyota', 'Sienna Hybrid 2023', 'Brand new Toyota Sienna Hybrid 2023. Only driven 500km. I bought it for my wife but she prefers her sedan. Fuel economy is amazing at 35MPG combined. Still has full warranty.'],
            ['Honda CR-V 2022 EX', 20500000, 'good', 'Cars', 'Honda', 'CR-V EX 2022', 'Honda CR-V 2022 EX. AWD, very clean. 1.5L turbo, fuel efficient. I\'m a lawyer and I\'m upgrading to an SUV. The CR-V has been perfect for my daily commute.'],
            ['Volvo XC60 2022 T5', 27500000, 'good', 'Cars', 'Volvo', 'XC60 T5 2022', 'Volvo XC60 2022 T5. Clean title, very well maintained. Pilot Assist works great. I\'m an executive and I\'ve been transferred to Lagos office. The car is perfect for Nigerian roads.'],
            ['Mitsubishi Outlander 2022', 17500000, 'good', 'Cars', 'Mitsubishi', 'Outlander 2022', 'Mitsubishi Outlander 2022. AWD, 7-seater. Nigerian used, clean. Perfect for big families. I\'m a trader and I\'m selling to raise capital for my business. Price is negotiable.'],
            ['Peugeot 3008 2022 GT', 21500000, 'like_new', 'Cars', 'Peugeot', '3008 GT 2022', 'Peugeot 3008 GT Line 2022. 1.6L turbo, very stylish. I\'m a fashion designer and I love the interior design. The car is very clean with only 20,000km. Selling to get an EV.'],
            ['Skoda Octavia 2022 RS', 19500000, 'good', 'Cars', 'Skoda', 'Octavia RS 2022', 'Skoda Octavia RS 2022. 2.0L turbo, great handling. Very underrated car in Nigeria. I\'m a driving enthusiast and I\'m getting a Golf R. The Skoda is fast and practical.'],
            ['Infiniti QX50 2022 Luxe', 28500000, 'good', 'Cars', 'Infiniti', 'QX50 Luxe 2022', 'Tokunbo Infiniti QX50 2022. VC-Turbo engine, smooth power delivery. Full option with Bose sound. The car is very comfortable for long trips. I\'m an oil company executive.'],
            ['Acura RDX 2022 A-Spec', 26500000, 'good', 'Cars', 'Acura', 'RDX A-Spec 2022', 'Acura RDX 2022 A-Spec. SH-AWD, very reliable. I\'m a pilot and I\'m leaving Nigeria for a job overseas. The RDX has been my reliable companion. All services done at Acura center.'],
            ['Genesis GV70 2022 2.5T', 34500000, 'like_new', 'Cars', 'Genesis', 'GV70 2.5T 2022', 'Genesis GV70 2022. Korean luxury, underrated. Full option with Lexicon sound. Only 18,000km, like new. I\'m a tech entrepreneur and I\'m upgrading to an EV.'],
            ['Alfa Romeo Stelvio 2021', 32500000, 'good', 'Cars', 'Alfa Romeo', 'Stelvio 2021', 'Tokunbo Alfa Romeo Stelvio 2021. Q4 AWD, Italian styling. Very fun to drive. I\'m a car enthusiast and I\'m getting a Giulia Quadrifoglio. The Stelvio handles Nigerian roads well.'],

            // SMARTPHONES - 30 ads
            ['iPhone 15 Pro 256GB Titanium', 1850000, 'like_new', 'Smartphones', 'Apple', 'iPhone 15 Pro 256GB', 'iPhone 15 Pro 256GB Titanium. Used for 2 months, like new. Battery health 97%. Includes original box and charger. I\'m switching back to Android. Serious buyers can call or WhatsApp.'],
            ['Samsung S24 Ultra 512GB', 2150000, 'new', 'Smartphones', 'Samsung', 'Galaxy S24 Ultra 512GB', 'Brand new Samsung S24 Ultra 512GB. Factory sealed, never opened. UK version, all networks work. I bought two during a promo. Selling one. Includes Samsung warranty.'],
            ['iPhone 14 Pro 128GB Deep Purple', 1450000, 'good', 'Smartphones', 'Apple', 'iPhone 14 Pro 128GB', 'iPhone 14 Pro 128GB Deep Purple. Used for 8 months. Battery health 88%. Very clean, no scratches. Includes case and screen protector. I\'m upgrading to the 15 Pro.'],
            ['Tecno Spark 20 Pro+ 256GB', 295000, 'new', 'Smartphones', 'Tecno', 'Spark 20 Pro+ 256GB', 'Brand new Tecno Spark 20 Pro+. 256GB storage. I\'m a phone dealer, selling at wholesale price. Comes with full accessories. All networks work. Serious bulk buyers get better discount.'],
            ['Samsung A54 5G 128GB', 385000, 'good', 'Smartphones', 'Samsung', 'Galaxy A54 5G 128GB', 'Samsung A54 5G 128GB. UK used, very clean. I\'ve used it for 3 months. No scratches, no issues. Battery lasts all day. Includes case. Price is negotiable.'],
            ['OPPO Reno 11 F 5G 256GB', 485000, 'new', 'Smartphones', 'OPPO', 'Reno 11 F 5G 256GB', 'Brand new OPPO Reno 11 F 5G. Factory sealed. 256GB with 12GB RAM. 64MP camera takes amazing photos. I\'m an OPPO dealer. Free wireless earbuds for the first 5 buyers.'],
            ['Infinix Note 40 Pro 256GB', 325000, 'like_new', 'Smartphones', 'Infinix', 'Note 40 Pro 256GB', 'Infinix Note 40 Pro. 256GB, 12GB RAM. Used for about a month. Received as a gift but already have a Samsung. Everything works perfectly. Includes original charger.'],
            ['Google Pixel 7a 128GB', 425000, 'good', 'Smartphones', 'Google', 'Pixel 7a 128GB', 'Google Pixel 7a 128GB. US version, fully unlocked. Imported myself. The camera quality is amazing, best for photos. Battery health 92%. Minor scratch at the back.'],
            ['Vivo V30 5G 256GB', 525000, 'new', 'Smartphones', 'Vivo', 'V30 5G 256GB', 'Brand new Vivo V30 5G. 256GB with 12GB RAM. 50MP eye autofocus camera. Aura light for night selfies. I\'m a Vivo dealer with official warranty. Can deliver in Lagos.'],
            ['Samsung Z Flip 4 256GB Bespoke', 785000, 'like_new', 'Smartphones', 'Samsung', 'Galaxy Z Flip 4 256GB', 'Samsung Z Flip 4 256GB Bespoke Edition. Gold color. Very clean, no issues. Foldable display works perfectly. I\'m a fashion blogger and selling to get the Z Flip 5.'],
            ['iPhone 13 128GB Blue', 725000, 'good', 'Smartphones', 'Apple', 'iPhone 13 128GB', 'iPhone 13 128GB Blue. Used for a year. Battery health 85%. Small dent at the corner but screen is perfect. I\'m upgrading. Includes third-party case and charger.'],
            ['Infinix Hot 40i 128GB', 175000, 'new', 'Smartphones', 'Infinix', 'Hot 40i 128GB', 'Brand new Infinix Hot 40i. 128GB. Selling for a friend who is a phone dealer. Great budget phone for students. Free case and earphones. Can deliver in Ibadan.'],
            ['Xiaomi Poco X6 Pro 5G', 425000, 'like_new', 'Smartphones', 'Xiaomi', 'Poco X6 Pro 5G', 'Xiaomi Poco X6 Pro 5G. 256GB, 12GB RAM. Gaming beast, plays all games at max settings. Used for 2 months. I\'m getting a gaming console instead. Includes charger.'],
            ['Nokia G42 5G 128GB', 195000, 'good', 'Smartphones', 'Nokia', 'G42 5G 128GB', 'Nokia G42 5G 128GB. UK used, very clean. Nokia phones are known for durability. Battery lasts forever. Perfect for someone who wants a reliable phone.'],
            ['iPhone SE 2022 64GB', 385000, 'good', 'Smartphones', 'Apple', 'iPhone SE 2022', 'iPhone SE 2022 64GB. A15 Bionic chip, fast. Battery health 87%. Small dent at bottom corner. Great entry into iOS. I prefer Face ID on newer iPhones.'],
            ['Samsung S23 FE 128GB', 545000, 'like_new', 'Smartphones', 'Samsung', 'Galaxy S23 FE 128GB', 'Samsung S23 FE 128GB. Mint condition, used for 3 months. Everything works perfectly. I won this in a competition. Great value phone, sells for 750k new.'],
            ['Infinix Zero 30 5G 256GB', 385000, 'like_new', 'Smartphones', 'Infinix', 'Zero 30 5G 256GB', 'Infinix Zero 30 5G 256GB. 12GB RAM. 108MP front camera is amazing for selfies and TikTok. Used for 3 weeks. I\'m a content creator upgrading to iPhone.'],
            ['Vivo Y27s 128GB', 225000, 'new', 'Smartphones', 'Vivo', 'Y27s 128GB', 'Brand new Vivo Y27s 128GB. Sealed in box. 50MP camera, 5000mAh battery with 44W fast charging. Side fingerprint scanner is fast. Official Vivo warranty.'],
            ['Samsung A34 5G 128GB', 315000, 'good', 'Smartphones', 'Samsung', 'Galaxy A34 5G 128GB', 'Samsung A34 5G 128GB. Very clean Nigerian used. 6.6 inch AMOLED display looks beautiful. I\'m a student needing money for exam fees. Phone is reliable.'],
            ['Xiaomi Redmi Note 13 Pro 5G', 265000, 'like_new', 'Smartphones', 'Xiaomi', 'Redmi Note 13 Pro 5G', 'Xiaomi Redmi Note 13 Pro 5G. 256GB, 8GB RAM. 200MP camera. I\'m a phone technician, refurbished this myself. Works perfectly. 3-month warranty from my shop.'],
            ['iPhone 12 Pro Max 256GB', 1050000, 'good', 'Smartphones', 'Apple', 'iPhone 12 Pro Max 256GB', 'iPhone 12 Pro Max 256GB. Graphite color. Battery health 82%. Used for 2 years, still works great. I\'m upgrading to the 15 Pro Max. Includes original box.'],
            ['OPPO A78 5G 128GB', 245000, 'good', 'Smartphones', 'OPPO', 'A78 5G 128GB', 'OPPO A78 5G 128GB. UK used, very clean. 50MP camera takes good photos. I\'m an OPPO dealer, selling at good price. All networks work.'],
            ['Realme C55 128GB', 155000, 'like_new', 'Smartphones', 'Realme', 'C55 128GB', 'Realme C55 128GB. Used for about a month. Mini capsule feature is interesting. Battery lasts all day. I\'m a student selling to get a better phone.'],
            ['Samsung Z Fold 4 256GB', 1150000, 'good', 'Smartphones', 'Samsung', 'Galaxy Z Fold 4 256GB', 'Samsung Z Fold 4 256GB. Very clean, no issues. Foldable display works perfectly. Great for productivity. I\'m getting the Z Fold 5. Includes S Pen.'],
            ['iPhone 11 Pro 64GB', 585000, 'good', 'Smartphones', 'Apple', 'iPhone 11 Pro 64GB', 'iPhone 11 Pro 64GB. Space Gray. Battery health 79%. Has some scratches on the back but screen is perfect. Good camera. I\'m upgrading.'],
            ['Tecno Camon 20 Pro 256GB', 285000, 'new', 'Smartphones', 'Tecno', 'Camon 20 Pro 256GB', 'Brand new Tecno Camon 20 Pro. 256GB. I\'m a phone dealer. Great camera phone at a good price. All accessories included.'],
            ['Samsung A14 5G 128GB', 195000, 'good', 'Smartphones', 'Samsung', 'Galaxy A14 5G 128GB', 'Samsung A14 5G 128GB. Nigerian used, very clean. 50MP camera, 5000mAh battery. I\'m a teacher selling because I need money. Great phone for the price.'],
            ['Xiaomi 13 Lite 256GB', 365000, 'like_new', 'Smartphones', 'Xiaomi', '13 Lite 256GB', 'Xiaomi 13 Lite 256GB. Used for 2 months, like new. Slim design, great for one-handed use. I\'m getting the iPhone 15. Includes original charger.'],
            ['iPhone 15 128GB Pink', 1250000, 'like_new', 'Smartphones', 'Apple', 'iPhone 15 128GB', 'iPhone 15 128GB Pink. Used for about a month. Like new condition. Battery health 99%. I received this as a gift but already have an iPhone 14.'],
            ['Infinix Smart 8 64GB', 125000, 'new', 'Smartphones', 'Infinix', 'Smart 8 64GB', 'Brand new Infinix Smart 8. 64GB. Great entry-level smartphone. I\'m selling for a friend. Perfect for elderly parents or as a backup phone.'],

            // LAPTOPS - 25 ads
            ['MacBook Pro M3 14-inch', 2850000, 'like_new', 'Laptops', 'Apple', 'MacBook Pro M3 14-inch', 'MacBook Pro M3 14-inch Space Black. 512GB SSD, 18GB RAM. I\'m a video editor and selling because I\'m upgrading to the 16-inch. Battery health 96%. Includes charger and AppleCare+.'],
            ['Dell XPS 15 9530 Core i9', 1650000, 'good', 'Laptops', 'Dell', 'XPS 15 9530 Core i9', 'Dell XPS 15 9530. Intel Core i9, 32GB RAM, 1TB SSD. OLED 3.5K touchscreen. I\'m a graphic designer switching to Mac. Very clean. Includes Dell premium support.'],
            ['HP Omen 16 RTX 4070', 1450000, 'good', 'Gaming Laptops', 'HP', 'Omen 16 RTX 4070', 'HP Omen 16 gaming laptop. Intel i7-13700HX, RTX 4070 8GB, 16GB DDR5, 512GB SSD. 165Hz display. Plays all games at high settings. I\'m upgrading to desktop.'],
            ['MacBook Air M2 256GB', 1250000, 'like_new', 'Laptops', 'Apple', 'MacBook Air M2 256GB', 'MacBook Air M2 256GB Space Gray. Used for 3 months. Fanless design is silent. Battery health 97%. I\'m a writer and prefer my iPad. Includes charger.'],
            ['ASUS ROG Strix G16 RTX 4080', 2650000, 'good', 'Gaming Laptops', 'ASUS', 'ROG Strix G16 RTX 4080', 'ASUS ROG Strix G16. Intel i9-14900HX, RTX 4080 12GB, 32GB DDR5, 1TB SSD. 240Hz display. Gaming beast. I\'m retiring from competitive gaming.'],
            ['Dell Gaming G15 Core i5 RTX 3050', 485000, 'good', 'Gaming Laptops', 'Dell', 'Gaming G15 Core i5', 'Dell Gaming G15. Intel Core i5, RTX 3050, 16GB RAM, 512GB SSD. Good for students and casual gamers. I\'m graduating. Everything works well.'],
            ['Lenovo ThinkPad X1 Carbon', 875000, 'good', 'Laptops', 'Lenovo', 'ThinkPad X1 Carbon', 'Lenovo ThinkPad X1 Carbon. Intel Core i7, 16GB RAM, 512GB SSD. Ultimate business laptop. Very light and durable. Keyboard is amazing. Includes docking station.'],
            ['HP Laptop 15s Core i7', 385000, 'good', 'Laptops', 'HP', 'Laptop 15s Core i7', 'HP 15s with Intel Core i7, 16GB RAM, 512GB SSD. Perfect for office work. I\'m a banker and my company provided a new laptop. Windows 11 activated.'],
            ['MacBook Pro 16 M3 Max Sealed', 4450000, 'new', 'Laptops', 'Apple', 'MacBook Pro 16 M3 Max', 'Brand new MacBook Pro 16 M3 Max. 1TB SSD, 36GB RAM. Space Black. Won in a raffle. Never opened. Full Apple warranty. Selling at discount.'],
            ['LG Gram 17 Core i7', 1125000, 'like_new', 'Laptops', 'LG', 'Gram 17 Core i7', 'LG Gram 17. Intel Core i7-1360P, 16GB RAM, 1TB SSD. Weighs only 1.35kg! Battery lasts 20 hours. I\'m switching to a smaller laptop for travel.'],
            ['Acer Aspire 5 Core i5', 285000, 'good', 'Laptops', 'Acer', 'Aspire 5 Core i5', 'Acer Aspire 5. Intel Core i5, 12GB RAM, 512GB SSD. Great everyday laptop. I\'m a student graduating. Works well for office tasks and browsing.'],
            ['Microsoft Surface Pro 9', 1350000, 'like_new', 'Laptops', 'Microsoft', 'Surface Pro 9', 'Microsoft Surface Pro 9. Intel Core i7, 16GB RAM, 256GB. Type cover and Surface Pen included. Very portable. I\'m getting the new MacBook Air.'],
            ['Lenovo IdeaPad Gaming 3 RTX 3050', 525000, 'good', 'Gaming Laptops', 'Lenovo', 'IdeaPad Gaming 3 RTX 3050', 'Lenovo IdeaPad Gaming 3. Intel Core i5, RTX 3050, 8GB RAM, 512GB SSD. Good for gaming and productivity. I\'m upgrading.'],
            ['ASUS ZenBook 14 OLED', 685000, 'good', 'Laptops', 'ASUS', 'ZenBook 14 OLED', 'ASUS ZenBook 14 OLED. Intel Core i7, 16GB RAM, 512GB SSD. OLED display is stunning. Very slim and light. I\'m an architect switching to Mac.'],
            ['HP Pavilion Plus 14', 575000, 'like_new', 'Laptops', 'HP', 'Pavilion Plus 14', 'HP Pavilion Plus 14. Intel Core i7, 16GB RAM, 512GB SSD. 2.8K OLED display. Used for 2 months. I\'m getting the Spectre x360. Includes original charger.'],
            ['Dell Inspiron 16 Plus', 725000, 'good', 'Laptops', 'Dell', 'Inspiron 16 Plus', 'Dell Inspiron 16 Plus. Intel Core i7, 16GB RAM, 512GB SSD. 3K resolution display. Great for content creators. I\'m a photographer upgrading.'],
            ['Lenovo Legion 5 Pro RTX 3060', 1125000, 'good', 'Gaming Laptops', 'Lenovo', 'Legion 5 Pro RTX 3060', 'Lenovo Legion 5 Pro. AMD Ryzen 7, RTX 3060 6GB, 16GB RAM, 512GB SSD. 165Hz display. I\'m building a desktop instead.'],
            ['MacBook Air M1 256GB', 785000, 'good', 'Laptops', 'Apple', 'MacBook Air M1 256GB', 'MacBook Air M1 256GB Gold. Used for a year. Still fast, fanless. Battery health 89%. I\'m a student upgrading to M2. Includes charger and sleeve.'],
            ['Acer Nitro 5 RTX 4050', 685000, 'good', 'Gaming Laptops', 'Acer', 'Nitro 5 RTX 4050', 'Acer Nitro 5. Intel Core i5, RTX 4050 6GB, 16GB RAM, 512GB SSD. Good budget gaming laptop. I\'m a final year student. Works great.'],
            ['ASUS VivoBook S15', 425000, 'good', 'Laptops', 'ASUS', 'VivoBook S15', 'ASUS VivoBook S15. Intel Core i7, 16GB RAM, 512GB SSD. Slim and lightweight. I\'m an intern and my company gave me a laptop. Selling to raise cash.'],
            ['HP Envy x360 OLED', 825000, 'like_new', 'Laptops', 'HP', 'Envy x360 OLED', 'HP Envy x360 OLED. AMD Ryzen 7, 16GB RAM, 512GB SSD. 2-in-1 convertible with OLED display. Used for 3 months. I\'m getting the MacBook Pro.'],
            ['Dell Latitude 5430', 635000, 'good', 'Laptops', 'Dell', 'Latitude 5430', 'Dell Latitude 5430. Intel Core i5, 16GB RAM, 256GB SSD. Business laptop, very reliable. I\'m a consultant and upgrading. Includes docking station.'],
            ['Lenovo Yoga Slim 7 Carbon', 925000, 'like_new', 'Laptops', 'Lenovo', 'Yoga Slim 7 Carbon', 'Lenovo Yoga Slim 7 Carbon. AMD Ryzen 7, 16GB RAM, 512GB SSD. Only 1.1kg! OLED display. Used for a month. I\'m switching to Mac.'],
            ['MSI Katana GF66 RTX 3060', 975000, 'good', 'Gaming Laptops', 'MSI', 'Katana GF66 RTX 3060', 'MSI Katana GF66. Intel Core i7, RTX 3060 6GB, 16GB RAM, 512GB SSD. 144Hz display. I\'m a gamer upgrading to RTX 4080 desktop.'],
            ['Microsoft Surface Laptop Go 3', 485000, 'like_new', 'Laptops', 'Microsoft', 'Surface Laptop Go 3', 'Microsoft Surface Laptop Go 3. Intel Core i5, 8GB RAM, 256GB SSD. Very portable at 1.1kg. Used for 2 months. I\'m getting the MacBook Air.'],

            // TVs - 15 ads
            ['Samsung 65 inch OLED 4K Smart TV', 1850000, 'new', 'Televisions', 'Samsung', '65 inch OLED 4K', 'Brand new Samsung 65 inch OLED Smart TV. Bought for my new house but room was too small. Still in box. Neural Quantum Processor. Includes wall mount.'],
            ['LG 55 inch NanoCell 4K TV', 485000, 'good', 'Televisions', 'LG', '55 inch NanoCell 4K', 'LG 55 inch NanoCell 4K Smart TV. Used for 8 months. α7 AI Processor. The picture quality is amazing. Moving to smaller apartment.'],
            ['Samsung 75 inch QLED 8K TV', 2850000, 'like_new', 'Televisions', 'Samsung', '75 inch QLED 8K', 'Samsung 75 inch QLED 8K Smart TV. Refurbished by myself. Looks and works like new. I\'m an electronics dealer. 1-year warranty from my shop.'],
            ['LG C3 55 inch OLED evo TV', 1050000, 'like_new', 'Televisions', 'LG', 'C3 55 inch OLED evo', 'LG C3 55 inch OLED evo TV. Only opened box to check, never mounted. α9 AI Processor. Perfect for gaming and movies. Wife wants smaller TV.'],
            ['Sony 55 inch 4K LED TV', 385000, 'good', 'Televisions', 'Sony', '55 inch 4K LED', 'Sony 55 inch 4K LED Smart TV. Used for 2 years. Colors are natural. Moving abroad and can\'t take it. Includes wall mount.'],
            ['TCL 50 inch 4K Android TV', 285000, 'new', 'Televisions', 'TCL', '50 inch 4K Android TV', 'Brand new TCL 50 inch 4K Android TV. Sealed in box. Great value for the price. I\'m a dealer with warranty.'],
            ['Hisense 43 inch Smart TV', 185000, 'like_new', 'Televisions', 'Hisense', '43 inch Smart TV', 'Hisense 43 inch Smart TV. Used for 4 months. Perfect for bedroom. Upgrading to 55 inch. Includes remote and wall bracket.'],
            ['Samsung 50 inch Crystal UHD TV', 325000, 'good', 'Televisions', 'Samsung', '50 inch Crystal UHD', 'Samsung 50 inch Crystal UHD Smart TV. Very clean. Perfect for living room. I\'m moving to a furnished apartment.'],
            ['LG 65 inch Nanocell TV', 685000, 'good', 'Televisions', 'LG', '65 inch Nanocell', 'LG 65 inch Nanocell 4K Smart TV. Used for a year. Great colors. I\'m relocating to Lagos. Can arrange delivery.'],
            ['Samsung 55 inch Frame TV', 785000, 'good', 'Televisions', 'Samsung', '55 inch The Frame', 'Samsung 55 inch The Frame TV. Art Mode looks like a painting. Comes with 20 artworks. Selling because I\'m redecorating.'],
            ['Xiaomi 55 inch OLED TV', 565000, 'new', 'Televisions', 'Xiaomi', '55 inch OLED TV', 'Brand new Xiaomi 55 inch OLED TV. Sealed in box. I bought it for a project but it fell through. Includes warranty.'],
            ['Hisense 55 inch ULED 4K TV', 385000, 'good', 'Televisions', 'Hisense', '55 inch ULED 4K', 'Hisense 55 inch ULED 4K Smart TV. Very clean. Good picture quality at good price. I\'m a dealer with warranty.'],
            ['LG 48 inch OLED TV', 725000, 'like_new', 'Televisions', 'LG', '48 inch OLED', 'LG 48 inch OLED TV. Perfect for gaming and movies. Used for 3 months. Upgrading to 55 inch. Includes wall mount.'],
            ['Sony 65 inch LED Smart TV', 585000, 'good', 'Televisions', 'Sony', '65 inch LED Smart TV', 'Sony 65 inch LED Smart TV. Android TV OS. Very clean. I\'m a movie lover and this TV has been great. Moving abroad.'],
            ['TCL 65 inch QLED TV', 465000, 'new', 'Televisions', 'TCL', '65 inch QLED 4K', 'Brand new TCL 65 inch QLED 4K Smart TV. Sealed. I\'m a TV dealer. Best price in market. Can deliver in Lagos.'],

            // FURNITURE - 20 ads
            ['7 Seater Dining Table Set Solid Wood', 385000, 'good', 'Furniture', 'Generic', '7 Seater Dining Set', '7 seater dining table set. Solid wood with 6 upholstered chairs. I bought 2 years ago for 550k. Relocating abroad. Very minimal use. Delivery can be arranged.'],
            ['Leather Sofa Set 3+2+1 Executive', 625000, 'like_new', 'Furniture', 'Generic', 'Executive Leather Sofa', 'Genuine leather sofa set. 3-seater, 2-seater, and 1-seater. Executive style. Very minimal use. Perfect for reception. I\'m an interior designer.'],
            ['King Size Bed with Orthopedic Mattress', 325000, 'like_new', 'Furniture', 'Generic', 'King Size Bed', 'King size bed frame with 8-inch orthopedic memory foam mattress. Dark brown, modern design. Storage drawers. Bought for new house but changed style.'],
            ['Executive Office Chair Leather', 165000, 'good', 'Furniture', 'Generic', 'Executive Office Chair', 'High-back executive office chair. Premium leather. Adjustable armrests and lumbar support. Used for 6 months in home office. Getting a standing desk.'],
            ['Modern Centre Table Glass Top', 68000, 'good', 'Furniture', 'Generic', 'Glass Centre Table', 'Modern centre table with tempered glass top and wooden legs. 120cm x 60cm. Very stable and sleek. Redecorating and need smaller table.'],
            ['Standing Fan 24 inch Powerful', 38000, 'good', 'Small Appliances', 'Generic', '24 inch Standing Fan', '24 inch standing fan. Powerful air circulation. 3 speed settings, oscillating. Now using AC so don\'t need it. Works perfectly.'],
            ['Electric Standing Desk Adjustable', 245000, 'like_new', 'Furniture', 'Generic', 'Standing Desk', 'Height adjustable electric standing desk. 140cm x 70cm bamboo top. Memory presets for heights. USB charging ports. Going back to office.'],
            ['5 Layer Bookshelf Modern Design', 58000, 'good', 'Furniture', 'Generic', '5 Layer Bookshelf', '5 layer bookshelf in engineered wood. White design. 180cm tall. Easy to assemble. Student graduating and need to sell.'],
            ['TV Stand Modern with Storage', 85000, 'good', 'Furniture', 'Generic', 'TV Stand', 'Modern TV stand with storage compartments. Fits up to 55 inch TV. Glossy finish. Redecorating living room.'],
            ['Wardrobe 4 Door Sliding Mirror', 185000, 'good', 'Furniture', 'Generic', '4 Door Wardrobe', '4 door wardrobe with sliding mirror doors. Lots of storage space. Light wood color. Bedroom renovation.'],
            ['Office Desk L Shape with Drawers', 125000, 'good', 'Furniture', 'Generic', 'L Shape Office Desk', 'L shape office desk with 3 drawers. Perfect for home office setup. I\'m a freelancer switching to co-working space.'],
            ['Recliner Sofa Set 3+1 Brown', 285000, 'good', 'Furniture', 'Generic', 'Recliner Sofa Set', 'Recliner sofa set. 3-seater with individual recliners and 1-seater. Very comfortable. Brown leather. I\'m upgrading.'],
            ['Baby Crib with Mattress', 95000, 'like_new', 'Furniture', 'Generic', 'Baby Crib', 'Baby crib with mattress. Convertible design. Used for 6 months. Baby has grown out of it. Includes bedding set.'],
            ['Patio Furniture Set 4 Pieces', 165000, 'good', 'Outdoor Gear', 'Generic', 'Patio Furniture Set', '4 piece patio furniture set. 1 table and 4 chairs. Weather resistant. Great for balcony or garden. Relocating to apartment.'],
            ['Storage Ottoman with Tray', 35000, 'good', 'Furniture', 'Generic', 'Storage Ottoman', 'Storage ottoman with serving tray. Faux leather, brown. Opens to store items. Perfect for living room. Moving to furnished apartment.'],
            ['Bar Stools Set of 3', 75000, 'like_new', 'Furniture', 'Generic', 'Bar Stools Set', 'Set of 3 adjustable bar stools. Chrome finish with cushioned seats. Used for 2 months. Got as gift but already have stools.'],
            ['Shoe Rack Wooden 5 Tier', 28000, 'new', 'Furniture', 'Generic', '5 Tier Shoe Rack', '5 tier wooden shoe rack. Easy to assemble. Holds lots of shoes. I\'m a shoe collector selling duplicates.'],
            ['Corner Shelf Floating Wall Mount', 22000, 'new', 'Home Decor', 'Generic', 'Corner Shelf', 'Floating corner shelf set. 3 tiers. Modern design. Great for plants or decor. I\'m redecorating with different shelves.'],
            ['Dressing Table with Mirror and Lights', 125000, 'like_new', 'Furniture', 'Generic', 'Dressing Table', 'Vanity dressing table with Hollywood mirror and lights. 5 bulbs. Drawers for storage. Used for 4 months. Upgrading to larger size.'],
            ['Computer Desk Simple Design', 45000, 'good', 'Furniture', 'Generic', 'Computer Desk', 'Simple computer desk with drawer. Fits PC and monitor. Student leaving campus. Works well for study or work.'],
        ];

        $imageUrls = [
            'Cars' => [
                'https://picsum.photos/seed/car1/800/600',
                'https://picsum.photos/seed/car2/800/600',
                'https://picsum.photos/seed/car3/800/600',
            ],
            'Smartphones' => [
                'https://picsum.photos/seed/phone1/800/600',
                'https://picsum.photos/seed/phone2/800/600',
                'https://picsum.photos/seed/phone3/800/600',
            ],
            'Laptops' => [
                'https://picsum.photos/seed/gaminglaptop2/800/600',
                'https://picsum.photos/seed/laptop2/800/600',
                'https://picsum.photos/seed/laptop3/800/600',
            ],
            'Gaming Laptops' => [
                'https://picsum.photos/seed/desktop2/800/600',
                'https://images.unsplash.com/photo-160igo5f20f8-4b0f9f2?w=800&q=80',
                'https://images.unsplash.com/photo-160igo5f20f8-4b0f9f2?w=800&q=80',
            ],
            'Televisions' => [
                'https://picsum.photos/seed/tv1/800/600',
                'https://picsum.photos/seed/tv2/800/600',
            ],
            'Furniture' => [
                'https://picsum.photos/seed/furniture1/800/600',
                'https://picsum.photos/seed/furniture2/800/600',
                'https://picsum.photos/seed/furniture3/800/600',
            ],
            'Small Appliances' => [
                'https://picsum.photos/seed/smallappliance1/800/600',
                'https://picsum.photos/seed/smallappliance2/800/600',
            ],
            'Outdoor Gear' => [
                'https://picsum.photos/seed/outdoor1/800/600',
                'https://picsum.photos/seed/outdoor2/800/600',
            ],
            'Home Decor' => [
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
                'https://picsum.photos/seed/appliance1/800/600',
            ],
        ];

        $defaultImages = [
            'https://picsum.photos/seed/skincare1/800/600',
            'https://picsum.photos/seed/beauty1/800/600',
            'https://picsum.photos/seed/beauty2/800/600',
        ];

        $createdAds = 0;

        foreach ($largeAds as $adData) {
            $categoryName = $adData[3]; // Category is at index 3
            $category = $categories->get($categoryName);
            if (!$category) {
                continue;
            }

            $locationData = $nigerianLocations[array_rand($nigerianLocations)];
            $location = $locations->random();

            $firstName = $nigerianFirstNames[array_rand($nigerianFirstNames)];
            $lastName = $nigerianLastNames[array_rand($nigerianLastNames)];
            $sellerName = "$firstName $lastName";

            $phone = '0' . rand(701, 909) . rand(1000000, 9999999);

            $lgas = Location::where('parent_id', $location->id)->get();
            $lga = $lgas->isNotEmpty() ? $lgas->random()->name : null;

            $adImages = $imageUrls[$categoryName] ?? $defaultImages;
            $numImages = min(rand(3, 5), count($adImages));
            $selectedImages = array_slice($adImages, 0, $numImages);
            shuffle($selectedImages);

            $ad = Ad::create([
                'user_id' => $users->random()->id,
                'category_id' => $category->id,
                'location_id' => $location->id,
                'title' => $adData[0],
                'slug' => Str::slug($adData[0] . '-' . time() . '-' . $createdAds),
                'description' => $adData[6],
                'price' => $adData[1],
                'currency' => 'NGN',
                'condition' => $adData[2],
                'status' => 'active',
                'is_featured' => rand(0, 10) < 2,
                'is_verified' => rand(0, 10) < 3,
                'views' => rand(5, 500),
                'lga' => $lga,
                'expires_at' => now()->addDays(30),
            ]);

            foreach ($selectedImages as $index => $imageUrl) {
                AdImage::create([
                    'ad_id' => $ad->id,
                    'url' => $imageUrl,
                    'original_url' => $imageUrl,
                    'medium_url' => $imageUrl,
                    'thumbnail_url' => $imageUrl,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }

            $createdAds++;

            if ($createdAds % 20 === 0) {
                $this->command->info("Created $createdAds ads...");
            }
        }

        $this->command->info("Total: $createdAds ads created with images!");
    }
}
