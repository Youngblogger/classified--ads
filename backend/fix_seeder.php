<?php

/**
 * Fix seeder to use more reliable image URLs from picsum.photos
 * This script updates the DatabaseSeeder to use picsum.photos instead of Unsplash
 */

$seederPath = __DIR__ . '/database/seeders/DatabaseSeeder.php';

if (!file_exists($seederPath)) {
    echo "Error: DatabaseSeeder.php not found at $seederPath\n";
    exit(1);
}

$content = file_get_contents($seederPath);

// Replace Unsplash URLs with picsum.photos URLs
// We'll use a more reliable approach with picsum.photos which is more stable

$replacements = [
    // Smartphones
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80' => 'https://picsum.photos/seed/phone1/800/600',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80' => 'https://picsum.photos/seed/phone2/800/600',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80' => 'https://picsum.photos/seed/phone3/800/600',

    // Cars
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80' => 'https://picsum.photos/seed/car1/800/600',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80' => 'https://picsum.photos/seed/car2/800/600',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80' => 'https://picsum.photos/seed/car3/800/600',

    // Laptops
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' => 'https://picsum.photos/seed/laptop1/800/600',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80' => 'https://picsum.photos/seed/laptop2/800/600',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80' => 'https://picsum.photos/seed/laptop3/800/600',

    // Televisions
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80' => 'https://picsum.photos/seed/tv1/800/600',
    'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5c2?w=800&q=80' => 'https://picsum.photos/seed/tv2/800/600',

    // Gaming Consoles
    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80' => 'https://picsum.photos/seed/gaming1/800/600',
    'https://images.unsplash.com/photo-1593642632823-8f785ba0a621?w=800&q=80' => 'https://picsum.photos/seed/gaming2/800/600',
    'https://images.unsplash.com/photo-1586182987320-4f376d39d787?w=800&q=80' => 'https://picsum.photos/seed/gaming3/800/600',

    // Furniture
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80' => 'https://picsum.photos/seed/furniture1/800/600',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80' => 'https://picsum.photos/seed/furniture2/800/600',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80' => 'https://picsum.photos/seed/furniture3/800/600',

    // Large Appliances
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80' => 'https://picsum.photos/seed/appliance1/800/600',
    'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&q=80' => 'https://picsum.photos/seed/appliance2/800/600',

    // Shoes
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' => 'https://picsum.photos/seed/shoes1/800/600',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' => 'https://picsum.photos/seed/shoes2/800/600',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80' => 'https://picsum.photos/seed/shoes3/800/600',

    // Houses for Sale
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' => 'https://picsum.photos/seed/house1/800/600',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' => 'https://picsum.photos/seed/house2/800/600',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' => 'https://picsum.photos/seed/house3/800/600',

    // Cameras & Photography
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' => 'https://picsum.photos/seed/camera1/800/600',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80' => 'https://picsum.photos/seed/camera2/800/600',

    // Audio & Music Equipment
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' => 'https://picsum.photos/seed/audio1/800/600',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80' => 'https://picsum.photos/seed/audio2/800/600',

    // Bags
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80' => 'https://picsum.photos/seed/bag1/800/600',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' => 'https://picsum.photos/seed/bag2/800/600',

    // Bicycles
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80' => 'https://picsum.photos/seed/bike1/800/600',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80' => 'https://picsum.photos/seed/bike2/800/600',

    // Gym Equipment
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' => 'https://picsum.photos/seed/gym1/800/600',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' => 'https://picsum.photos/seed/gym2/800/600',

    // Tablets
    'https://images.unsplash.com/photo-1562583377-1f2eb9015eb6?w=800&q=80' => 'https://picsum.photos/seed/tablet1/800/600',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80' => 'https://picsum.photos/seed/tablet2/800/600',

    // Beauty Tools
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80' => 'https://picsum.photos/seed/beauty1/800/600',
    'https://images.unsplash.com/photo-1522338242042-2d1c40e10d11?w=800&q=80' => 'https://picsum.photos/seed/beauty2/800/600',

    // Watches
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80' => 'https://picsum.photos/seed/watch1/800/600',
    'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&q=80' => 'https://picsum.photos/seed/watch2/800/600',

    // Jewelry
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80' => 'https://picsum.photos/seed/jewelry1/800/600',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80' => 'https://picsum.photos/seed/jewelry2/800/600',

    // Fabrics
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80' => 'https://picsum.photos/seed/fabric1/800/600',
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80' => 'https://picsum.photos/seed/fabric2/800/600',

    // Fragrances
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80' => 'https://picsum.photos/seed/fragrance1/800/600',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80' => 'https://picsum.photos/seed/fragrance2/800/600',

    // Skincare
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80' => 'https://picsum.photos/seed/skincare1/800/600',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800&q=80' => 'https://picsum.photos/seed/skincare2/800/600',

    // Haircare
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80' => 'https://picsum.photos/seed/hair1/800/600',
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80' => 'https://picsum.photos/seed/hair2/800/600',

    // Fitness Accessories
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' => 'https://picsum.photos/seed/fitness1/800/600',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80' => 'https://picsum.photos/seed/fitness2/800/600',

    // Outdoor Gear
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80' => 'https://picsum.photos/seed/outdoor1/800/600',
    'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&q=80' => 'https://picsum.photos/seed/outdoor2/800/600',

    // Apartments for Sale
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' => 'https://picsum.photos/seed/apt1/800/600',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80' => 'https://picsum.photos/seed/apt2/800/600',

    // Apartments for Rent
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' => 'https://picsum.photos/seed/apt3/800/600',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80' => 'https://picsum.photos/seed/apt4/800/600',

    // Houses for Rent
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' => 'https://picsum.photos/seed/house4/800/600',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' => 'https://picsum.photos/seed/house5/800/600',

    // Land & Plots
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80' => 'https://picsum.photos/seed/land1/800/600',
    'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80' => 'https://picsum.photos/seed/land2/800/600',

    // Commercial Property
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' => 'https://picsum.photos/seed/commercial1/800/600',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80' => 'https://picsum.photos/seed/commercial2/800/600',

    // Gaming Laptops
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80' => 'https://picsum.photos/seed/gaminglaptop1/800/600',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' => 'https://picsum.photos/seed/gaminglaptop2/800/600',

    // Small Appliances
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' => 'https://picsum.photos/seed/smallappliance1/800/600',
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80' => 'https://picsum.photos/seed/smallappliance2/800/600',

    // Women's Clothing
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80' => 'https://picsum.photos/seed/women1/800/600',
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80' => 'https://picsum.photos/seed/women2/800/600',

    // Desktop Computers
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80' => 'https://picsum.photos/seed/desktop1/800/600',
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80' => 'https://picsum.photos/seed/desktop2/800/600',
];

