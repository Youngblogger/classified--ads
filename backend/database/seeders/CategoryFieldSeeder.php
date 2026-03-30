<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CategoryField;
use Illuminate\Database\Seeder;

class CategoryFieldSeeder extends Seeder
{
    public function run(): void
    {
        $categoryFields = $this->getFieldsByCategory();

        foreach ($categoryFields as $categorySlug => $fields) {
            $category = Category::where('slug', $categorySlug)->first();
            
            if (!$category) {
                echo "Category not found: $categorySlug\n";
                continue;
            }

            foreach ($fields as $index => $field) {
                CategoryField::updateOrCreate(
                    [
                        'category_id' => $category->id,
                        'name' => $field['name'],
                    ],
                    [
                        'label' => $field['label'],
                        'type' => $field['type'],
                        'options' => $field['options'] ?? null,
                        'is_required' => $field['is_required'] ?? false,
                        'sort_order' => $index,
                        'group_name' => $field['group_name'] ?? null,
                    ]
                );
            }

            echo "Created " . count($fields) . " fields for $categorySlug\n";
        }
    }

    private function getFieldsByCategory(): array
    {
        return [
            // Cars
            'cars' => [
                ['name' => 'make', 'label' => 'Make', 'type' => 'select', 'options' => ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'Audi', 'Lexus', 'Porsche', 'Land Rover', 'Jeep', 'Mitsubishi', 'Suzuki', 'Mazda', 'Peugeot', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'year', 'label' => 'Year', 'type' => 'number', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'mileage', 'label' => 'Mileage (km)', 'type' => 'number', 'group_name' => 'Basic Info'],
                ['name' => 'transmission', 'label' => 'Transmission', 'type' => 'select', 'options' => ['Automatic', 'Manual', 'Semi-Automatic'], 'group_name' => 'Specifications'],
                ['name' => 'fuel_type', 'label' => 'Fuel Type', 'type' => 'select', 'options' => ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'], 'group_name' => 'Specifications'],
                ['name' => 'engine_capacity', 'label' => 'Engine Capacity (L)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'drive_type', 'label' => 'Drive Type', 'type' => 'select', 'options' => ['FWD', 'RWD', 'AWD', '4WD'], 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'interior_color', 'label' => 'Interior Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'air_conditioning', 'label' => 'Air Conditioning', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'sunroof', 'label' => 'Sunroof', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'leather_seats', 'label' => 'Leather Seats', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'heated_seats', 'label' => 'Heated Seats', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'navigation', 'label' => 'Navigation System', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'reverse_camera', 'label' => 'Reverse Camera', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'parking_sensors', 'label' => 'Parking Sensors', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'bluetooth', 'label' => 'Bluetooth', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'abs', 'label' => 'ABS', 'type' => 'boolean', 'group_name' => 'Safety'],
                ['name' => 'airbags', 'label' => 'Airbags', 'type' => 'boolean', 'group_name' => 'Safety'],
            ],

            // Motorcycles
            'motorcycles' => [
                ['name' => 'make', 'label' => 'Make', 'type' => 'select', 'options' => ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'Harley-Davidson', 'KTM', 'TVS', 'Bajaj', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'year', 'label' => 'Year', 'type' => 'number', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'mileage', 'label' => 'Mileage (km)', 'type' => 'number', 'group_name' => 'Basic Info'],
                ['name' => 'engine_capacity', 'label' => 'Engine Capacity (cc)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'transmission', 'label' => 'Transmission', 'type' => 'select', 'options' => ['Manual', 'Semi-Auto', 'Automatic'], 'group_name' => 'Specifications'],
                ['name' => 'fuel_type', 'label' => 'Fuel Type', 'type' => 'select', 'options' => ['Petrol', 'Electric'], 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
            ],

            // Smartphones
            'smartphones' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OPPO', 'Vivo', 'OnePlus', 'Google', 'Realme', 'Motorola', 'Nokia', 'Tecno', 'Infinix', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'ram', 'label' => 'RAM', 'type' => 'select', 'options' => ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'screen_size', 'label' => 'Screen Size (inches)', 'type' => 'number', 'group_name' => 'Display'],
                ['name' => 'battery_capacity', 'label' => 'Battery Capacity (mAh)', 'type' => 'number', 'group_name' => 'Battery'],
                ['name' => 'processor', 'label' => 'Processor', 'type' => 'text', 'group_name' => 'Specifications'],
                ['name' => 'operating_system', 'label' => 'Operating System', 'type' => 'select', 'options' => ['iOS', 'Android', 'HarmonyOS', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Device Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'warranty', 'label' => 'Warranty Available', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'face_id', 'label' => 'Face ID / Face Unlock', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'fingerprint', 'label' => 'Fingerprint Sensor', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'nfc', 'label' => 'NFC', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => '5g', 'label' => '5G Capable', 'type' => 'boolean', 'group_name' => 'Features'],
            ],

            // Tablets
            'tablets' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Apple', 'Samsung', 'Huawei', 'Lenovo', 'Microsoft', 'Amazon', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'ram', 'label' => 'RAM', 'type' => 'select', 'options' => ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], 'group_name' => 'Specifications'],
                ['name' => 'screen_size', 'label' => 'Screen Size (inches)', 'type' => 'number', 'group_name' => 'Display'],
                ['name' => 'cellular', 'label' => 'Cellular / Wi-Fi Only', 'type' => 'select', 'options' => ['Wi-Fi Only', 'Cellular + Wi-Fi'], 'group_name' => 'Connectivity'],
                ['name' => 'condition', 'label' => 'Device Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // Laptops
            'laptops' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Microsoft', 'MSI', 'Razer', 'Samsung', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'processor', 'label' => 'Processor', 'type' => 'text', 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'ram', 'label' => 'RAM', 'type' => 'select', 'options' => ['4GB', '8GB', '16GB', '32GB', '64GB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', 'HDD + SSD'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'display_size', 'label' => 'Display Size (inches)', 'type' => 'number', 'group_name' => 'Display'],
                ['name' => 'graphics_card', 'label' => 'Graphics Card', 'type' => 'text', 'group_name' => 'Specifications'],
                ['name' => 'operating_system', 'label' => 'Operating System', 'type' => 'select', 'options' => ['Windows 10', 'Windows 11', 'macOS', 'Linux', 'No OS'], 'group_name' => 'Software'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'touchscreen', 'label' => 'Touchscreen', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'backlit_keyboard', 'label' => 'Backlit Keyboard', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'fingerprint', 'label' => 'Fingerprint Reader', 'type' => 'boolean', 'group_name' => 'Security'],
            ],

            // Apartments for Rent
            'apartments-rent' => [
                ['name' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'options' => ['Flat / Apartment', 'Bungalow', 'Duplex', 'Penthouse', 'Studio Apartment'], 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bedrooms', 'label' => 'Bedrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bathrooms', 'label' => 'Bathrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'toilets', 'label' => 'Toilets', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'square_meters', 'label' => 'Area (sqm)', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'furnishing', 'label' => 'Furnishing', 'type' => 'select', 'options' => ['Furnished', 'Semi-Furnished', 'Unfurnished'], 'group_name' => 'Features'],
                ['name' => 'serviced', 'label' => 'Serviced', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'shared_commons', 'label' => 'Shared Common Areas', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'parking', 'label' => 'Parking Space', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'security', 'label' => 'Security', 'type' => 'select', 'options' => ['24/7 Security', 'Security Guard', 'CCTV', 'Gated Community'], 'group_name' => 'Security'],
                ['name' => 'amenities', 'label' => 'Amenities', 'type' => 'multi_select', 'options' => ['Pool', 'Gym', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet'], 'group_name' => 'Amenities'],
            ],

            // Houses for Sale
            'houses-sale' => [
                ['name' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'options' => ['Bungalow', 'Duplex', 'Triplex', 'Maisonette', 'Detached House', 'Semi-Detached'], 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bedrooms', 'label' => 'Bedrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bathrooms', 'label' => 'Bathrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'toilets', 'label' => 'Toilets', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'parking_spaces', 'label' => 'Parking Spaces', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'land_size', 'label' => 'Land Size (sqm)', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'title_type', 'label' => 'Title Type', 'type' => 'select', 'options' => ['Freehold', 'Leasehold', 'Certificate of Occupancy', 'Deed of Assignment', 'Government Land'], 'group_name' => 'Legal'],
                ['name' => 'newly_built', 'label' => 'Newly Built', 'type' => 'boolean', 'group_name' => 'Property Details'],
            ],

            // Furniture
            'furniture' => [
                ['name' => 'furniture_type', 'label' => 'Furniture Type', 'type' => 'select', 'options' => ['Sofa', 'Dining Table', 'Bed', 'Chair', 'Wardrobe', 'Cabinet', 'Desk', 'Bookshelf', 'TV Stand', 'Ottoman', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Wood', 'Metal', 'Leather', 'Fabric', 'Glass', 'Plastic', 'Rattan', 'Marble', 'Mixed'], 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // TVs
            'tvs' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Samsung', 'LG', 'Sony', 'TCL', 'Hisense', 'Panasonic', 'Philips', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'screen_size', 'label' => 'Screen Size (inches)', 'type' => 'number', 'is_required' => true, 'group_name' => 'Display'],
                ['name' => 'display_type', 'label' => 'Display Type', 'type' => 'select', 'options' => ['LED', 'OLED', 'QLED', 'UHD', '4K', '8K'], 'group_name' => 'Display'],
                ['name' => 'smart_tv', 'label' => 'Smart TV', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'resolution', 'label' => 'Resolution', 'type' => 'select', 'options' => ['HD', 'Full HD', '4K UHD', '8K'], 'group_name' => 'Display'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],
        ];
    }
}
