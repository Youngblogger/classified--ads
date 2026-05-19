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
            // ============================================================
            // VEHICLES - Cars
            // ============================================================
            'cars' => [
                ['name' => 'make', 'label' => 'Make', 'type' => 'select', 'options' => ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'Audi', 'Lexus', 'Porsche', 'Land Rover', 'Jeep', 'Mitsubishi', 'Suzuki', 'Mazda', 'Peugeot', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'year', 'label' => 'Year', 'type' => 'number', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'mileage', 'label' => 'Mileage (km)', 'type' => 'number', 'group_name' => 'Basic Info'],
                ['name' => 'transmission', 'label' => 'Transmission', 'type' => 'select', 'options' => ['Automatic', 'Manual', 'Semi-Automatic'], 'group_name' => 'Specifications'],
                ['name' => 'fuel_type', 'label' => 'Fuel Type', 'type' => 'select', 'options' => ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'], 'group_name' => 'Specifications'],
                ['name' => 'engine_capacity', 'label' => 'Engine Capacity (L)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'drive_type', 'label' => 'Drive Type', 'type' => 'select', 'options' => ['FWD', 'RWD', 'AWD', '4WD'], 'group_name' => 'Specifications'],
                ['name' => 'body_type', 'label' => 'Body Type', 'type' => 'select', 'options' => ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Wagon'], 'group_name' => 'Basic Info'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'interior_color', 'label' => 'Interior Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Foreign Used', 'Nigeria Used', 'Tokunbo', 'Fairly Used'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'registration', 'label' => 'Registration', 'type' => 'select', 'options' => ['Registered', 'Unregistered', 'Custom Plate'], 'group_name' => 'Legal'],
                ['name' => 'vin', 'label' => 'VIN / Chassis Number', 'type' => 'text', 'group_name' => 'Legal'],
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

            // SUVs - reuse car specs
            'suvs' => [
                ['name' => 'make', 'label' => 'Make', 'type' => 'select', 'options' => ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'Audi', 'Lexus', 'Land Rover', 'Jeep', 'Mitsubishi', 'Suzuki', 'Mazda', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'year', 'label' => 'Year', 'type' => 'number', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'mileage', 'label' => 'Mileage (km)', 'type' => 'number', 'group_name' => 'Basic Info'],
                ['name' => 'transmission', 'label' => 'Transmission', 'type' => 'select', 'options' => ['Automatic', 'Manual'], 'group_name' => 'Specifications'],
                ['name' => 'fuel_type', 'label' => 'Fuel Type', 'type' => 'select', 'options' => ['Petrol', 'Diesel', 'Hybrid', 'Electric'], 'group_name' => 'Specifications'],
                ['name' => 'engine_capacity', 'label' => 'Engine Capacity (L)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'drive_type', 'label' => 'Drive Type', 'type' => 'select', 'options' => ['FWD', 'RWD', 'AWD', '4WD'], 'group_name' => 'Specifications'],
                ['name' => 'seating_capacity', 'label' => 'Seating Capacity', 'type' => 'select', 'options' => ['4', '5', '6', '7', '8', '9+'], 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Foreign Used', 'Nigeria Used', 'Tokunbo'], 'is_required' => true, 'group_name' => 'Basic Info'],
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
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Foreign Used', 'Nigeria Used', 'Fairly Used'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // Vehicle Parts
            'vehicle-parts' => [
                ['name' => 'part_type', 'label' => 'Part Type', 'type' => 'select', 'options' => ['Engine', 'Transmission', 'Brakes', 'Suspension', 'Electrical', 'Body Parts', 'Exhaust', 'Cooling System', 'Fuel System', 'Interior Parts', 'Other'], 'is_required' => true, 'group_name' => 'Part Info'],
                ['name' => 'compatible_make', 'label' => 'Compatible Make', 'type' => 'text', 'is_required' => true, 'group_name' => 'Part Info'],
                ['name' => 'compatible_model', 'label' => 'Compatible Model', 'type' => 'text', 'group_name' => 'Part Info'],
                ['name' => 'year_from', 'label' => 'Year From', 'type' => 'number', 'group_name' => 'Part Info'],
                ['name' => 'year_to', 'label' => 'Year To', 'type' => 'number', 'group_name' => 'Part Info'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Used - OEM', 'Used - Aftermarket', 'Reconditioned', 'Salvage'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'genuine', 'label' => 'Genuine OEM', 'type' => 'boolean', 'group_name' => 'Basic Info'],
            ],

            // Vehicle Accessories
            'vehicle-accessories' => [
                ['name' => 'accessory_type', 'label' => 'Accessory Type', 'type' => 'select', 'options' => ['Audio System', 'Car Mats', 'Seat Covers', 'Steering Wheel', 'Lighting', 'Roof Rack', 'Floor Mats', 'Organizer', 'Dash Cam', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'compatible_vehicle', 'label' => 'Compatible Vehicle', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Leather', 'Fabric', 'Plastic', 'Metal', 'Rubber', 'Carbon Fiber', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Used'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // Tires & Rims
            'tires-rims' => [
                ['name' => 'product_type', 'label' => 'Product Type', 'type' => 'select', 'options' => ['Tires', 'Rims', 'Wheel Sets', 'Tire Accessories'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'tire_size', 'label' => 'Tire Size (e.g., 225/45R17)', 'type' => 'text', 'group_name' => 'Specifications'],
                ['name' => 'rim_size', 'label' => 'Rim Size (inches)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Used', 'Refurbished'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'quantity', 'label' => 'Quantity', 'type' => 'number', 'group_name' => 'Basic Info'],
            ],

            // Heavy Equipment
            'heavy-equipment' => [
                ['name' => 'equipment_type', 'label' => 'Equipment Type', 'type' => 'select', 'options' => ['Excavator', 'Bulldozer', 'Crane', 'Loader', 'Grader', 'Roller', 'Dump Truck', 'Forklift', 'Tractor', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'year', 'label' => 'Year', 'type' => 'number', 'group_name' => 'Basic Info'],
                ['name' => 'operating_hours', 'label' => 'Operating Hours', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Used', 'Refurbished', 'For Parts'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // ============================================================
            // MOBILE PHONES & TABLETS
            // ============================================================
            'smartphones' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OPPO', 'Vivo', 'OnePlus', 'Google', 'Realme', 'Motorola', 'Nokia', 'Tecno', 'Infinix', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'ram', 'label' => 'RAM', 'type' => 'select', 'options' => ['1GB', '2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'screen_size', 'label' => 'Screen Size (inches)', 'type' => 'number', 'group_name' => 'Display'],
                ['name' => 'battery_capacity', 'label' => 'Battery Capacity (mAh)', 'type' => 'number', 'group_name' => 'Battery'],
                ['name' => 'processor', 'label' => 'Processor', 'type' => 'text', 'group_name' => 'Specifications'],
                ['name' => 'operating_system', 'label' => 'Operating System', 'type' => 'select', 'options' => ['iOS', 'Android', 'HarmonyOS', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'camera_megapixels', 'label' => 'Camera (MP)', 'type' => 'text', 'group_name' => 'Camera'],
                ['name' => 'connectivity', 'label' => 'Connectivity', 'type' => 'multi_select', 'options' => ['4G', '5G', 'WiFi', 'Bluetooth', 'NFC', 'GPS'], 'group_name' => 'Connectivity'],
                ['name' => 'sim_type', 'label' => 'SIM Type', 'type' => 'select', 'options' => ['Single SIM', 'Dual SIM', 'eSIM', 'Dual + eSIM'], 'group_name' => 'Connectivity'],
                ['name' => 'condition', 'label' => 'Device Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'warranty', 'label' => 'Warranty Available', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'face_id', 'label' => 'Face ID / Unlock', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'fingerprint', 'label' => 'Fingerprint Sensor', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'nfc', 'label' => 'NFC', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => '5g', 'label' => '5G Capable', 'type' => 'boolean', 'group_name' => 'Connectivity'],
            ],

            'android-phones' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'OnePlus', 'Google', 'Realme', 'Motorola', 'Nokia', 'Tecno', 'Infinix', 'Huawei', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'ram', 'label' => 'RAM', 'type' => 'select', 'options' => ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'battery_capacity', 'label' => 'Battery Capacity (mAh)', 'type' => 'number', 'group_name' => 'Battery'],
                ['name' => 'screen_size', 'label' => 'Screen Size (inches)', 'type' => 'number', 'group_name' => 'Display'],
                ['name' => 'android_version', 'label' => 'Android Version', 'type' => 'select', 'options' => ['Android 12', 'Android 13', 'Android 14', 'Android 15', 'Older'], 'group_name' => 'Specifications'],
                ['name' => 'sim_type', 'label' => 'SIM Type', 'type' => 'select', 'options' => ['Single SIM', 'Dual SIM'], 'group_name' => 'Connectivity'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'iphones' => [
                ['name' => 'model', 'label' => 'Model', 'type' => 'select', 'options' => ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 16 Plus', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 15 Plus', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 14 Plus', 'iPhone SE', 'Older Model'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['64GB', '128GB', '256GB', '512GB', '1TB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'battery_health', 'label' => 'Battery Health (%)', 'type' => 'number', 'group_name' => 'Battery'],
                ['name' => 'icloud_locked', 'label' => 'iCloud Locked', 'type' => 'boolean', 'group_name' => 'Basic Info'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'face_id', 'label' => 'Face ID Working', 'type' => 'boolean', 'group_name' => 'Features'],
            ],

            'tablets' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Apple', 'Samsung', 'Huawei', 'Lenovo', 'Microsoft', 'Amazon', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'ram', 'label' => 'RAM', 'type' => 'select', 'options' => ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], 'group_name' => 'Specifications'],
                ['name' => 'screen_size', 'label' => 'Screen Size (inches)', 'type' => 'number', 'group_name' => 'Display'],
                ['name' => 'cellular', 'label' => 'Cellular / Wi-Fi Only', 'type' => 'select', 'options' => ['Wi-Fi Only', 'Cellular + Wi-Fi'], 'group_name' => 'Connectivity'],
                ['name' => 'condition', 'label' => 'Device Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'smartwatches' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Huawei', 'Xiaomi', 'Amazfit', 'Google', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'compatible_os', 'label' => 'Compatible OS', 'type' => 'select', 'options' => ['iOS', 'Android', 'Both'], 'group_name' => 'Compatibility'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // ============================================================
            // ELECTRONICS
            // ============================================================
            'tvs' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Samsung', 'LG', 'Sony', 'TCL', 'Hisense', 'Panasonic', 'Philips', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'screen_size', 'label' => 'Screen Size (inches)', 'type' => 'number', 'is_required' => true, 'group_name' => 'Display'],
                ['name' => 'display_type', 'label' => 'Display Type', 'type' => 'select', 'options' => ['LED', 'OLED', 'QLED', 'UHD', '4K', '8K'], 'group_name' => 'Display'],
                ['name' => 'smart_tv', 'label' => 'Smart TV', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'resolution', 'label' => 'Resolution', 'type' => 'select', 'options' => ['HD Ready', 'Full HD', '4K UHD', '8K'], 'group_name' => 'Display'],
                ['name' => 'refresh_rate', 'label' => 'Refresh Rate (Hz)', 'type' => 'select', 'options' => ['50Hz', '60Hz', '100Hz', '120Hz', '240Hz'], 'group_name' => 'Display'],
                ['name' => 'hdmi_ports', 'label' => 'HDMI Ports', 'type' => 'number', 'group_name' => 'Connectivity'],
                ['name' => 'usb_ports', 'label' => 'USB Ports', 'type' => 'number', 'group_name' => 'Connectivity'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'laptops' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Microsoft', 'MSI', 'Razer', 'Samsung', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'processor', 'label' => 'Processor', 'type' => 'text', 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'ram', 'label' => 'RAM', 'type' => 'select', 'options' => ['4GB', '8GB', '16GB', '32GB', '64GB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', 'HDD + SSD'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'display_size', 'label' => 'Display Size (inches)', 'type' => 'number', 'group_name' => 'Display'],
                ['name' => 'graphics_card', 'label' => 'Graphics Card', 'type' => 'text', 'group_name' => 'Specifications'],
                ['name' => 'operating_system', 'label' => 'Operating System', 'type' => 'select', 'options' => ['Windows 10', 'Windows 11', 'macOS', 'Linux', 'No OS'], 'group_name' => 'Software'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'touchscreen', 'label' => 'Touchscreen', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'backlit_keyboard', 'label' => 'Backlit Keyboard', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'fingerprint', 'label' => 'Fingerprint Reader', 'type' => 'boolean', 'group_name' => 'Security'],
            ],

            'desktops' => [
                ['name' => 'form_factor', 'label' => 'Form Factor', 'type' => 'select', 'options' => ['Tower', 'All-in-One', 'Mini PC', 'Workstation', 'Gaming PC'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'processor', 'label' => 'Processor', 'type' => 'text', 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'ram', 'label' => 'RAM', 'type' => 'select', 'options' => ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['256GB SSD', '512GB SSD', '1TB HDD', '1TB SSD', '2TB SSD', 'HDD + SSD'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'graphics_card', 'label' => 'Graphics Card', 'type' => 'text', 'group_name' => 'Specifications'],
                ['name' => 'operating_system', 'label' => 'Operating System', 'type' => 'select', 'options' => ['Windows 10', 'Windows 11', 'Linux', 'macOS', 'No OS'], 'group_name' => 'Software'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Used', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'gaming-consoles' => [
                ['name' => 'console_type', 'label' => 'Console Type', 'type' => 'select', 'options' => ['PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'Xbox Series S', 'Xbox One', 'Nintendo Switch', 'Nintendo Switch OLED', 'Handheld Console', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'storage', 'label' => 'Storage', 'type' => 'select', 'options' => ['128GB', '256GB', '500GB', '512GB', '1TB', '2TB'], 'group_name' => 'Specifications'],
                ['name' => 'controllers_included', 'label' => 'Controllers Included', 'type' => 'number', 'group_name' => 'Accessories'],
                ['name' => 'games_included', 'label' => 'Games Included', 'type' => 'boolean', 'group_name' => 'Accessories'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'cameras' => [
                ['name' => 'camera_type', 'label' => 'Camera Type', 'type' => 'select', 'options' => ['DSLR', 'Mirrorless', 'Point & Shoot', 'Action Camera', 'Film Camera', 'Instant Camera', '360 Camera', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'GoPro', 'Leica', 'Olympus', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'megapixels', 'label' => 'Megapixels', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'lens_mount', 'label' => 'Lens Mount', 'type' => 'text', 'group_name' => 'Lens'],
                ['name' => 'video_resolution', 'label' => 'Video Resolution', 'type' => 'select', 'options' => ['1080p', '4K', '6K', '8K'], 'group_name' => 'Video'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'home-audio' => [
                ['name' => 'audio_type', 'label' => 'Audio Type', 'type' => 'select', 'options' => ['Soundbar', 'Home Theater System', 'Bookshelf Speakers', 'Floorstanding Speakers', 'Subwoofer', 'AV Receiver', 'Amplifier', 'Turntable', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'power_output', 'label' => 'Power Output (Watts)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'connectivity', 'label' => 'Connectivity', 'type' => 'multi_select', 'options' => ['Bluetooth', 'WiFi', 'HDMI', 'Optical', 'RCA', 'AUX', 'USB'], 'group_name' => 'Connectivity'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'monitors' => [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'select', 'options' => ['Dell', 'Samsung', 'LG', 'ASUS', 'Acer', 'HP', 'Lenovo', 'BenQ', 'MSI', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'screen_size', 'label' => 'Screen Size (inches)', 'type' => 'number', 'is_required' => true, 'group_name' => 'Display'],
                ['name' => 'resolution', 'label' => 'Resolution', 'type' => 'select', 'options' => ['1920x1080 (Full HD)', '2560x1440 (QHD)', '3840x2160 (4K)', '5120x2880 (5K)', 'Other'], 'is_required' => true, 'group_name' => 'Display'],
                ['name' => 'refresh_rate', 'label' => 'Refresh Rate (Hz)', 'type' => 'select', 'options' => ['60Hz', '75Hz', '120Hz', '144Hz', '165Hz', '240Hz'], 'group_name' => 'Display'],
                ['name' => 'panel_type', 'label' => 'Panel Type', 'type' => 'select', 'options' => ['IPS', 'TN', 'VA', 'OLED'], 'group_name' => 'Display'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'printers' => [
                ['name' => 'printer_type', 'label' => 'Printer Type', 'type' => 'select', 'options' => ['Inkjet', 'Laser', 'All-in-One', 'Photo Printer', 'Label Printer', '3D Printer', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'connectivity', 'label' => 'Connectivity', 'type' => 'multi_select', 'options' => ['USB', 'WiFi', 'Bluetooth', 'Ethernet'], 'group_name' => 'Connectivity'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Used', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // ============================================================
            // PROPERTY
            // ============================================================
            'apartments-rent' => [
                ['name' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'options' => ['Flat / Apartment', 'Bungalow', 'Duplex', 'Penthouse', 'Studio Apartment', 'Self-Contained', 'Mini-flat'], 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bedrooms', 'label' => 'Bedrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bathrooms', 'label' => 'Bathrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'toilets', 'label' => 'Toilets', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'square_meters', 'label' => 'Area (sqm)', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'furnishing', 'label' => 'Furnishing', 'type' => 'select', 'options' => ['Furnished', 'Semi-Furnished', 'Unfurnished'], 'group_name' => 'Features'],
                ['name' => 'serviced', 'label' => 'Serviced Apartment', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'parking', 'label' => 'Parking Space', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'security', 'label' => 'Security', 'type' => 'select', 'options' => ['24/7 Security', 'Security Guard', 'CCTV', 'Gated Community', 'None'], 'group_name' => 'Security'],
                ['name' => 'amenities', 'label' => 'Amenities', 'type' => 'multi_select', 'options' => ['Pool', 'Gym', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet', 'Cable TV'], 'group_name' => 'Amenities'],
                ['name' => 'rent_duration', 'label' => 'Rent Duration', 'type' => 'select', 'options' => ['Monthly', 'Quarterly', 'Yearly', 'Negotiable'], 'group_name' => 'Pricing'],
            ],

            'apartments-sale' => [
                ['name' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'options' => ['Flat / Apartment', 'Penthouse', 'Studio Apartment', 'Mini-flat', 'Bungalow', 'Duplex'], 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bedrooms', 'label' => 'Bedrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bathrooms', 'label' => 'Bathrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'toilets', 'label' => 'Toilets', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'square_meters', 'label' => 'Area (sqm)', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'furnishing', 'label' => 'Furnishing', 'type' => 'select', 'options' => ['Furnished', 'Semi-Furnished', 'Unfurnished'], 'group_name' => 'Features'],
                ['name' => 'parking', 'label' => 'Parking Space', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'title_type', 'label' => 'Title / Ownership Document', 'type' => 'select', 'options' => ['Freehold', 'Leasehold', 'Certificate of Occupancy', 'Deed of Assignment', 'Governor\'s Consent'], 'group_name' => 'Legal'],
                ['name' => 'amenities', 'label' => 'Amenities', 'type' => 'multi_select', 'options' => ['Pool', 'Gym', 'Generator', 'Water Tank', 'Air Conditioning', '24/7 Security', 'CCTV', 'Internet'], 'group_name' => 'Amenities'],
            ],

            'houses-rent' => [
                ['name' => 'house_type', 'label' => 'House Type', 'type' => 'select', 'options' => ['Bungalow', 'Duplex', 'Terrace', 'Detached', 'Semi-Detached', 'Townhouse', 'Villa'], 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bedrooms', 'label' => 'Bedrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bathrooms', 'label' => 'Bathrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'toilets', 'label' => 'Toilets', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'furnishing', 'label' => 'Furnishing', 'type' => 'select', 'options' => ['Furnished', 'Semi-Furnished', 'Unfurnished'], 'group_name' => 'Features'],
                ['name' => 'parking', 'label' => 'Parking Spaces', 'type' => 'number', 'group_name' => 'Features'],
                ['name' => 'serviced', 'label' => 'Serviced', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'land_size', 'label' => 'Land Size (sqm)', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'rent_duration', 'label' => 'Rent Duration', 'type' => 'select', 'options' => ['Monthly', 'Quarterly', 'Yearly', 'Negotiable'], 'group_name' => 'Pricing'],
                ['name' => 'amenities', 'label' => 'Amenities', 'type' => 'multi_select', 'options' => ['Pool', 'Gym', 'Generator', 'Water Tank', 'Air Conditioning', 'CCTV', 'Garden', 'Boys Quarter'], 'group_name' => 'Amenities'],
            ],

            'houses-sale' => [
                ['name' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'options' => ['Bungalow', 'Duplex', 'Triplex', 'Maisonette', 'Detached House', 'Semi-Detached', 'Townhouse', 'Villa', 'Mansion'], 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bedrooms', 'label' => 'Bedrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'bathrooms', 'label' => 'Bathrooms', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'toilets', 'label' => 'Toilets', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'parking_spaces', 'label' => 'Parking Spaces', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'land_size', 'label' => 'Land Size (sqm)', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'furnishing', 'label' => 'Furnishing', 'type' => 'select', 'options' => ['Furnished', 'Semi-Furnished', 'Unfurnished'], 'group_name' => 'Features'],
                ['name' => 'title_type', 'label' => 'Title Type', 'type' => 'select', 'options' => ['Freehold', 'Leasehold', 'Certificate of Occupancy', 'Deed of Assignment', 'Governor\'s Consent', 'Global C of O'], 'group_name' => 'Legal'],
                ['name' => 'newly_built', 'label' => 'Newly Built', 'type' => 'boolean', 'group_name' => 'Property Details'],
                ['name' => 'amenities', 'label' => 'Amenities', 'type' => 'multi_select', 'options' => ['Pool', 'Gym', 'Generator', 'Water Tank', 'Air Conditioning', 'CCTV', 'Garden', 'Boys Quarter', 'Guest House'], 'group_name' => 'Amenities'],
            ],

            'land-plots' => [
                ['name' => 'land_type', 'label' => 'Land Type', 'type' => 'select', 'options' => ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Mixed Use'], 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'plot_size', 'label' => 'Plot Size (sqm)', 'type' => 'number', 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'land_title', 'label' => 'Land Title', 'type' => 'select', 'options' => ['Certificate of Occupancy', 'Deed of Assignment', 'Survey Plan', 'Bundle of Rights', 'Governor\'s Consent'], 'group_name' => 'Legal'],
                ['name' => 'fenced', 'label' => 'Fenced', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'road_access', 'label' => 'Road Access', 'type' => 'select', 'options' => ['Main Road', 'Tarred Road', 'Untarred Road'], 'group_name' => 'Features'],
                ['name' => 'utilities', 'label' => 'Utilities Available', 'type' => 'multi_select', 'options' => ['Electricity', 'Water', 'Drainage'], 'group_name' => 'Features'],
            ],

            'commercial-property' => [
                ['name' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'options' => ['Office', 'Shop', 'Warehouse', 'Factory', 'Hotel', 'Event Center', 'Filling Station', 'School', 'Hospital/Clinic'], 'is_required' => true, 'group_name' => 'Property Details'],
                ['name' => 'transaction', 'label' => 'Transaction Type', 'type' => 'select', 'options' => ['For Sale', 'For Rent', 'Lease'], 'is_required' => true, 'group_name' => 'Transaction'],
                ['name' => 'square_meters', 'label' => 'Area (sqm)', 'type' => 'number', 'group_name' => 'Property Details'],
                ['name' => 'parking', 'label' => 'Parking', 'type' => 'boolean', 'group_name' => 'Features'],
                ['name' => 'power_supply', 'label' => 'Power Supply', 'type' => 'select', 'options' => ['PHCN', 'Generator', 'Solar', 'PHCN + Generator'], 'group_name' => 'Utilities'],
                ['name' => 'title_type', 'label' => 'Title Type', 'type' => 'select', 'options' => ['Freehold', 'Leasehold', 'Certificate of Occupancy', 'Deed of Assignment'], 'group_name' => 'Legal'],
            ],

            // ============================================================
            // FASHION
            // ============================================================
            'men-clothing' => [
                ['name' => 'clothing_type', 'label' => 'Clothing Type', 'type' => 'select', 'options' => ['Shirts', 'T-Shirts', 'Pants / Trousers', 'Jeans', 'Suits', 'Blazers', 'Jackets', 'Shorts', 'Agbada', 'Kaftan', 'Native Wear', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'size', 'label' => 'Size', 'type' => 'select', 'options' => ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Other'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Cotton', 'Polyester', 'Wool', 'Linen', 'Silk', 'Denim', 'Leather', 'Cashmere', 'Nylon', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New with Tags', 'Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'women-clothing' => [
                ['name' => 'clothing_type', 'label' => 'Clothing Type', 'type' => 'select', 'options' => ['Dresses', 'Tops', 'Blouses', 'T-Shirts', 'Pants / Trousers', 'Jeans', 'Skirts', 'Shorts', 'Jackets', 'Blazers', 'Jumpsuits', 'Gowns', 'Native Wear', 'Abaya', 'Hijab', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'size', 'label' => 'Size', 'type' => 'select', 'options' => ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Plus Size', 'Other'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Cotton', 'Polyester', 'Wool', 'Linen', 'Silk', 'Denim', 'Lace', 'Chiffon', 'Satin', 'Velvet', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New with Tags', 'Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'shoes' => [
                ['name' => 'shoe_type', 'label' => 'Shoe Type', 'type' => 'select', 'options' => ['Sneakers', 'Formal Shoes', 'Sandals', 'Slippers', 'Boots', 'Loafers', 'Heels', 'Flats', 'Sport Shoes', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'size', 'label' => 'Size', 'type' => 'number', 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'gender', 'label' => 'Gender', 'type' => 'select', 'options' => ['Men', 'Women', 'Unisex'], 'group_name' => 'Basic Info'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Leather', 'Suede', 'Canvas', 'Synthetic', 'Rubber', 'Mesh', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'bags' => [
                ['name' => 'bag_type', 'label' => 'Bag Type', 'type' => 'select', 'options' => ['Handbag', 'Tote Bag', 'Backpack', 'Shoulder Bag', 'Crossbody Bag', 'Clutch', 'Wallet', 'Duffel Bag', 'Travel Bag', 'Laptop Bag', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Leather', 'Synthetic Leather', 'Canvas', 'Nylon', 'Fabric', 'Straw/Raffia', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'size', 'label' => 'Size', 'type' => 'select', 'options' => ['Small', 'Medium', 'Large', 'Extra Large'], 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'watches' => [
                ['name' => 'watch_type', 'label' => 'Watch Type', 'type' => 'select', 'options' => ['Analog', 'Digital', 'Smartwatch', 'Automatic', 'Chronograph', 'Diver Watch', 'Dress Watch', 'Sports Watch', 'Luxury Watch', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'case_material', 'label' => 'Case Material', 'type' => 'select', 'options' => ['Stainless Steel', 'Gold', 'Rose Gold', 'Titanium', 'Ceramic', 'Plastic', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'band_material', 'label' => 'Band Material', 'type' => 'select', 'options' => ['Stainless Steel', 'Leather', 'Rubber', 'Fabric', 'Gold', 'Ceramic', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'jewelry' => [
                ['name' => 'jewelry_type', 'label' => 'Jewelry Type', 'type' => 'select', 'options' => ['Necklace', 'Ring', 'Earrings', 'Bracelet', 'Anklet', 'Chain', 'Pendant', 'Brooch', 'Cufflinks', 'Body Jewelry', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Stainless Steel', 'Brass', 'Copper', 'Beaded', 'Wood', 'Other'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'gemstone', 'label' => 'Gemstone', 'type' => 'text', 'group_name' => 'Specifications'],
                ['name' => 'weight', 'label' => 'Weight (grams)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // ============================================================
            // HEALTH & BEAUTY
            // ============================================================
            'skincare' => [
                ['name' => 'product_type', 'label' => 'Product Type', 'type' => 'select', 'options' => ['Moisturizer', 'Cleanser', 'Toner', 'Serum', 'Face Oil', 'Face Mask', 'Exfoliator', 'Sunscreen', 'Eye Cream', 'Treatment', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'skin_type', 'label' => 'Skin Type', 'type' => 'select', 'options' => ['All Skin Types', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'], 'group_name' => 'Specifications'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'size_ml', 'label' => 'Size (ml)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Sealed', 'Opened', 'Used'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'makeup' => [
                ['name' => 'product_type', 'label' => 'Product Type', 'type' => 'select', 'options' => ['Foundation', 'Concealer', 'Powder', 'Blush', 'Bronzer', 'Highlighter', 'Eyeshadow', 'Eyeliner', 'Mascara', 'Lipstick', 'Lip Gloss', 'Lip Liner', 'Makeup Brush', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'shade', 'label' => 'Shade / Color', 'type' => 'text', 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Sealed', 'Swatched', 'Used'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'haircare' => [
                ['name' => 'product_type', 'label' => 'Product Type', 'type' => 'select', 'options' => ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Cream', 'Hair Gel', 'Hair Spray', 'Hair Mask', 'Hair Serum', 'Relaxer', 'Hair Dye', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'hair_type', 'label' => 'Hair Type', 'type' => 'select', 'options' => ['All Hair Types', 'Straight', 'Wavy', 'Curly', 'Coily', 'Natural', 'Relaxed'], 'group_name' => 'Specifications'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Sealed', 'Used'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'fragrances' => [
                ['name' => 'fragrance_type', 'label' => 'Fragrance Type', 'type' => 'select', 'options' => ['Perfume', 'Cologne', 'Body Spray', 'Deodorant', 'Essential Oil', 'Attar', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'gender', 'label' => 'Gender', 'type' => 'select', 'options' => ['Men', 'Women', 'Unisex'], 'group_name' => 'Basic Info'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'size_ml', 'label' => 'Size (ml)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Sealed', 'Used'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // ============================================================
            // JOBS
            // ============================================================
            'tech-jobs' => [
                ['name' => 'job_type', 'label' => 'Job Type', 'type' => 'select', 'options' => ['Full-Time', 'Part-Time', 'Contract', 'Remote', 'Hybrid'], 'is_required' => true, 'group_name' => 'Job Details'],
                ['name' => 'experience_level', 'label' => 'Experience Level', 'type' => 'select', 'options' => ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager', 'Director'], 'is_required' => true, 'group_name' => 'Job Details'],
                ['name' => 'min_qualification', 'label' => 'Minimum Qualification', 'type' => 'select', 'options' => ['SSCE', 'OND', 'HND', 'B.Sc', 'M.Sc', 'PhD', 'Any'], 'group_name' => 'Requirements'],
                ['name' => 'years_experience', 'label' => 'Years of Experience', 'type' => 'number', 'group_name' => 'Requirements'],
                ['name' => 'salary_range', 'label' => 'Salary Range', 'type' => 'text', 'group_name' => 'Compensation'],
                ['name' => 'application_deadline', 'label' => 'Application Deadline', 'type' => 'text', 'group_name' => 'Job Details'],
                ['name' => 'work_mode', 'label' => 'Work Mode', 'type' => 'select', 'options' => ['Onsite', 'Remote', 'Hybrid', 'Flexible'], 'group_name' => 'Job Details'],
            ],

            'driver-jobs' => [
                ['name' => 'license_required', 'label' => 'License Required', 'type' => 'select', 'options' => ['Class A', 'Class B', 'Class C', 'Class D', 'Class E', 'Any'], 'is_required' => true, 'group_name' => 'Requirements'],
                ['name' => 'vehicle_type', 'label' => 'Vehicle Type', 'type' => 'select', 'options' => ['Car', 'Truck', 'Bus', 'Motorcycle', 'Mini Truck'], 'group_name' => 'Job Details'],
                ['name' => 'experience_years', 'label' => 'Years of Driving Experience', 'type' => 'number', 'is_required' => true, 'group_name' => 'Requirements'],
                ['name' => 'salary_range', 'label' => 'Salary Range', 'type' => 'text', 'group_name' => 'Compensation'],
                ['name' => 'job_type', 'label' => 'Job Type', 'type' => 'select', 'options' => ['Full-Time', 'Part-Time', 'Contract'], 'is_required' => true, 'group_name' => 'Job Details'],
            ],

            'remote-jobs' => [
                ['name' => 'job_category', 'label' => 'Job Category', 'type' => 'select', 'options' => ['Technology', 'Customer Service', 'Writing', 'Design', 'Marketing', 'Data Entry', 'Sales', 'Virtual Assistant', 'Tutoring', 'Other'], 'is_required' => true, 'group_name' => 'Job Details'],
                ['name' => 'experience_level', 'label' => 'Experience Level', 'type' => 'select', 'options' => ['Entry Level', 'Mid Level', 'Senior', 'Lead'], 'is_required' => true, 'group_name' => 'Job Details'],
                ['name' => 'salary_range', 'label' => 'Salary Range', 'type' => 'text', 'group_name' => 'Compensation'],
                ['name' => 'time_zone', 'label' => 'Time Zone Requirement', 'type' => 'text', 'group_name' => 'Job Details'],
                ['name' => 'application_deadline', 'label' => 'Application Deadline', 'type' => 'text', 'group_name' => 'Job Details'],
            ],

            // ============================================================
            // PETS
            // ============================================================
            'dogs' => [
                ['name' => 'breed', 'label' => 'Breed', 'type' => 'select', 'options' => ['German Shepherd', 'Golden Retriever', 'Labrador', 'Rottweiler', 'Pit Bull', 'Boerboel', 'Alabian', 'Poodle', 'Bulldog', 'Cocker Spaniel', 'Maltese', 'Chihuahua', 'Mixed', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'age', 'label' => 'Age', 'type' => 'select', 'options' => ['Puppy (0-6 months)', 'Young (6-12 months)', 'Adult (1-5 years)', 'Senior (5+ years)'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'gender', 'label' => 'Gender', 'type' => 'select', 'options' => ['Male', 'Female'], 'group_name' => 'Basic Info'],
                ['name' => 'vaccinated', 'label' => 'Vaccinated', 'type' => 'boolean', 'group_name' => 'Health'],
                ['name' => 'microchipped', 'label' => 'Microchipped', 'type' => 'boolean', 'group_name' => 'Health'],
                ['name' => 'papertrained', 'label' => 'House Trained', 'type' => 'boolean', 'group_name' => 'Behavior'],
            ],

            'cats' => [
                ['name' => 'breed', 'label' => 'Breed', 'type' => 'select', 'options' => ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Scottish Fold', 'Bengal', 'Abyssinian', 'Ragdoll', 'Mixed', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'age', 'label' => 'Age', 'type' => 'select', 'options' => ['Kitten (0-6 months)', 'Young (6-12 months)', 'Adult (1-5 years)', 'Senior (5+ years)'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'gender', 'label' => 'Gender', 'type' => 'select', 'options' => ['Male', 'Female'], 'group_name' => 'Basic Info'],
                ['name' => 'vaccinated', 'label' => 'Vaccinated', 'type' => 'boolean', 'group_name' => 'Health'],
                ['name' => 'neutered', 'label' => 'Neutered/Spayed', 'type' => 'boolean', 'group_name' => 'Health'],
            ],

            // ============================================================
            // HOME, FURNITURE & APPLIANCES
            // ============================================================
            'furniture' => [
                ['name' => 'furniture_type', 'label' => 'Furniture Type', 'type' => 'select', 'options' => ['Sofa', 'Dining Table', 'Bed', 'Chair', 'Wardrobe', 'Cabinet', 'Desk', 'Bookshelf', 'TV Stand', 'Ottoman', 'Mattress', 'Nightstand', 'Dresser', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Wood', 'Metal', 'Leather', 'Fabric', 'Glass', 'Plastic', 'Rattan', 'Marble', 'Mixed'], 'group_name' => 'Specifications'],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'group_name' => 'Appearance'],
                ['name' => 'style', 'label' => 'Style', 'type' => 'select', 'options' => ['Modern', 'Contemporary', 'Classic', 'Traditional', 'Rustic', 'Minimalist', 'Industrial', 'Scandinavian'], 'group_name' => 'Style'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair', 'Refurbished'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'dimensions', 'label' => 'Dimensions (LxWxH cm)', 'type' => 'text', 'group_name' => 'Specifications'],
            ],

            // ============================================================
            // SERVICES
            // ============================================================
            'cleaning-services' => [
                ['name' => 'service_type', 'label' => 'Service Type', 'type' => 'select', 'options' => ['Home Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Industrial Cleaning', 'Post-Construction', 'Move In/Out', 'Other'], 'is_required' => true, 'group_name' => 'Service Details'],
                ['name' => 'coverage', 'label' => 'Coverage', 'type' => 'select', 'options' => ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'All Nigeria', 'Other'], 'group_name' => 'Coverage'],
                ['name' => 'pricing_model', 'label' => 'Pricing Model', 'type' => 'select', 'options' => ['Flat Rate', 'Per Hour', 'Per Square Meter', 'Negotiable'], 'group_name' => 'Pricing'],
            ],

            'digital-services' => [
                ['name' => 'service_category', 'label' => 'Service Category', 'type' => 'select', 'options' => ['Web Development', 'Mobile App Development', 'Graphic Design', 'UI/UX Design', 'Digital Marketing', 'SEO', 'Content Writing', 'Social Media Management', 'Data Entry', 'Other'], 'is_required' => true, 'group_name' => 'Service Details'],
                ['name' => 'delivery_time', 'label' => 'Delivery Time', 'type' => 'text', 'group_name' => 'Service Details'],
                ['name' => 'portfolio', 'label' => 'Portfolio Available', 'type' => 'boolean', 'group_name' => 'Service Details'],
                ['name' => 'pricing_model', 'label' => 'Pricing Model', 'type' => 'select', 'options' => ['Fixed Price', 'Hourly', 'Project Based', 'Negotiable'], 'group_name' => 'Pricing'],
            ],

            // ============================================================
            // SPORTS & OUTDOOR
            // ============================================================
            'gym-equipment' => [
                ['name' => 'equipment_type', 'label' => 'Equipment Type', 'type' => 'select', 'options' => ['Treadmill', 'Exercise Bike', 'Elliptical', 'Rowing Machine', 'Weight Bench', 'Dumbbell Set', 'Barbell Set', 'Kettlebell', 'Pull-Up Bar', 'Leg Press', 'Cable Machine', 'Smith Machine', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'weight_capacity', 'label' => 'Weight Capacity (kg)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'bicycles' => [
                ['name' => 'bike_type', 'label' => 'Bike Type', 'type' => 'select', 'options' => ['Mountain Bike', 'Road Bike', 'Hybrid Bike', 'BMX', 'Electric Bike', 'City Bike', 'Kids Bike', 'Folding Bike', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'group_name' => 'Basic Info'],
                ['name' => 'frame_size', 'label' => 'Frame Size (inches)', 'type' => 'number', 'group_name' => 'Specifications'],
                ['name' => 'gear_count', 'label' => 'Gear Count', 'type' => 'select', 'options' => ['Single Speed', '3-Speed', '7-Speed', '10-Speed', '12-Speed', '18-Speed', '21-Speed', '24-Speed', '27-Speed', 'Other'], 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            // ============================================================
            // BABY & KIDS
            // ============================================================
            'baby-clothing' => [
                ['name' => 'clothing_type', 'label' => 'Clothing Type', 'type' => 'select', 'options' => ['Onesies', 'Rompers', 'T-Shirts', 'Pants', 'Dresses', 'Sleeper', 'Swaddle', 'Socks', 'Hat', 'Sets', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'age_size', 'label' => 'Age/Size', 'type' => 'select', 'options' => ['Newborn', '0-3 Months', '3-6 Months', '6-9 Months', '9-12 Months', '12-18 Months', '18-24 Months'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Cotton', 'Organic Cotton', 'Polyester', 'Bamboo', 'Wool', 'Mixed'], 'group_name' => 'Specifications'],
                ['name' => 'gender', 'label' => 'Gender', 'type' => 'select', 'options' => ['Boy', 'Girl', 'Unisex'], 'group_name' => 'Basic Info'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],

            'toys' => [
                ['name' => 'toy_type', 'label' => 'Toy Type', 'type' => 'select', 'options' => ['Action Figures', 'Dolls', 'Building Blocks', 'Cars', 'Puzzles', 'Board Games', 'Stuffed Animals', 'Remote Control', 'Educational', 'Musical', 'Outdoor Play', 'Other'], 'is_required' => true, 'group_name' => 'Basic Info'],
                ['name' => 'age_range', 'label' => 'Age Range', 'type' => 'select', 'options' => ['0-12 Months', '1-3 Years', '3-5 Years', '5-8 Years', '8-12 Years', '12+ Years'], 'is_required' => true, 'group_name' => 'Specifications'],
                ['name' => 'material', 'label' => 'Material', 'type' => 'select', 'options' => ['Plastic', 'Wood', 'Fabric', 'Metal', 'Mixed'], 'group_name' => 'Specifications'],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['Brand New', 'Like New', 'Good', 'Fair'], 'is_required' => true, 'group_name' => 'Basic Info'],
            ],
        ];
    }
}