// Apply replacements
$newContent = str_replace(array_keys($replacements), array_values($replacements), $content);

// Also update the default images array
$defaultImagesOld = <<<'EOT'
        $defaultImages = [
            'https://picsum.photos/seed/product1/800/600',
            'https://picsum.photos/seed/product2/800/600',
            'https://picsum.photos/seed/product3/800/600',
            'https://picsum.photos/seed/product4/800/600',
            'https://picsum.photos/seed/product5/800/600',
        ];
EOT;

$defaultImagesNew = <<<'EOT'
        $defaultImages = [
            'https://picsum.photos/seed/default1/800/600',
            'https://picsum.photos/seed/default2/800/600',
            'https://picsum.photos/seed/default3/800/600',
            'https://picsum.photos/seed/default4/800/600',
            'https://picsum.photos/seed/default5/800/600',
        ];
EOT;

$newContent = str_replace($defaultImagesOld, $defaultImagesNew, $newContent);

// Write the updated content back
if (file_put_contents($seederPath, $newContent) !== false) {
    echo "Successfully updated DatabaseSeeder.php to use picsum.photos URLs\n";
    echo "You can now run: php artisan db:seed --class=DatabaseSeeder\n";
} else {
    echo "Error: Failed to write to $seederPath\n";
    exit(1);
}
