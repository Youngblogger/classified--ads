export type FieldType = 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'textarea' | 'checkbox' | 'radio';

export interface SpecField {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  is_required?: boolean;
  group_name?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
}

export interface CategoryFields {
  name: string;
  slug: string;
  hasBrand?: boolean;
  fields: SpecField[];
}

export const CATEGORY_FIELDS: Record<string, CategoryFields> = {
  'vehicles': {
    name: 'Vehicles', slug: 'vehicles', hasBrand: true,
    fields: [
      { name: 'make', label: 'Make', type: 'select', is_required: true, options: ['Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Volkswagen', 'Ford', 'Chevrolet', 'Peugeot', 'Renault', 'Mitsubishi', 'Subaru', 'Suzuki', 'Jeep', 'Land Rover', 'Range Rover', 'Audi', 'Porsche', 'Volvo', 'Jaguar', 'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce', 'Mini', 'Chrysler', 'Dodge', 'GMC', 'Cadillac', 'Acura', 'Infiniti', 'Tesla', 'Other'], group_name: 'Basic Info' },
      { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g. Camry, C-Class, X5', group_name: 'Basic Info' },
      { name: 'year', label: 'Year', type: 'select', is_required: true, options: ['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013','2012','2011','2010','2009','2008','2007','2006','2005','2004','2003','2002','2001','2000','1999','1998','1997','1996','1995','1994','1993','1992','1991','1990','1989','1988','1987','1986','1985','1984','1983','1982','1981','1980','1979','1978','1977','1976','1975','1974','1973','1972','1971','1970'], group_name: 'Basic Info' },
      { name: 'mileage', label: 'Mileage (km)', type: 'number', placeholder: 'e.g. 50000', validation: { min: 0, max: 9999999 }, group_name: 'Basic Info' },
      { name: 'registered', label: 'Registration Status', type: 'select', options: ['Registered', 'Unregistered', 'Foreign Used', 'Custom', 'Commercial'], group_name: 'Basic Info' },
      { name: 'transmission', label: 'Transmission', type: 'select', is_required: true, options: ['Automatic', 'Manual', 'Semi-Automatic', 'CVT', 'Dual-Clutch'], group_name: 'Specifications' },
      { name: 'fuel_type', label: 'Fuel Type', type: 'select', is_required: true, options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Hydrogen', 'LPG', 'CNG'], group_name: 'Specifications' },
      { name: 'engine_size', label: 'Engine Size', type: 'select', options: ['1.0L & below', '1.2L', '1.3L', '1.4L', '1.5L', '1.6L', '1.8L', '2.0L', '2.2L', '2.4L', '2.5L', '2.8L', '3.0L', '3.2L', '3.5L', '4.0L', '4.5L', '5.0L', '5.7L', '6.0L', '6.2L', 'Electric'], group_name: 'Specifications' },
      { name: 'drive_type', label: 'Drive Type', type: 'select', options: ['FWD', 'RWD', 'AWD', '4WD'], group_name: 'Specifications' },
      { name: 'body_type', label: 'Body Type', type: 'select', options: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Wagon', 'Minivan', 'Crossover'], group_name: 'Basic Info' },
      { name: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Gold', 'Brown', 'Beige', 'Burgundy', 'Orange', 'Yellow', 'Purple', 'Pink', 'Bronze', 'Navy', 'Teal', 'Maroon', 'Champagne', 'Other'], group_name: 'Appearance' },
      { name: 'interior_color', label: 'Interior Color', type: 'select', options: ['Black', 'Beige', 'Grey', 'Brown', 'Cream', 'Tan', 'White', 'Red', 'Blue', 'Burgundy', 'Charcoal', 'Ivory', 'Two Tone', 'Other'], group_name: 'Appearance' },
      { name: 'seats', label: 'Seats', type: 'select', options: ['2', '4', '5', '6', '7', '8', '9+'], group_name: 'Basic Info' },
      { name: 'doors', label: 'Doors', type: 'select', options: ['2', '3', '4', '5'], group_name: 'Basic Info' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New', 'Used - Like New', 'Used - Good', 'Used - Fair', 'Used - Poor', 'Spare Parts'], group_name: 'Basic Info' },
      { name: 'air_conditioning', label: 'Air Conditioning', type: 'boolean', group_name: 'Features' },
      { name: 'sunroof', label: 'Sunroof', type: 'boolean', group_name: 'Features' },
      { name: 'leather_seats', label: 'Leather Seats', type: 'boolean', group_name: 'Features' },
      { name: 'navigation', label: 'Navigation System', type: 'boolean', group_name: 'Features' },
      { name: 'reverse_camera', label: 'Reverse Camera', type: 'boolean', group_name: 'Features' },
      { name: 'parking_sensors', label: 'Parking Sensors', type: 'boolean', group_name: 'Features' },
      { name: 'bluetooth', label: 'Bluetooth', type: 'boolean', group_name: 'Features' },
      { name: 'abs', label: 'ABS', type: 'boolean', group_name: 'Safety' },
      { name: 'airbags', label: 'Airbags', type: 'select', options: ['None', 'Driver Only', 'Front', 'Front & Side', 'Full'], group_name: 'Safety' },
      { name: 'registration_number', label: 'Plate Number', type: 'text', placeholder: 'e.g. ABC-123-XY', group_name: 'Documents' },
      { name: 'vin', label: 'VIN', type: 'text', placeholder: 'e.g. WDBGA57EXFA...', group_name: 'Documents' },
      { name: 'exchange_possible', label: 'Exchange Possible', type: 'select', options: ['Not Available', 'Cash + Exchange', 'Straight Exchange'], group_name: 'Basic Info' },
    ],
  },
  'mobile-phones': {
    name: 'Mobile Phones & Tablets', slug: 'mobile-phones', hasBrand: true,
    fields: [
      { name: 'brand', label: 'Brand', type: 'select', is_required: true, options: ['Apple', 'Samsung', 'Tecno', 'Infinix', 'Nokia', 'Huawei', 'Xiaomi', 'Oppo', 'Vivo', 'OnePlus', 'Google', 'Sony', 'LG', 'Motorola', 'HTC', 'BlackBerry', 'Alcatel', 'Gionee', 'Itel', 'Realme', 'Honor', 'Asus', 'ZTE', 'Lenovo', 'Meizu', 'Other'], group_name: 'Basic Info' },
      { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g. iPhone 14 Pro Max', is_required: true, group_name: 'Basic Info' },
      { name: 'ram', label: 'RAM', type: 'select', is_required: true, options: ['1GB', '2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '24GB'], group_name: 'Memory' },
      { name: 'storage', label: 'Storage / ROM', type: 'select', is_required: true, options: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'], group_name: 'Memory' },
      { name: 'battery_capacity', label: 'Battery Capacity', type: 'select', options: ['1500mAh', '2000mAh', '2500mAh', '3000mAh', '3500mAh', '4000mAh', '4500mAh', '5000mAh', '5500mAh', '6000mAh', '7000mAh', '8000mAh', '10000mAh'], group_name: 'Battery' },
      { name: 'screen_size', label: 'Screen Size', type: 'select', options: ['Under 4.0"', '4.0"', '4.5"', '4.7"', '5.0"', '5.5"', '5.8"', '6.0"', '6.1"', '6.2"', '6.3"', '6.4"', '6.5"', '6.6"', '6.7"', '6.8"', '6.9"', '7.0"', '7.6"', '8.0"', '10"+'], group_name: 'Display' },
      { name: 'sim_type', label: 'SIM Type', type: 'select', options: ['Single SIM', 'Dual SIM', 'eSIM', 'Dual + eSIM', 'Triple SIM'], group_name: 'Connectivity' },
      { name: 'network', label: 'Network', type: 'select', options: ['GSM Only', '3G', '4G LTE', '5G', 'WiFi Only'], group_name: 'Connectivity' },
      { name: 'operating_system', label: 'Operating System', type: 'select', is_required: true, options: ['iOS', 'Android (Stock)', 'Android (Samsung One UI)', 'Android (Xiaomi MIUI)', 'Android (Tecno HIOS)', 'Android (Infinix XOS)', 'Android (Oppo ColorOS)', 'Android (Vivo Funtouch)', 'Android (Huawei EMUI)', 'HarmonyOS', 'KaiOS', 'Other'], group_name: 'Software' },
      { name: 'processor', label: 'Processor', type: 'select', options: ['MediaTek Helio', 'MediaTek Dimensity', 'Qualcomm Snapdragon 4 Gen', 'Qualcomm Snapdragon 6 Gen', 'Qualcomm Snapdragon 7 Gen', 'Qualcomm Snapdragon 8 Gen', 'Qualcomm Snapdragon 8 Elite', 'Apple A15 Bionic', 'Apple A16 Bionic', 'Apple A17 Pro', 'Apple A18', 'Apple A18 Pro', 'Samsung Exynos', 'Google Tensor', 'Google Tensor G2', 'Google Tensor G3', 'Google Tensor G4', 'Unisoc', 'Kirin', 'Other'], group_name: 'Specifications' },
      { name: 'camera_megapixels', label: 'Camera', type: 'select', options: ['1MP', '2MP', '5MP', '8MP', '12MP', '13MP', '16MP', '20MP', '24MP', '32MP', '48MP', '50MP', '64MP', '100MP', '108MP', '200MP'], group_name: 'Camera' },
      { name: 'connectivity', label: 'Connectivity Features', type: 'multi_select', options: ['4G', '5G', 'WiFi', 'Bluetooth', 'NFC', 'GPS', 'Infrared', 'FM Radio'], group_name: 'Connectivity' },
      { name: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Gold', 'Purple', 'Pink', 'Navy', 'Teal', 'Midnight', 'Starlight', 'Space Grey', 'Product(RED)', 'Other'], group_name: 'Appearance' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New (Sealed)', 'New (Open Box)', 'Used - Like New', 'Used - Good', 'Used - Fair', 'Used - Poor', 'Refurbished', 'For Parts'], group_name: 'Basic Info' },
      { name: 'warranty', label: 'Warranty Status', type: 'select', options: ['No Warranty', 'Manufacturer Warranty', 'Store Warranty', 'Third Party Warranty'], group_name: 'Basic Info' },
      { name: 'exchange_possible', label: 'Exchange Possible', type: 'radio', options: ['No', 'Yes - Same Brand', 'Yes - Any Brand'], group_name: 'Basic Info' },
    ],
  },
  'electronics': {
    name: 'Electronics', slug: 'electronics', hasBrand: true,
    fields: [
      { name: 'brand', label: 'Brand', type: 'select', is_required: true, options: ['Apple', 'Samsung', 'Dell', 'HP', 'Lenovo', 'Acer', 'Asus', 'Toshiba', 'Sony', 'LG', 'Panasonic', 'Microsoft', 'Huawei', 'Xiaomi', 'Razer', 'MSI', 'Alienware', 'Google', 'TCL', 'Hisense', 'Philips', 'Canon', 'Nikon', 'Bose', 'JBL', 'Other'], group_name: 'Basic Info' },
      { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g. MacBook Pro M3', group_name: 'Basic Info' },
      { name: 'processor', label: 'Processor', type: 'select', options: ['Intel Celeron', 'Intel Pentium', 'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'AMD Athlon', 'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4', 'Apple M1 Pro', 'Apple M2 Pro', 'Apple M3 Pro', 'Apple M1 Max', 'Apple M2 Max', 'Apple M3 Max', 'Qualcomm Snapdragon X', 'MediaTek', 'Other'], group_name: 'Specifications' },
      { name: 'ram', label: 'RAM', type: 'select', is_required: true, options: ['2GB', '4GB', '8GB', '12GB', '16GB', '24GB', '32GB', '48GB', '64GB', '96GB', '128GB'], group_name: 'Specifications' },
      { name: 'storage', label: 'Storage', type: 'select', is_required: true, options: ['32GB', '64GB', '128GB', '256GB', '320GB', '500GB', '512GB', '750GB', '1TB', '1.5TB', '2TB', '3TB', '4TB', '8TB'], group_name: 'Specifications' },
      { name: 'gpu', label: 'GPU / Graphics', type: 'select', options: ['Integrated', 'Intel Iris', 'Intel UHD', 'Intel Arc', 'AMD Radeon', 'AMD Radeon Pro', 'NVIDIA GeForce RTX 3050', 'NVIDIA GeForce RTX 4050', 'NVIDIA GeForce RTX 4060', 'NVIDIA GeForce RTX 4070', 'NVIDIA GeForce RTX 4080', 'NVIDIA GeForce RTX 4090', 'NVIDIA Quadro', 'Apple M-series GPU', 'Other'], group_name: 'Specifications' },
      { name: 'screen_size', label: 'Screen Size', type: 'select', options: ['11.6"', '12.3"', '12.9"', '13.0"', '13.3"', '13.4"', '13.6"', '14.0"', '14.2"', '14.5"', '15.0"', '15.4"', '15.6"', '16.0"', '16.1"', '16.2"', '17.0"', '17.3"', '18.0"', '20"+'], group_name: 'Display' },
      { name: 'resolution', label: 'Resolution', type: 'select', options: ['HD (1366x768)', 'FHD (1920x1080)', '2K (2560x1440)', '3K (2880x1620)', '4K (3840x2160)', '5K (5120x2880)', 'Retina', 'Liquid Retina', 'Liquid Retina XDR'], group_name: 'Display' },
      { name: 'display_type', label: 'Display Type', type: 'select', options: ['LED', 'LCD', 'OLED', 'AMOLED', 'Mini-LED', 'QLED', 'IPS', 'TN'], group_name: 'Display' },
      { name: 'operating_system', label: 'Operating System', type: 'select', options: ['Windows 11', 'Windows 10', 'macOS Sequoia', 'macOS Sonoma', 'macOS Ventura', 'macOS Monterey', 'ChromeOS', 'Linux', 'Ubuntu', 'Fedora', 'Android', 'iPadOS', 'Other'], group_name: 'Specifications' },
      { name: 'battery_health', label: 'Battery Health', type: 'select', options: ['Excellent (80%+)', 'Good (60-80%)', 'Fair (40-60%)', 'Poor (Below 40%)', 'Not Applicable'], group_name: 'Battery' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New (Sealed)', 'New (Open Box)', 'Used - Like New', 'Used - Good', 'Used - Fair', 'Refurbished', 'For Parts'], group_name: 'Basic Info' },
      { name: 'warranty', label: 'Warranty', type: 'select', options: ['No Warranty', 'Manufacturer Warranty', 'Store Warranty', 'Third Party Warranty', 'AppleCare+'], group_name: 'Basic Info' },
      { name: 'exchange_possible', label: 'Exchange Possible', type: 'boolean', group_name: 'Basic Info' },
    ],
  },
  'property': {
    name: 'Property', slug: 'property',
    fields: [
      { name: 'property_type', label: 'Property Type', type: 'select', is_required: true, options: ['House (Detached)', 'House (Semi-Detached)', 'House (Terraced)', 'Apartment/Flat', 'Duplex', 'Bungalow', 'Penthouse', 'Studio Apartment', 'Mini Flat', 'Self Contain', 'Room & Parlour', 'Land/Plot', 'Commercial Property', 'Office Space', 'Shop/Store', 'Warehouse', 'Factory/Industrial', 'Hotel/Guest House', 'Event Center', 'Farm House', 'Townhouse', 'Villa', 'Mansion'], group_name: 'Property Details' },
      { name: 'bedrooms', label: 'Bedrooms', type: 'select', is_required: true, options: ['Studio', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'], group_name: 'Property Details' },
      { name: 'bathrooms', label: 'Bathrooms', type: 'select', is_required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'], group_name: 'Property Details' },
      { name: 'toilets', label: 'Toilets', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'], group_name: 'Property Details' },
      { name: 'parking_spaces', label: 'Parking Spaces', type: 'select', options: ['None', '1', '2', '3', '4', '5+'], group_name: 'Property Details' },
      { name: 'furnishing', label: 'Furnishing', type: 'select', options: ['Furnished', 'Partly Furnished', 'Unfurnished'], group_name: 'Property Details' },
      { name: 'square_meters', label: 'Size (sqm)', type: 'number', placeholder: 'e.g. 200', validation: { min: 1, max: 999999 }, group_name: 'Property Details' },
      { name: 'title_document', label: 'Title Document', type: 'select', options: ['C of O', 'Governor Consent', 'Deed of Assignment', 'Deed of Lease', 'Survey Plan', 'Excision Document', 'Gazette', 'Power of Attorney', 'None', 'Other'], group_name: 'Legal' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['Newly Built', 'Excellent', 'Good', 'Fair', 'Needs Renovation', 'Under Construction'], group_name: 'Property Details' },
      { name: 'floors', label: 'Floors', type: 'select', options: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th+ Floor'], group_name: 'Property Details' },
      { name: 'listing_type', label: 'Listing Type', type: 'select', is_required: true, options: ['For Rent', 'For Sale', 'For Lease', 'Short Let', 'Swap/Trade'], group_name: 'Property Details' },
      { name: 'service_charge', label: 'Service Charge (Annual)', type: 'number', placeholder: 'e.g. 50000', group_name: 'Pricing' },
      { name: 'rent_duration', label: 'Rent Duration', type: 'select', options: ['Monthly', 'Yearly', '2 Years', 'Negotiable'], group_name: 'Pricing' },
    ],
  },
  'fashion': {
    name: 'Fashion', slug: 'fashion',
    fields: [
      { name: 'clothing_type', label: 'Clothing Type', type: 'select', is_required: true, options: ["Men's Clothing", "Women's Clothing", "Children's Clothing", 'Shoes', 'Bags & Luggage', 'Watches', 'Jewelry', 'Accessories', 'Sportswear', 'Traditional Wear', 'Wedding Wear', 'Uniforms', 'Vintage Clothing', 'Swimwear', 'Undergarments', 'Sleepwear', 'Outerwear'], group_name: 'Apparel' },
      { name: 'gender', label: 'Gender', type: 'select', is_required: true, options: ['Men', 'Women', 'Unisex', 'Boys', 'Girls', 'Kids'], group_name: 'Apparel' },
      { name: 'size', label: 'Size', type: 'select', is_required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', 'Custom Size', 'EU 35', 'EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45', 'EU 46', 'US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'One Size'], group_name: 'Apparel' },
      { name: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Gold', 'Brown', 'Beige', 'Burgundy', 'Orange', 'Yellow', 'Purple', 'Pink', 'Bronze', 'Navy', 'Teal', 'Maroon', 'Champagne', 'Multicolor', 'Animal Print', 'Other'], group_name: 'Apparel' },
      { name: 'material', label: 'Material', type: 'select', options: ['Cotton', 'Polyester', 'Nylon', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather', 'Synthetic Leather', 'Suede', 'Velvet', 'Lace', 'Cashmere', 'Rayon', 'Spandex', 'Acrylic', 'Lycra', 'Tweed', 'Canvas', 'Rubber', 'Other'], group_name: 'Apparel' },
      { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Nike, Gucci, Zara', group_name: 'Apparel' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New with Tags', 'New without Tags', 'Used - Like New', 'Used - Good', 'Used - Fair', 'Vintage/Retro'], group_name: 'Basic Info' },
    ],
  },
  'home-furniture': {
    name: 'Home, Furniture & Appliances', slug: 'home-furniture',
    fields: [
      { name: 'category', label: 'Furniture/Appliance Type', type: 'select', is_required: true, options: ['Sofa & Couches', 'Beds & Mattresses', 'Tables & Desks', 'Chairs', 'Wardrobes', 'Cabinets & Shelves', 'Lighting', 'Home Decor', 'Kitchen Appliances', 'Home Improvement', 'Garden & Outdoor', 'Storage & Organization', 'Bedding & Linen', 'Curtains & Blinds', 'Rugs & Carpets', 'Air Conditioners', 'Generators', 'Refrigerators & Freezers', 'Washing Machines', 'Water Heaters', 'Fans', 'Microwaves & Ovens', 'Vacuum Cleaners', 'Irons & Steamers'], group_name: 'Product Type' },
      { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. LG, Samsung, Thermocool', group_name: 'Product Type' },
      { name: 'material', label: 'Material', type: 'select', options: ['Wood', 'Metal', 'Fabric', 'Leather', 'Glass', 'Plastic', 'Marble', 'Stainless Steel', 'Wicker/Rattan', 'Bamboo', 'Concrete', 'Stone', 'Ceramic', 'Other'], group_name: 'Product Type' },
      { name: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Gold', 'Brown', 'Beige', 'Burgundy', 'Orange', 'Yellow', 'Purple', 'Pink', 'Navy', 'Teal', 'Maroon', 'Champagne', 'Wood Finish', 'Multicolor', 'Other'], group_name: 'Appearance' },
      { name: 'power_rating', label: 'Power Rating (Watts)', type: 'select', options: ['Below 500W', '500W - 1000W', '1000W - 2000W', '2000W - 3000W', '3000W+', 'Not Applicable'], group_name: 'Specifications' },
      { name: 'energy_rating', label: 'Energy Rating', type: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Not Specified'], group_name: 'Specifications' },
      { name: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'e.g. 200cm x 90cm x 80cm', group_name: 'Specifications' },
      { name: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 25', group_name: 'Specifications' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New (Sealed)', 'New (Open Box)', 'Used - Like New', 'Used - Good', 'Used - Fair', 'Refurbished', 'For Parts'], group_name: 'Basic Info' },
    ],
  },
  'jobs': {
    name: 'Jobs', slug: 'jobs',
    fields: [
      { name: 'job_type', label: 'Job Type', type: 'select', is_required: true, options: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Remote', 'Hybrid', 'Temporary', 'Seasonal', 'Volunteer', 'Graduate Trainee', 'National Service'], group_name: 'Job Details' },
      { name: 'industry', label: 'Industry', type: 'select', options: ['Accounting & Finance', 'Administration & Office', 'Agriculture & Farming', 'Architecture & Construction', 'Automotive', 'Aviation & Aerospace', 'Banking & Insurance', 'Creative & Design', 'Education & Training', 'Engineering', 'Healthcare & Medical', 'Hospitality & Tourism', 'Human Resources', 'IT & Software', 'Legal', 'Logistics & Transportation', 'Manufacturing', 'Marketing & Sales', 'Media & Communications', 'NGO & Non-Profit', 'Oil & Gas', 'Real Estate', 'Retail', 'Security & Safety', 'Telecommunications', 'Trade & Services', 'Other'], group_name: 'Job Details' },
      { name: 'experience_level', label: 'Experience Level', type: 'select', is_required: true, options: ['Entry Level (0-1 year)', 'Junior (1-2 years)', 'Mid-Level (3-5 years)', 'Senior (6-10 years)', 'Lead (10+ years)', 'Executive/Director'], group_name: 'Job Details' },
      { name: 'education_level', label: 'Minimum Education', type: 'select', options: ['No Requirement', 'SSCE / WAEC', 'OND / Diploma', 'HND / Bachelors Degree', 'Masters Degree', 'PhD / Doctorate', 'Professional Certification'], group_name: 'Job Details' },
      { name: 'salary_range', label: 'Salary Range', type: 'select', is_required: true, options: ['₦0 - ₦50,000', '₦50,000 - ₦100,000', '₦100,000 - ₦250,000', '₦250,000 - ₦500,000', '₦500,000 - ₦1,000,000', '₦1,000,000 - ₦2,500,000', '₦2,500,000 - ₦5,000,000', '₦5,000,000+', 'Negotiable', 'Unpaid / Volunteer'], group_name: 'Pricing' },
      { name: 'work_mode', label: 'Work Mode', type: 'radio', options: ['On-site', 'Remote', 'Hybrid'], group_name: 'Job Details' },
      { name: 'application_deadline', label: 'Application Deadline', type: 'text', placeholder: 'e.g. 2026-07-01', group_name: 'Job Details' },
    ],
  },
  'services': {
    name: 'Services', slug: 'services',
    fields: [
      { name: 'service_type', label: 'Service Type', type: 'select', is_required: true, options: ['Automotive Services', 'Building & Construction', 'Cleaning Services', 'Computer & IT Support', 'Design & Creative', 'Education & Tutoring', 'Events & Catering', 'Gardening & Landscaping', 'Health & Wellness', 'Home Improvement', 'Legal Services', 'Logistics & Moving', 'Music & Entertainment', 'Photography & Video', 'Repair & Maintenance', 'Security Services', 'Translation & Writing', 'Beauty & Spa', 'Consulting', 'Marketing & Advertising', 'Other Services'], group_name: 'Service Details' },
      { name: 'service_level', label: 'Service Level', type: 'select', options: ['Basic', 'Standard', 'Premium', 'Luxury', 'Enterprise', 'Customizable'], group_name: 'Service Details' },
      { name: 'pricing_type', label: 'Pricing Type', type: 'radio', options: ['Fixed Price', 'Hourly Rate', 'Project Based', 'Free Quote', 'Negotiable'], group_name: 'Pricing' },
      { name: 'availability', label: 'Availability', type: 'select', options: ['Immediately', 'Within 24 Hours', 'Within 3 Days', 'Within 1 Week', 'By Appointment', 'Weekends Only'], group_name: 'Service Details' },
      { name: 'location_area', label: 'Service Area', type: 'text', placeholder: 'e.g. Lagos Mainland, Abuja', group_name: 'Service Details' },
    ],
  },
  'pets': {
    name: 'Pets', slug: 'pets',
    fields: [
      { name: 'pet_type', label: 'Pet Type', type: 'select', is_required: true, options: ['Dogs', 'Cats', 'Birds', 'Fish', 'Reptiles', 'Rabbits', 'Hamsters', 'Guinea Pigs', 'Horses', 'Livestock', 'Exotic Pets', 'Other Pets', 'Pet Supplies', 'Pet Food'], group_name: 'Pet Info' },
      { name: 'breed', label: 'Breed', type: 'select', options: ['Purebred', 'Crossbred', 'Mixed', 'Designer', 'Local', 'Exotic'], group_name: 'Pet Info' },
      { name: 'age', label: 'Age', type: 'select', is_required: true, options: ['Newborn (0-3 months)', 'Puppy/Kitten (3-12 months)', 'Young (1-2 years)', 'Adult (2-7 years)', 'Senior (7+ years)'], group_name: 'Pet Info' },
      { name: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'Extra Large'], group_name: 'Pet Info' },
      { name: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Brown', 'Golden', 'Grey', 'Spotted', 'Brindle', 'Tricolor', 'Other'], group_name: 'Pet Info' },
      { name: 'gender', label: 'Gender', type: 'radio', options: ['Male', 'Female'], group_name: 'Pet Info' },
      { name: 'vaccinated', label: 'Vaccinated', type: 'boolean', group_name: 'Health' },
      { name: 'neutered', label: 'Neutered/Spayed', type: 'boolean', group_name: 'Health' },
      { name: 'dewormed', label: 'Dewormed', type: 'boolean', group_name: 'Health' },
      { name: 'microchipped', label: 'Microchipped', type: 'boolean', group_name: 'Health' },
      { name: 'health_certificate', label: 'Health Certificate', type: 'boolean', group_name: 'Health' },
      { name: 'registration', label: 'Kennel Club Registered', type: 'boolean', group_name: 'Health' },
      { name: 'pedigree', label: 'Pedigree Papers', type: 'boolean', group_name: 'Health' },
      { name: 'price_negotiable', label: 'Price Negotiable', type: 'boolean', group_name: 'Pricing' },
    ],
  },
  'health-beauty': {
    name: 'Health & Beauty', slug: 'health-beauty',
    fields: [
      { name: 'product_category', label: 'Category', type: 'select', is_required: true, options: ['Skincare', 'Haircare', 'Makeup', 'Fragrances', 'Nail Care', 'Bath & Body', 'Vitamins & Supplements', 'Medical Supplies', 'Fitness Equipment', 'Hair Extensions & Wigs', 'Beauty Tools', 'Sexual Wellness', 'Organic & Natural', 'Men Grooming', 'Oral Care', 'Eye Care'], group_name: 'Product Type' },
      { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. L\'Oreal, Nivea, MAC', group_name: 'Product Type' },
      { name: 'gender', label: 'Gender', type: 'radio', options: ['Women', 'Men', 'Unisex', 'Kids'], group_name: 'Product Type' },
      { name: 'skin_type', label: 'Skin Type', type: 'multi_select', options: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Acne-Prone', 'Mature'], group_name: 'Product Type' },
      { name: 'volume', label: 'Volume/Size', type: 'text', placeholder: 'e.g. 250ml, 50g', group_name: 'Product Type' },
      { name: 'expiry_date', label: 'Expiry Date', type: 'text', placeholder: 'e.g. 2027-06', group_name: 'Product Type' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New (Sealed)', 'New (Open Box)', 'Used - Like New', 'Used - Good', 'Refurbished'], group_name: 'Basic Info' },
    ],
  },
  'baby-kids': {
    name: 'Baby & Kids', slug: 'baby-kids',
    fields: [
      { name: 'product_type', label: 'Product Type', type: 'select', is_required: true, options: ['Diapers & Wipes', 'Baby Food & Formula', 'Milk & Feeding', 'Strollers & Prams', 'Car Seats', 'Cribs & Cots', 'Furniture', 'Baby Carriers & Slings', 'Toys & Games', 'Books & Learning', 'Clothing', 'Shoes & Footwear', 'Feeding Supplies', 'Safety & Health', 'Bathing & Grooming', 'Nursery & Room Decor', 'Maternity Wear', 'Nursing & Breastfeeding', 'Baby Monitors', 'Travel Gear'], group_name: 'Product Type' },
      { name: 'age_group', label: 'Age Group', type: 'select', is_required: true, options: ['Newborn (0-3 months)', 'Infant (3-12 months)', 'Toddler (1-3 years)', 'Preschool (3-5 years)', 'School Age (5-12 years)', 'Teen (12+ years)'], group_name: 'Product Type' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Boys', 'Girls', 'Unisex'], group_name: 'Product Type' },
      { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Pampers, Huggies, Fisher-Price', group_name: 'Product Type' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New (Sealed)', 'New (Open Box)', 'Used - Like New', 'Used - Good', 'Used - Fair'], group_name: 'Basic Info' },
    ],
  },
  'sports': {
    name: 'Sports & Outdoors', slug: 'sports',
    fields: [
      { name: 'sport_type', label: 'Sport Type', type: 'select', is_required: true, options: ['Football / Soccer', 'Basketball', 'Tennis', 'Badminton', 'Swimming', 'Cycling', 'Running & Jogging', 'Fitness & Gym', 'Yoga & Pilates', 'Boxing & MMA', 'Golf', 'Camping & Hiking', 'Fishing', 'Hunting', 'Volleyball', 'Baseball', 'Rugby', 'Skateboarding', 'Skiing & Snowboarding', 'Surfing', 'Water Sports', 'Horseback Riding', 'Table Tennis', 'Other Sports'], group_name: 'Sport Details' },
      { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Nike, Adidas, Puma', group_name: 'Sport Details' },
      { name: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'Junior', 'Standard', 'Professional'], group_name: 'Sport Details' },
      { name: 'material', label: 'Material', type: 'select', options: ['Leather', 'Synthetic', 'Rubber', 'Plastic', 'Metal', 'Wood', 'Carbon Fiber', 'Fabric', 'Mesh', 'Foam', 'Other'], group_name: 'Sport Details' },
      { name: 'used_for', label: 'Usage Level', type: 'radio', options: ['Professional', 'Recreational', 'Beginner', 'Kids/Youth'], group_name: 'Sport Details' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New (Sealed)', 'New (Open Box)', 'Used - Like New', 'Used - Good', 'Used - Fair', 'Refurbished'], group_name: 'Basic Info' },
    ],
  },
  'books-music-movies': {
    name: 'Books & Media', slug: 'books-music-movies',
    fields: [
      { name: 'media_type', label: 'Media Type', type: 'select', is_required: true, options: ['Books', 'Textbooks', 'Magazines', 'Comics & Graphic Novels', 'Music CDs', 'Vinyl Records', 'Movies & TV on DVD/Blu-ray', 'Video Games', 'Audiobooks', 'Sheet Music', 'E-books', 'Calendars', 'Other Media'], group_name: 'Media Type' },
      { name: 'genre', label: 'Genre', type: 'select', options: ['Fiction', 'Non-Fiction', 'Educational', 'Science & Technology', 'History', 'Biography', 'Romance', 'Thriller', 'Fantasy', 'Science Fiction', 'Horror', 'Comedy', 'Drama', 'Action', 'Children', 'Religious', 'Self-Help', 'Business', 'Art & Photography', 'Cooking', 'Travel', 'Other'], group_name: 'Media Type' },
      { name: 'author_artist', label: 'Author / Artist', type: 'text', placeholder: 'e.g. Chimamanda Adichie', group_name: 'Media Type' },
      { name: 'language', label: 'Language', type: 'select', options: ['English', 'French', 'Arabic', 'Spanish', 'Portuguese', 'Yoruba', 'Hausa', 'Igbo', 'Swahili', 'German', 'Italian', 'Chinese', 'Japanese', 'Other'], group_name: 'Media Type' },
      { name: 'format', label: 'Format', type: 'select', options: ['Paperback', 'Hardcover', 'Spiral Bound', 'Audio CD', 'MP3', 'Digital Download', 'DVD', 'Blu-ray', '4K Ultra HD', 'Vinyl', 'Cassette', 'Other'], group_name: 'Media Type' },
      { name: 'year_published', label: 'Year Published', type: 'number', placeholder: 'e.g. 2022', validation: { min: 1900, max: 2026 }, group_name: 'Media Type' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New (Sealed)', 'New', 'Used - Like New', 'Used - Good', 'Used - Fair', 'Collectible'], group_name: 'Basic Info' },
    ],
  },
  'food-drinks': {
    name: 'Food & Drinks', slug: 'food-drinks',
    fields: [
      { name: 'category', label: 'Category', type: 'select', is_required: true, options: ['Groceries', 'Beverages (Soft)', 'Alcoholic Beverages', 'Snacks & Confectionery', 'Baked Goods', 'Fresh Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Condiments & Sauces', 'Canned & Preserved', 'Frozen Foods', 'Grains & Cereals', 'Spices & Seasonings', 'Cooking Oils', 'Baby Food', 'Health Foods', 'Organic Products', 'Traditional Foods', 'Party Supplies', 'Other Food Items'], group_name: 'Product Type' },
      { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Nestle, Indomie, Coca-Cola', group_name: 'Product Type' },
      { name: 'weight_volume', label: 'Weight/Volume', type: 'text', placeholder: 'e.g. 500g, 1.5L', group_name: 'Product Type' },
      { name: 'expiry_date', label: 'Expiry Date', type: 'text', placeholder: 'e.g. 2026-12-31', group_name: 'Product Type' },
      { name: 'storage_instructions', label: 'Storage Instructions', type: 'select', options: ['Room Temperature', 'Refrigerate After Opening', 'Keep Frozen', 'Cool Dry Place', 'Avoid Direct Sunlight', 'Perishable - Keep Refrigerated'], group_name: 'Product Type' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New / Fresh', 'New (Sealed)', 'Best Before Valid', 'Frozen'], group_name: 'Basic Info' },
    ],
  },
  'agriculture': {
    name: 'Agriculture & Farming', slug: 'agriculture',
    fields: [
      { name: 'category', label: 'Category', type: 'select', is_required: true, options: ['Farm Equipment & Machinery', 'Tractors & Harvesters', 'Irrigation Systems', 'Livestock & Animals', 'Poultry & Birds', 'Fish & Aquaculture', 'Crops & Seeds', 'Fertilizers & Chemicals', 'Animal Feed & Supplements', 'Farm Buildings & Structures', 'Land & Farmland', 'Beekeeping', 'Farm Produce', 'Tools & Implements', 'Other Farming'], group_name: 'Product Type' },
      { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. John Deere, Massey Ferguson', group_name: 'Product Type' },
      { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g. 5075E', group_name: 'Product Type' },
      { name: 'year', label: 'Year', type: 'select', options: ['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013','2012','2011','2010','2009','2008','2007','2006','2005','2000','1990s','1980s','Older'], group_name: 'Product Type' },
      { name: 'quantity', label: 'Quantity', type: 'number', placeholder: 'e.g. 50', group_name: 'Product Type' },
      { name: 'condition', label: 'Condition', type: 'select', is_required: true, options: ['New', 'Like New', 'Used - Good', 'Used - Fair', 'Refurbished', 'For Parts'], group_name: 'Basic Info' },
    ],
  },
};

export function getCategoryFields(slug: string): CategoryFields | undefined {
  return CATEGORY_FIELDS[slug];
}

export function getCategoryFieldsBySubcategory(subcategorySlug: string): CategoryFields | undefined {
  const parentMap: Record<string, string> = {
    'cars': 'vehicles', 'motorcycles': 'vehicles', 'buses-vans': 'vehicles', 'trucks-trailers': 'vehicles',
    'smartphones': 'mobile-phones', 'tablets': 'mobile-phones', 'smartwatches': 'mobile-phones', 'phone-accessories': 'mobile-phones',
    'laptops': 'electronics', 'desktops': 'electronics', 'tvs': 'electronics', 'gaming': 'electronics',
    'apartments-rent': 'property', 'apartments-sale': 'property', 'houses-rent': 'property', 'houses-sale': 'property',
    'men-clothing': 'fashion', 'women-clothing': 'fashion', 'shoes': 'fashion', 'watches': 'fashion',
    'furniture': 'home-furniture', 'home-decor': 'home-furniture', 'kitchen-appliances': 'home-furniture', 'bedding': 'home-furniture',
    'full-time-jobs': 'jobs', 'part-time-jobs': 'jobs', 'remote-jobs': 'jobs', 'internship-jobs': 'jobs',
    'cleaning-services': 'services', 'repair-services': 'services', 'moving-services': 'services', 'event-planning': 'services',
    'dogs': 'pets', 'cats': 'pets', 'birds': 'pets', 'pet-food': 'pets',
    'skincare': 'health-beauty', 'haircare': 'health-beauty', 'makeup': 'health-beauty', 'fragrances': 'health-beauty',
    'baby-gear': 'baby-kids', 'kids-clothing': 'baby-kids', 'kids-toys': 'baby-kids', 'maternity': 'baby-kids',
    'fitness-gym': 'sports', 'camping-hiking': 'sports', 'cycling': 'sports', 'team-sports': 'sports',
    'books': 'books-music-movies', 'music': 'books-music-movies', 'movies-tv': 'books-music-movies',
    'groceries': 'food-drinks', 'beverages': 'food-drinks', 'snacks': 'food-drinks',
    'farm-equipment': 'agriculture', 'livestock': 'agriculture', 'crops-seeds': 'agriculture',
  };
  const parentSlug = parentMap[subcategorySlug];
  if (parentSlug) return CATEGORY_FIELDS[parentSlug];
  return undefined;
}
