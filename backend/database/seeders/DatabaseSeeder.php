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
            $parent = Category::updateOrCreate(
                ['slug' => $catData['slug']],
                [
                    'name' => $catData['name'],
                    'icon' => $catData['icon'],
                    'is_active' => true,
                ]
            );

            foreach ($catData['subcategories'] as $subData) {
                Category::updateOrCreate(
                    ['slug' => $subData['slug']],
                    [
                        'name' => $subData['name'],
                        'icon' => $catData['icon'],
                        'parent_id' => $parent->id,
                        'is_active' => true,
                    ]
                );
            }
        }

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

        User::updateOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'password' => bcrypt('password'),
                'role' => 'user',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@ilist.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // Create sample ads
        $this->createSampleAds();
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

        $sampleAds = [
            ['title' => 'Toyota Prado 2025 SUV', 'description' => 'Brand new Toyota Prado 2025, imported from Japan. Excellent condition, full options. Serious buyers only.', 'price' => 45000000, 'condition' => 'new'],
            ['title' => 'iPhone 15 Pro Max 256GB', 'description' => 'Apple iPhone 15 Pro Max, 256GB, Titanium color. Still under warranty. Unlocked for all networks.', 'price' => 850000, 'condition' => 'new'],
            ['title' => '4 Bedroom Duplex in Lekki', 'description' => 'Luxury 4 bedroom duplex in Lekki Phase 1. Fully serviced, 24/7 security, generator. Agent fee applies.', 'price' => 85000000, 'condition' => 'used'],
            ['title' => 'HP Laptop 15s Core i7', 'description' => 'HP 15s laptop with Intel Core i7, 16GB RAM, 512GB SSD. Perfect for work and gaming. Slightly used.', 'price' => 320000, 'condition' => 'used'],
            ['title' => 'Samsung Galaxy S24 Ultra', 'description' => 'Samsung Galaxy S24 Ultra, 512GB, Titanium Black. Brand new, sealed box. Exchange possible.', 'price' => 780000, 'condition' => 'new'],
            ['title' => 'Mercedes C300 2023', 'description' => 'Tokunbo Mercedes C300, 2023 model. Accident free, all papers intact. Buy and drive.', 'price' => 38000000, 'condition' => 'used'],
            ['title' => 'LG 55 inch Smart TV', 'description' => 'LG 55 inch 4K Smart TV, WebOS. Excellent picture quality. Wall mount included.', 'price' => 280000, 'condition' => 'used'],
            ['title' => 'Toyota Camry 2022', 'description' => '2022 Toyota Camry, XLE trim. Nigerian used, first owner. All documents valid.', 'price' => 22000000, 'condition' => 'used'],
            ['title' => 'MacBook Pro M3 14 inch', 'description' => 'Apple MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Space Gray. AppleCare+ included.', 'price' => 1200000, 'condition' => 'new'],
            ['title' => 'Dining Table Set 6 Chairs', 'description' => 'Modern dining table set with 6 upholstered chairs. Solid wood, excellent condition. Moving sale.', 'price' => 180000, 'condition' => 'used'],
            ['title' => 'Honda Civic 2021', 'description' => '2021 Honda Civic, Sport trim. Nigerian used, buy and drive. No issues whatsoever.', 'price' => 16500000, 'condition' => 'used'],
            ['title' => 'PS5 Console + 2 Controllers', 'description' => 'Sony PlayStation 5 with 2 controllers and 3 games. Excellent condition. Disk version.', 'price' => 450000, 'condition' => 'used'],
            ['title' => 'Inverter AC 1.5HP', 'description' => 'LG Inverter AC 1.5HP, cooling capacity 12000BTU. Energy efficient. Installation available.', 'price' => 195000, 'condition' => 'new'],
            ['title' => 'Golf 5 GTI 2010', 'description' => 'Volkswagen Golf GTI, 2010 model. Sport suspension, sunroof. Needs work but great car.', 'price' => 4500000, 'condition' => 'used'],
            ['title' => 'Nokia 3310 (2024 Edition)', 'description' => 'Nokia 3310 (2024 edition). Long battery life, durable. Great as backup phone.', 'price' => 25000, 'condition' => 'new'],
            ['title' => 'Leather Sofa Set 3+2+1', 'description' => 'Genuine leather sofa set in brown. 3-seater, 2-seater, and 1-seater. Excellent condition.', 'price' => 350000, 'condition' => 'used'],
            ['title' => 'Range Rover Sport 2020', 'description' => '2020 Range Rover Sport HSE. V6 engine, full option. Nigerian used, all papers valid.', 'price' => 52000000, 'condition' => 'used'],
            ['title' => 'Dell Gaming Laptop', 'description' => 'Dell G15 gaming laptop. Intel Core i7, RTX 3060, 16GB RAM, 1TB SSD. For serious gamers.', 'price' => 650000, 'condition' => 'new'],
            ['title' => 'King Size Bed with Mattress', 'description' => 'Luxury king size bed with orthopedic mattress. Memory foam, very comfortable. Moving sale.', 'price' => 220000, 'condition' => 'used'],
            ['title' => 'Kia Sorento 2023', 'description' => '2023 Kia Sorento, LX trim. Brand new, unregistered. Slightly negotiable.', 'price' => 28000000, 'condition' => 'new'],
        ];

        foreach ($sampleAds as $adData) {
            $category = $categories->random();
            $location = $locations->random();
            $user = $users->random();
            
            // Get a random LGA for this location
            $lgas = Location::where('parent_id', $location->id)->get();
            $lga = $lgas->isNotEmpty() ? $lgas->random()->name : null;

            Ad::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'location_id' => $location->id,
                'title' => $adData['title'],
                'slug' => Str::slug($adData['title'] . '-' . time()),
                'description' => $adData['description'],
                'price' => $adData['price'],
                'currency' => 'NGN',
                'condition' => $adData['condition'],
                'status' => 'active',
                'is_featured' => rand(0, 1),
                'is_verified' => rand(0, 1),
                'views' => rand(10, 500),
                'lga' => $lga,
                'expires_at' => now()->addDays(30),
            ]);
        }

        echo "Created " . count($sampleAds) . " sample ads.\n";
    }
}
