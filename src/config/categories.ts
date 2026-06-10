export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
  imageSuggestion?: string;
  children: SubcategoryItem[];
}

export interface SubcategoryItem {
  id: number;
  name: string;
  slug: string;
  imageSuggestion?: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 1, name: 'Vehicles', slug: 'vehicles', icon: 'Car', imageSuggestion: 'cars',
    children: [
      { id: 101, name: 'Cars', slug: 'cars', imageSuggestion: 'cars' },
      { id: 102, name: 'Motorcycles', slug: 'motorcycles', imageSuggestion: 'motorcycles' },
      { id: 103, name: 'Buses & Vans', slug: 'buses-vans', imageSuggestion: 'buses' },
      { id: 104, name: 'Trucks & Trailers', slug: 'trucks-trailers', imageSuggestion: 'trucks' },
    ],
  },
  {
    id: 2, name: 'Property', slug: 'property', icon: 'Home', imageSuggestion: 'property',
    children: [
      { id: 201, name: 'Apartments for Rent', slug: 'apartments-rent', imageSuggestion: 'apartments' },
      { id: 202, name: 'Apartments for Sale', slug: 'apartments-sale', imageSuggestion: 'apartments' },
      { id: 203, name: 'Houses for Rent', slug: 'houses-rent', imageSuggestion: 'houses' },
      { id: 204, name: 'Houses for Sale', slug: 'houses-sale', imageSuggestion: 'houses' },
    ],
  },
  {
    id: 3, name: 'Mobile Phones & Tablets', slug: 'mobile-phones', icon: 'Smartphone', imageSuggestion: 'mobile-phones',
    children: [
      { id: 301, name: 'Smartphones', slug: 'smartphones', imageSuggestion: 'phones' },
      { id: 302, name: 'Tablets', slug: 'tablets', imageSuggestion: 'tablets' },
      { id: 303, name: 'Smartwatches', slug: 'smartwatches', imageSuggestion: 'watches' },
      { id: 304, name: 'Phone Accessories', slug: 'phone-accessories', imageSuggestion: 'accessories' },
    ],
  },
  {
    id: 4, name: 'Electronics', slug: 'electronics', icon: 'Monitor', imageSuggestion: 'electronics',
    children: [
      { id: 401, name: 'Laptops', slug: 'laptops', imageSuggestion: 'laptops' },
      { id: 402, name: 'Desktop Computers', slug: 'desktops', imageSuggestion: 'desktops' },
      { id: 403, name: 'Televisions', slug: 'tvs', imageSuggestion: 'tvs' },
      { id: 404, name: 'Gaming Consoles', slug: 'gaming', imageSuggestion: 'gaming' },
    ],
  },
  {
    id: 5, name: 'Fashion', slug: 'fashion', icon: 'Shirt', imageSuggestion: 'fashion',
    children: [
      { id: 501, name: 'Men\'s Clothing', slug: 'men-clothing', imageSuggestion: 'clothing' },
      { id: 502, name: 'Women\'s Clothing', slug: 'women-clothing', imageSuggestion: 'clothing' },
      { id: 503, name: 'Shoes', slug: 'shoes', imageSuggestion: 'shoes' },
      { id: 504, name: 'Watches', slug: 'watches', imageSuggestion: 'watches' },
    ],
  },
  {
    id: 6, name: 'Home, Furniture & Appliances', slug: 'home-furniture', icon: 'Sofa', imageSuggestion: 'furniture',
    children: [
      { id: 601, name: 'Furniture', slug: 'furniture', imageSuggestion: 'furniture' },
      { id: 602, name: 'Home Decor', slug: 'home-decor', imageSuggestion: 'decor' },
      { id: 603, name: 'Kitchen Appliances', slug: 'kitchen-appliances', imageSuggestion: 'appliances' },
      { id: 604, name: 'Bedding', slug: 'bedding', imageSuggestion: 'bedding' },
    ],
  },
  {
    id: 7, name: 'Jobs', slug: 'jobs', icon: 'Briefcase', imageSuggestion: 'jobs',
    children: [
      { id: 701, name: 'Full-time Jobs', slug: 'full-time-jobs', imageSuggestion: 'jobs' },
      { id: 702, name: 'Part-time Jobs', slug: 'part-time-jobs', imageSuggestion: 'jobs' },
      { id: 703, name: 'Remote Jobs', slug: 'remote-jobs', imageSuggestion: 'jobs' },
      { id: 704, name: 'Internships', slug: 'internship-jobs', imageSuggestion: 'jobs' },
    ],
  },
  {
    id: 8, name: 'Services', slug: 'services', icon: 'Wrench', imageSuggestion: 'services',
    children: [
      { id: 801, name: 'Cleaning Services', slug: 'cleaning-services', imageSuggestion: 'services' },
      { id: 802, name: 'Repair & Maintenance', slug: 'repair-services', imageSuggestion: 'services' },
      { id: 803, name: 'Moving & Logistics', slug: 'moving-services', imageSuggestion: 'services' },
      { id: 804, name: 'Event Services', slug: 'event-planning', imageSuggestion: 'services' },
    ],
  },
  {
    id: 9, name: 'Pets', slug: 'pets', icon: 'Dog', imageSuggestion: 'pets',
    children: [
      { id: 901, name: 'Dogs', slug: 'dogs', imageSuggestion: 'pets' },
      { id: 902, name: 'Cats', slug: 'cats', imageSuggestion: 'pets' },
      { id: 903, name: 'Birds', slug: 'birds', imageSuggestion: 'pets' },
      { id: 904, name: 'Pet Food', slug: 'pet-food', imageSuggestion: 'pets' },
    ],
  },
  {
    id: 10, name: 'Health & Beauty', slug: 'health-beauty', icon: 'Heart', imageSuggestion: 'beauty',
    children: [
      { id: 1001, name: 'Skincare', slug: 'skincare', imageSuggestion: 'beauty' },
      { id: 1002, name: 'Haircare', slug: 'haircare', imageSuggestion: 'beauty' },
      { id: 1003, name: 'Makeup', slug: 'makeup', imageSuggestion: 'beauty' },
      { id: 1004, name: 'Fragrances', slug: 'fragrances', imageSuggestion: 'beauty' },
    ],
  },
  {
    id: 11, name: 'Baby & Kids', slug: 'baby-kids', icon: 'Baby', imageSuggestion: 'baby',
    children: [
      { id: 1101, name: 'Baby Gear', slug: 'baby-gear', imageSuggestion: 'baby' },
      { id: 1102, name: 'Kids Clothing', slug: 'kids-clothing', imageSuggestion: 'baby' },
      { id: 1103, name: 'Toys & Games', slug: 'kids-toys', imageSuggestion: 'baby' },
      { id: 1104, name: 'Maternity', slug: 'maternity', imageSuggestion: 'baby' },
    ],
  },
  {
    id: 12, name: 'Sports & Outdoors', slug: 'sports', icon: 'Trophy', imageSuggestion: 'sports',
    children: [
      { id: 1201, name: 'Fitness & Gym', slug: 'fitness-gym', imageSuggestion: 'sports' },
      { id: 1202, name: 'Camping & Hiking', slug: 'camping-hiking', imageSuggestion: 'sports' },
      { id: 1203, name: 'Cycling', slug: 'cycling', imageSuggestion: 'sports' },
      { id: 1204, name: 'Team Sports', slug: 'team-sports', imageSuggestion: 'sports' },
    ],
  },
  {
    id: 13, name: 'Books & Media', slug: 'books-music-movies', icon: 'Book', imageSuggestion: 'books',
    children: [
      { id: 1301, name: 'Books', slug: 'books', imageSuggestion: 'books' },
      { id: 1302, name: 'Music', slug: 'music', imageSuggestion: 'books' },
      { id: 1303, name: 'Movies & TV', slug: 'movies-tv', imageSuggestion: 'books' },
    ],
  },
  {
    id: 14, name: 'Food & Drinks', slug: 'food-drinks', icon: 'Coffee', imageSuggestion: 'food',
    children: [
      { id: 1401, name: 'Groceries', slug: 'groceries', imageSuggestion: 'food' },
      { id: 1402, name: 'Beverages', slug: 'beverages', imageSuggestion: 'food' },
      { id: 1403, name: 'Snacks', slug: 'snacks', imageSuggestion: 'food' },
    ],
  },
  {
    id: 15, name: 'Agriculture & Farming', slug: 'agriculture', icon: 'Sprout', imageSuggestion: 'agriculture',
    children: [
      { id: 1501, name: 'Farm Equipment', slug: 'farm-equipment', imageSuggestion: 'agriculture' },
      { id: 1502, name: 'Livestock', slug: 'livestock', imageSuggestion: 'agriculture' },
      { id: 1503, name: 'Crops & Seeds', slug: 'crops-seeds', imageSuggestion: 'agriculture' },
    ],
  },
];
