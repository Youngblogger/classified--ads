export interface SpecField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean';
  options?: string[];
  is_required?: boolean;
  group_name?: string;
}

export interface CategorySpec {
  category: string;
  hasBrand?: boolean;
  fields: SpecField[];
}

export const CATEGORY_SPECS: Record<string, CategorySpec> = {
  'Vehicles': {
    category: 'Vehicles',
    hasBrand: true,
    fields: [
      { name: 'year', label: 'Year', type: 'select', options: ['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013','2012','2011','2010','2009','2008','2007','2006','2005','2004','2003','2002','2001','2000','1999','1998','1997','1996','1995','1994','1993','1992','1991','1990','1989','1988','1987','1986','1985','1984','1983','1982','1981','1980','1979','1978','1977','1976','1975','1974','1973','1972','1971','1970'], group_name: 'Basic Info' },
      { name: 'mileage', label: 'Mileage', type: 'number', group_name: 'Basic Info' },
      { name: 'transmission', label: 'Transmission', type: 'select', options: ['Automatic', 'Manual', 'Semi-Automatic', 'CVT', 'Dual-Clutch'], group_name: 'Specifications' },
      { name: 'fuel_type', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Hydrogen', 'LPG', 'CNG'], group_name: 'Specifications' },
      { name: 'engine_capacity', label: 'Engine Capacity', type: 'select', options: ['1.0L & below', '1.2L', '1.3L', '1.4L', '1.5L', '1.6L', '1.8L', '2.0L', '2.2L', '2.4L', '2.5L', '2.8L', '3.0L', '3.2L', '3.5L', '4.0L', '4.5L', '5.0L', '5.7L', '6.0L', '6.2L', 'Electric'], group_name: 'Specifications' },
      { name: 'drive_type', label: 'Drive Type', type: 'select', options: ['FWD', 'RWD', 'AWD', '4WD'], group_name: 'Specifications' },
      { name: 'body_type', label: 'Body Type', type: 'select', options: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Wagon'], group_name: 'Basic Info' },
      { name: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Gold', 'Brown', 'Beige', 'Burgundy', 'Orange', 'Yellow', 'Purple', 'Pink', 'Bronze', 'Navy', 'Teal', 'Maroon', 'Champagne', 'Other'], group_name: 'Appearance' },
      { name: 'interior_color', label: 'Interior Color', type: 'select', options: ['Black', 'Beige', 'Grey', 'Brown', 'Cream', 'Tan', 'White', 'Red', 'Blue', 'Burgundy', 'Charcoal', 'Ivory', 'Two Tone', 'Other'], group_name: 'Appearance' },
    ],
  },
  'Mobile Phones': {
    category: 'Mobile Phones',
    hasBrand: true,
    fields: [
      { name: 'storage', label: 'Storage', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'], group_name: 'Specifications' },
      { name: 'ram', label: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '24GB'], group_name: 'Specifications' },
      { name: 'screen_size', label: 'Screen Size', type: 'select', options: ['4.0"', '4.5"', '4.7"', '5.0"', '5.5"', '5.8"', '6.0"', '6.1"', '6.2"', '6.3"', '6.4"', '6.5"', '6.6"', '6.7"', '6.8"', '6.9"', '7.0"', '7.6"'], group_name: 'Display' },
      { name: 'battery_capacity', label: 'Battery Capacity', type: 'select', options: ['2000mAh', '2500mAh', '3000mAh', '3500mAh', '4000mAh', '4500mAh', '5000mAh', '5500mAh', '6000mAh', '7000mAh', '8000mAh', '10000mAh'], group_name: 'Battery' },
      { name: 'processor', label: 'Processor', type: 'select', options: ['MediaTek Helio', 'MediaTek Dimensity', 'Qualcomm Snapdragon 4 Gen', 'Qualcomm Snapdragon 6 Gen', 'Qualcomm Snapdragon 7 Gen', 'Qualcomm Snapdragon 8 Gen', 'Qualcomm Snapdragon 8 Elite', 'Apple A15 Bionic', 'Apple A16 Bionic', 'Apple A17 Pro', 'Apple A18', 'Apple A18 Pro', 'Samsung Exynos', 'Google Tensor', 'Google Tensor G2', 'Google Tensor G3', 'Google Tensor G4', 'Unisoc', 'Kirin', 'Other'], group_name: 'Specifications' },
      { name: 'operating_system', label: 'Operating System', type: 'select', options: ['iOS', 'Android', 'HarmonyOS', 'Other'], group_name: 'Specifications' },
      { name: 'camera_megapixels', label: 'Camera', type: 'select', options: ['5MP', '8MP', '12MP', '13MP', '16MP', '20MP', '24MP', '32MP', '48MP', '50MP', '64MP', '100MP', '108MP', '200MP'], group_name: 'Camera' },
      { name: 'connectivity', label: 'Connectivity', type: 'multi_select', options: ['4G', '5G', 'WiFi', 'Bluetooth', 'NFC', 'GPS'], group_name: 'Connectivity' },
      { name: 'sim_type', label: 'SIM Type', type: 'select', options: ['Single SIM', 'Dual SIM', 'eSIM', 'Dual + eSIM'], group_name: 'Connectivity' },
    ],
  },
  'Tablets': {
    category: 'Tablets',
    hasBrand: true,
    fields: [
      { name: 'storage', label: 'Storage', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], group_name: 'Specifications' },
      { name: 'ram', label: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], group_name: 'Specifications' },
      { name: 'screen_size', label: 'Screen Size', type: 'select', options: ['7.0"', '8.0"', '8.3"', '8.4"', '8.7"', '9.7"', '10.1"', '10.2"', '10.4"', '10.5"', '10.9"', '11.0"', '12.4"', '12.9"', '14.6"'], group_name: 'Display' },
      { name: 'battery_capacity', label: 'Battery Capacity', type: 'select', options: ['3000mAh', '4000mAh', '5000mAh', '6000mAh', '7000mAh', '8000mAh', '9000mAh', '10000mAh', '12000mAh'], group_name: 'Battery' },
      { name: 'cellular', label: 'Cellular', type: 'select', options: ['Wi-Fi Only', 'Cellular + Wi-Fi'], group_name: 'Connectivity' },
    ],
  },
  'Laptops & Computers': {
    category: 'Laptops & Computers',
    hasBrand: true,
    fields: [
      { name: 'storage', label: 'Storage', type: 'select', options: ['128GB', '256GB', '320GB', '500GB', '512GB', '750GB', '1TB', '1.5TB', '2TB', '3TB', '4TB', '8TB'], group_name: 'Specifications' },
      { name: 'ram', label: 'RAM', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'], group_name: 'Specifications' },
      { name: 'processor', label: 'Processor', type: 'select', options: ['Intel Celeron', 'Intel Pentium', 'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'AMD Athlon', 'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4', 'Apple M1 Pro', 'Apple M2 Pro', 'Apple M3 Pro', 'Apple M1 Max', 'Apple M2 Max', 'Apple M3 Max'], group_name: 'Specifications' },
      { name: 'operating_system', label: 'Operating System', type: 'select', options: ['Windows 11', 'Windows 10', 'macOS Sonoma', 'macOS Ventura', 'macOS Monterey', 'ChromeOS', 'Linux', 'Ubuntu', 'Fedora'], group_name: 'Specifications' },
      { name: 'screen_size', label: 'Screen Size', type: 'select', options: ['11.6"', '12.3"', '13.3"', '13.4"', '13.6"', '14.0"', '14.2"', '14.5"', '15.0"', '15.4"', '15.6"', '16.0"', '16.1"', '16.2"', '17.0"', '17.3"', '18.0"'], group_name: 'Display' },
    ],
  },
  'Property': {
    category: 'Property',
    fields: [
      { name: 'property_type', label: 'Property Type', type: 'select', options: ['House', 'Apartment/Flat', 'Land', 'Commercial Property', 'Office Space', 'Shop', 'Warehouse', 'Industrial Property', 'Hotel/Guest House', 'Event Center', 'Farm House', 'Townhouse', 'Duplex', 'Bungalow', 'Penthouse', 'Self Contain', 'Room & Parlour', 'Mini Flat', 'Studio Apartment'], group_name: 'Property Details' },
      { name: 'bedrooms', label: 'Bedrooms', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'], group_name: 'Property Details' },
      { name: 'bathrooms', label: 'Bathrooms', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'], group_name: 'Property Details' },
      { name: 'furnishing', label: 'Furnishing', type: 'select', options: ['Furnished', 'Partly Furnished', 'Unfurnished'], group_name: 'Property Details' },
      { name: 'status', label: 'Status', type: 'select', options: ['For Rent', 'For Sale', 'For Lease', 'Short Let', 'Swap/Trade'], group_name: 'Property Details' },
    ],
  },
  'Jobs': {
    category: 'Jobs',
    fields: [
      { name: 'job_type', label: 'Job Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Remote', 'Temporary', 'Volunteer'], group_name: 'Job Details' },
      { name: 'experience_level', label: 'Experience Level', type: 'select', options: ['Entry Level', '1-2 Years', '3-5 Years', '6-10 Years', '10+ Years'], group_name: 'Job Details' },
      { name: 'education_level', label: 'Education Level', type: 'select', options: ['SSCE', 'OND', 'HND', 'Bachelors Degree', 'Masters Degree', 'PhD', 'Professional Certification'], group_name: 'Job Details' },
      { name: 'salary_range', label: 'Salary Range', type: 'select', options: ['₦0 - ₦50,000', '₦50,000 - ₦100,000', '₦100,000 - ₦250,000', '₦250,000 - ₦500,000', '₦500,000 - ₦1,000,000', '₦1,000,000 - ₦2,500,000', '₦2,500,000 - ₦5,000,000', '₦5,000,000+'], group_name: 'Pricing' },
    ],
  },
  'Services': {
    category: 'Services',
    fields: [
      { name: 'service_type', label: 'Service Type', type: 'select', options: ['Automotive', 'Building & Trade', 'Cleaning', 'Computers & IT', 'Design & Art', 'Education & Classes', 'Events & Catering', 'Gardening & Landscaping', 'Health & Beauty', 'Home Improvement', 'Legal Services', 'Music & Audio', 'Photography & Video', 'Repair & Construction', 'Translation & Writing', 'Other Services'], group_name: 'Service Details' },
      { name: 'service_level', label: 'Service Level', type: 'select', options: ['Basic', 'Standard', 'Premium', 'Luxury', 'Enterprise'], group_name: 'Service Details' },
    ],
  },
  'Fashion': {
    category: 'Fashion',
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: ["Men's Clothing", "Women's Clothing", "Children's Clothing", 'Shoes', 'Bags & Luggage', 'Watches', 'Jewelry', 'Accessories', 'Sportswear', 'Traditional Wear', 'Wedding Wear', 'Uniforms', 'Vintage Clothing'], group_name: 'Apparel' },
      { name: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Custom Size'], group_name: 'Apparel' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Men', 'Women', 'Unisex', 'Boys', 'Girls', 'Kids'], group_name: 'Apparel' },
    ],
  },
  'Pets & Animals': {
    category: 'Pets & Animals',
    fields: [
      { name: 'pet_type', label: 'Pet Type', type: 'select', options: ['Dogs', 'Cats', 'Birds', 'Fish', 'Reptiles', 'Rabbits', 'Hamsters', 'Guinea Pigs', 'Horses', 'Livestock', 'Exotic Pets', 'Other Pets'], group_name: 'Pet Info' },
      { name: 'breed', label: 'Breed', type: 'select', options: ['Purebred', 'Crossbred', 'Mixed', 'Designer'], group_name: 'Pet Info' },
      { name: 'age', label: 'Age', type: 'select', options: ['Puppy/Kitten', 'Young', 'Adult', 'Senior'], group_name: 'Pet Info' },
    ],
  },
  'Health & Beauty': {
    category: 'Health & Beauty',
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: ['Skincare', 'Haircare', 'Makeup', 'Fragrances', 'Nail Care', 'Bath & Body', 'Vitamins & Supplements', 'Medical Supplies', 'Fitness Equipment', 'Hair Extensions & Wigs', 'Beauty Tools', 'Sexual Wellness'], group_name: 'Product Type' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Women', 'Men', 'Unisex', 'Kids'], group_name: 'Product Type' },
    ],
  },
  'Baby & Kids': {
    category: 'Baby & Kids',
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: ['Diapers & Wipes', 'Baby Food', 'Formula & Milk', 'Strollers', 'Car Seats', 'Cribs & Furniture', 'Baby Carriers', 'Toys & Games', 'Books & Media', 'Clothing', 'Feeding Supplies', 'Safety & Health', 'Bathing & Grooming'], group_name: 'Product Type' },
      { name: 'age_group', label: 'Age Group', type: 'select', options: ['Newborn (0-3 months)', 'Infant (3-12 months)', 'Toddler (1-3 years)', 'Preschool (3-5 years)', 'School Age (5-12 years)', 'Teen'], group_name: 'Product Type' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Boys', 'Girls', 'Unisex'], group_name: 'Product Type' },
    ],
  },
  'Sports & Outdoors': {
    category: 'Sports & Outdoors',
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: ['Team Sports', 'Fitness & Gym', 'Cycling', 'Running', 'Swimming', 'Camping & Hiking', 'Fishing', 'Hunting', 'Golf', 'Tennis', 'Badminton', 'Basketball', 'Football', 'Soccer', 'Volleyball', 'Baseball', 'Boxing & MMA', 'Yoga & Pilates', 'Water Sports', 'Winter Sports', 'Outdoor Recreation'], group_name: 'Product Type' },
      { name: 'condition', label: 'Condition', type: 'select', options: ['New', 'Like New', 'Good', 'Fair'], group_name: 'Product Type' },
      { name: 'used_for', label: 'Used For', type: 'select', options: ['Professional', 'Recreational', 'Beginner', 'Kids'], group_name: 'Product Type' },
    ],
  },
};

export function getCategorySpec(categoryName: string): CategorySpec | undefined {
  const key = categoryName.toLowerCase().trim();
  for (const [catName, spec] of Object.entries(CATEGORY_SPECS)) {
    if (catName.toLowerCase() === key) return spec;
    if (key.includes(catName.toLowerCase())) return spec;
    if (catName.toLowerCase().includes(key)) return spec;
  }
  return undefined;
}
