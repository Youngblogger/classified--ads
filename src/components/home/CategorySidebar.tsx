'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, ChevronRight, Menu, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/config';
import useSWR from 'swr';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parent_id?: number;
  ad_count?: number;
  children?: Category[];
}

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(r => Array.isArray(r) ? r : r.data || []);

const CAT_IDS = { m: 0 }; let ci = 101; function nx() { const id = ci; ci++; return id; }
const fallbackCategories: Category[] = [
  { id: 1, name: 'Vehicles', slug: 'vehicles', ad_count: 3200, children: [
    { id: nx(), name: 'Cars', slug: 'cars', parent_id: 1, ad_count: 1500, children: [
      { id: nx(), name: 'Toyota', slug: 'toyota', parent_id: 1 },
      { id: nx(), name: 'Honda', slug: 'honda', parent_id: 1 },
      { id: nx(), name: 'Lexus', slug: 'lexus', parent_id: 1 },
      { id: nx(), name: 'Mercedes-Benz', slug: 'mercedes-benz', parent_id: 1 },
      { id: nx(), name: 'BMW', slug: 'bmw', parent_id: 1 },
      { id: nx(), name: 'Hyundai', slug: 'hyundai', parent_id: 1 },
      { id: nx(), name: 'Kia', slug: 'kia', parent_id: 1 },
      { id: nx(), name: 'Nissan', slug: 'nissan', parent_id: 1 },
      { id: nx(), name: 'Ford', slug: 'ford', parent_id: 1 },
      { id: nx(), name: 'Chevrolet', slug: 'chevrolet', parent_id: 1 },
      { id: nx(), name: 'Volkswagen', slug: 'volkswagen', parent_id: 1 },
      { id: nx(), name: 'Audi', slug: 'audi', parent_id: 1 },
      { id: nx(), name: 'Porsche', slug: 'porsche', parent_id: 1 },
      { id: nx(), name: 'Tesla', slug: 'tesla', parent_id: 1 },
      { id: nx(), name: 'Mazda', slug: 'mazda', parent_id: 1 },
      { id: nx(), name: 'Subaru', slug: 'subaru', parent_id: 1 },
      { id: nx(), name: 'Jeep', slug: 'jeep', parent_id: 1 },
      { id: nx(), name: 'Land Rover', slug: 'land-rover', parent_id: 1 },
      { id: nx(), name: 'Peugeot', slug: 'peugeot', parent_id: 1 },
      { id: nx(), name: 'Other Brands', slug: 'other-car-brands', parent_id: 1 },
    ]},
    { id: nx(), name: 'SUVs', slug: 'suvs', parent_id: 1, ad_count: 320 },
    { id: nx(), name: 'Sedans', slug: 'sedans', parent_id: 1, ad_count: 280 },
    { id: nx(), name: 'Hatchbacks', slug: 'hatchbacks', parent_id: 1, ad_count: 180 },
    { id: nx(), name: 'Coupes', slug: 'coupes', parent_id: 1, ad_count: 60 },
    { id: nx(), name: 'Convertibles', slug: 'convertibles', parent_id: 1, ad_count: 40 },
    { id: nx(), name: 'Pick-Up Trucks', slug: 'pickup-trucks', parent_id: 1, ad_count: 120 },
    { id: nx(), name: 'Trucks & Trailers', slug: 'trucks-trailers', parent_id: 1, ad_count: 180 },
    { id: nx(), name: 'Buses', slug: 'buses', parent_id: 1, ad_count: 50 },
    { id: nx(), name: 'Vans', slug: 'vans', parent_id: 1, ad_count: 70 },
    { id: nx(), name: 'Motorcycles', slug: 'motorcycles', parent_id: 1, ad_count: 450 },
    { id: nx(), name: 'Scooters', slug: 'scooters', parent_id: 1, ad_count: 90 },
    { id: nx(), name: 'Tricycles', slug: 'tricycles', parent_id: 1, ad_count: 60 },
    { id: nx(), name: 'Heavy Equipment', slug: 'heavy-equipment', parent_id: 1, ad_count: 100 },
    { id: nx(), name: 'Forklifts', slug: 'forklifts', parent_id: 1, ad_count: 35 },
    { id: nx(), name: 'Tractors', slug: 'tractors', parent_id: 1, ad_count: 45 },
    { id: nx(), name: 'Vehicle Parts', slug: 'vehicle-parts', parent_id: 1, ad_count: 320 },
    { id: nx(), name: 'Vehicle Accessories', slug: 'vehicle-accessories', parent_id: 1, ad_count: 250 },
    { id: nx(), name: 'Tires & Rims', slug: 'tires-rims', parent_id: 1, ad_count: 160 },
    { id: nx(), name: 'Watercraft & Boats', slug: 'watercraft-boats', parent_id: 1, ad_count: 90 },
    { id: nx(), name: 'Auto Repair Services', slug: 'auto-repair', parent_id: 1, ad_count: 110 },
    { id: nx(), name: 'Car Rentals', slug: 'car-rentals', parent_id: 1, ad_count: 75 },
  ]},
  { id: 2, name: 'Mobile Phones & Tablets', slug: 'mobile-phones', ad_count: 3500, children: [
    { id: nx(), name: 'Smartphones', slug: 'smartphones', parent_id: 2, ad_count: 2200 },
    { id: nx(), name: 'Android Phones', slug: 'android-phones', parent_id: 2, ad_count: 1200 },
    { id: nx(), name: 'iPhones', slug: 'iphones', parent_id: 2, ad_count: 800 },
    { id: nx(), name: 'Tablets', slug: 'tablets', parent_id: 2, ad_count: 450 },
    { id: nx(), name: 'iPads', slug: 'ipads', parent_id: 2, ad_count: 280 },
    { id: nx(), name: 'Smartwatches', slug: 'smartwatches', parent_id: 2, ad_count: 200 },
    { id: nx(), name: 'Phone Accessories', slug: 'phone-accessories', parent_id: 2, ad_count: 600 },
    { id: nx(), name: 'Chargers', slug: 'chargers', parent_id: 2, ad_count: 180 },
    { id: nx(), name: 'USB Cables', slug: 'usb-cables', parent_id: 2, ad_count: 140 },
    { id: nx(), name: 'Earbuds', slug: 'earbuds', parent_id: 2, ad_count: 220 },
    { id: nx(), name: 'Bluetooth Speakers', slug: 'bluetooth-speakers', parent_id: 2, ad_count: 150 },
    { id: nx(), name: 'Power Banks', slug: 'power-banks', parent_id: 2, ad_count: 170 },
    { id: nx(), name: 'Phone Cases', slug: 'phone-cases', parent_id: 2, ad_count: 190 },
    { id: nx(), name: 'Screen Protectors', slug: 'screen-protectors', parent_id: 2, ad_count: 110 },
    { id: nx(), name: 'Phone Parts', slug: 'phone-parts', parent_id: 2, ad_count: 90 },
    { id: nx(), name: 'Batteries', slug: 'phone-batteries', parent_id: 2, ad_count: 80 },
    { id: nx(), name: 'SIM Devices', slug: 'sim-devices', parent_id: 2, ad_count: 120 },
    { id: nx(), name: 'Gaming Phones', slug: 'gaming-phones', parent_id: 2, ad_count: 60 },
    { id: nx(), name: 'Foldable Phones', slug: 'foldable-phones', parent_id: 2, ad_count: 35 },
    { id: nx(), name: 'Mobile Routers', slug: 'mobile-routers', parent_id: 2, ad_count: 40 },
  ]},
  { id: 3, name: 'Electronics', slug: 'electronics', ad_count: 2400, children: [
    { id: nx(), name: 'TVs', slug: 'tvs', parent_id: 3, ad_count: 400 },
    { id: nx(), name: 'Smart TVs', slug: 'smart-tvs', parent_id: 3, ad_count: 300 },
    { id: nx(), name: 'Home Audio', slug: 'home-audio', parent_id: 3, ad_count: 180 },
    { id: nx(), name: 'Speakers', slug: 'speakers', parent_id: 3, ad_count: 220 },
    { id: nx(), name: 'Headphones', slug: 'headphones', parent_id: 3, ad_count: 200 },
    { id: nx(), name: 'Computers', slug: 'computers', parent_id: 3, ad_count: 350 },
    { id: nx(), name: 'Laptops', slug: 'laptops', parent_id: 3, ad_count: 700 },
    { id: nx(), name: 'Desktop Computers', slug: 'desktops', parent_id: 3, ad_count: 250 },
    { id: nx(), name: 'Monitors', slug: 'monitors', parent_id: 3, ad_count: 150 },
    { id: nx(), name: 'Printers', slug: 'printers', parent_id: 3, ad_count: 100 },
    { id: nx(), name: 'Scanners', slug: 'scanners', parent_id: 3, ad_count: 40 },
    { id: nx(), name: 'Networking Devices', slug: 'networking-devices', parent_id: 3, ad_count: 80 },
    { id: nx(), name: 'Routers', slug: 'routers', parent_id: 3, ad_count: 110 },
    { id: nx(), name: 'CCTV Cameras', slug: 'cctv-cameras', parent_id: 3, ad_count: 130 },
    { id: nx(), name: 'Security Systems', slug: 'security-systems', parent_id: 3, ad_count: 90 },
    { id: nx(), name: 'Projectors', slug: 'projectors', parent_id: 3, ad_count: 60 },
    { id: nx(), name: 'Gaming Consoles', slug: 'gaming-consoles', parent_id: 3, ad_count: 300 },
    { id: nx(), name: 'Drones', slug: 'drones', parent_id: 3, ad_count: 70 },
    { id: nx(), name: 'Cameras', slug: 'cameras', parent_id: 3, ad_count: 250 },
    { id: nx(), name: 'Photography Equipment', slug: 'photography-equipment', parent_id: 3, ad_count: 140 },
    { id: nx(), name: 'Smart Home Devices', slug: 'smart-home', parent_id: 3, ad_count: 120 },
    { id: nx(), name: 'Electronic Accessories', slug: 'electronic-accessories', parent_id: 3, ad_count: 200 },
  ]},
  { id: 4, name: 'Baby & Kids', slug: 'baby-kids', ad_count: 600, children: [
    { id: nx(), name: 'Baby Clothing', slug: 'baby-clothing', parent_id: 4, ad_count: 120 },
    { id: nx(), name: 'Kids Clothing', slug: 'kids-clothing', parent_id: 4, ad_count: 180 },
    { id: nx(), name: 'Baby Shoes', slug: 'baby-shoes', parent_id: 4, ad_count: 60 },
    { id: nx(), name: 'Kids Shoes', slug: 'kids-shoes', parent_id: 4, ad_count: 90 },
    { id: nx(), name: 'Toys', slug: 'toys', parent_id: 4, ad_count: 250 },
    { id: nx(), name: 'Educational Toys', slug: 'educational-toys', parent_id: 4, ad_count: 100 },
    { id: nx(), name: 'Baby Gear', slug: 'baby-gear', parent_id: 4, ad_count: 150 },
    { id: nx(), name: 'Strollers', slug: 'strollers', parent_id: 4, ad_count: 80 },
    { id: nx(), name: 'Car Seats', slug: 'car-seats', parent_id: 4, ad_count: 60 },
    { id: nx(), name: 'Baby Feeding', slug: 'baby-feeding', parent_id: 4, ad_count: 70 },
    { id: nx(), name: 'Baby Bathing', slug: 'baby-bathing', parent_id: 4, ad_count: 50 },
    { id: nx(), name: 'Diapers', slug: 'diapers', parent_id: 4, ad_count: 110 },
    { id: nx(), name: 'School Supplies', slug: 'school-supplies', parent_id: 4, ad_count: 80 },
    { id: nx(), name: 'Baby Furniture', slug: 'baby-furniture', parent_id: 4, ad_count: 90 },
    { id: nx(), name: 'Baby Safety', slug: 'baby-safety', parent_id: 4, ad_count: 40 },
    { id: nx(), name: 'Maternity Products', slug: 'maternity', parent_id: 4, ad_count: 70 },
    { id: nx(), name: 'Kids Bags', slug: 'kids-bags', parent_id: 4, ad_count: 50 },
    { id: nx(), name: 'Baby Carriers', slug: 'baby-carriers', parent_id: 4, ad_count: 45 },
    { id: nx(), name: 'Baby Walkers', slug: 'baby-walkers', parent_id: 4, ad_count: 35 },
    { id: nx(), name: 'Kids Accessories', slug: 'kids-accessories', parent_id: 4, ad_count: 60 },
  ]},
  { id: 5, name: 'Fashion', slug: 'fashion', ad_count: 1900, children: [
    { id: nx(), name: "Men's Clothing", slug: 'men-clothing', parent_id: 5, ad_count: 500 },
    { id: nx(), name: "Women's Clothing", slug: 'women-clothing', parent_id: 5, ad_count: 700 },
    { id: nx(), name: 'Unisex Clothing', slug: 'unisex-clothing', parent_id: 5, ad_count: 200 },
    { id: nx(), name: 'Native Wear', slug: 'native-wear', parent_id: 5, ad_count: 180 },
    { id: nx(), name: 'Corporate Wear', slug: 'corporate-wear', parent_id: 5, ad_count: 120 },
    { id: nx(), name: 'Shoes', slug: 'shoes', parent_id: 5, ad_count: 400 },
    { id: nx(), name: 'Sneakers', slug: 'sneakers', parent_id: 5, ad_count: 250 },
    { id: nx(), name: 'Sandals', slug: 'sandals', parent_id: 5, ad_count: 100 },
    { id: nx(), name: 'Bags', slug: 'bags', parent_id: 5, ad_count: 200 },
    { id: nx(), name: 'Watches', slug: 'watches', parent_id: 5, ad_count: 150 },
    { id: nx(), name: 'Jewelry', slug: 'jewelry', parent_id: 5, ad_count: 120 },
    { id: nx(), name: 'Wedding Wear', slug: 'wedding-wear', parent_id: 5, ad_count: 80 },
    { id: nx(), name: 'Fashion Accessories', slug: 'fashion-accessories', parent_id: 5, ad_count: 150 },
    { id: nx(), name: 'Caps & Hats', slug: 'caps-hats', parent_id: 5, ad_count: 60 },
    { id: nx(), name: 'Belts', slug: 'belts', parent_id: 5, ad_count: 50 },
    { id: nx(), name: 'Sunglasses', slug: 'sunglasses', parent_id: 5, ad_count: 80 },
    { id: nx(), name: 'Underwear', slug: 'underwear', parent_id: 5, ad_count: 100 },
    { id: nx(), name: 'Sleepwear', slug: 'sleepwear', parent_id: 5, ad_count: 70 },
    { id: nx(), name: 'Sportswear', slug: 'sportswear', parent_id: 5, ad_count: 130 },
    { id: nx(), name: 'Luxury Fashion', slug: 'luxury-fashion', parent_id: 5, ad_count: 40 },
  ]},
  { id: 6, name: 'Home, Furniture & Appliances', slug: 'home-furniture', ad_count: 1100, children: [
    { id: nx(), name: 'Furniture', slug: 'furniture', parent_id: 6, ad_count: 350 },
    { id: nx(), name: 'Home Decor', slug: 'home-decor', parent_id: 6, ad_count: 150 },
    { id: nx(), name: 'Kitchen Appliances', slug: 'kitchen-appliances', parent_id: 6, ad_count: 200 },
    { id: nx(), name: 'Large Appliances', slug: 'large-appliances', parent_id: 6, ad_count: 180 },
    { id: nx(), name: 'Small Appliances', slug: 'small-appliances', parent_id: 6, ad_count: 140 },
    { id: nx(), name: 'Bedding', slug: 'bedding', parent_id: 6, ad_count: 120 },
    { id: nx(), name: 'Lighting', slug: 'lighting', parent_id: 6, ad_count: 100 },
    { id: nx(), name: 'Home Accessories', slug: 'home-accessories', parent_id: 6, ad_count: 90 },
    { id: nx(), name: 'Cookware', slug: 'cookware', parent_id: 6, ad_count: 110 },
    { id: nx(), name: 'Dining & Glassware', slug: 'dining-glassware', parent_id: 6, ad_count: 80 },
    { id: nx(), name: 'Storage & Organization', slug: 'storage-organization', parent_id: 6, ad_count: 100 },
    { id: nx(), name: 'Home Improvement', slug: 'home-improvement', parent_id: 6, ad_count: 130 },
    { id: nx(), name: 'Gardening Tools', slug: 'gardening-tools', parent_id: 6, ad_count: 70 },
    { id: nx(), name: 'DIY Materials', slug: 'diy-materials', parent_id: 6, ad_count: 60 },
    { id: nx(), name: 'Cleaning Equipment', slug: 'cleaning-equipment', parent_id: 6, ad_count: 90 },
    { id: nx(), name: 'Curtains & Blinds', slug: 'curtains-blinds', parent_id: 6, ad_count: 50 },
  ]},
  { id: 7, name: 'Health & Beauty', slug: 'health-beauty', ad_count: 700, children: [
    { id: nx(), name: 'Skincare', slug: 'skincare', parent_id: 7, ad_count: 180 },
    { id: nx(), name: 'Face Care', slug: 'face-care', parent_id: 7, ad_count: 120 },
    { id: nx(), name: 'Body Care', slug: 'body-care', parent_id: 7, ad_count: 100 },
    { id: nx(), name: 'Makeup', slug: 'makeup', parent_id: 7, ad_count: 200 },
    { id: nx(), name: 'Hair Products', slug: 'haircare', parent_id: 7, ad_count: 150 },
    { id: nx(), name: 'Hair Extensions', slug: 'hair-extensions', parent_id: 7, ad_count: 80 },
    { id: nx(), name: 'Fragrances', slug: 'fragrances', parent_id: 7, ad_count: 100 },
    { id: nx(), name: 'Oral Care', slug: 'oral-care', parent_id: 7, ad_count: 50 },
    { id: nx(), name: 'Personal Care', slug: 'personal-care', parent_id: 7, ad_count: 120 },
    { id: nx(), name: 'Beauty Tools', slug: 'beauty-tools', parent_id: 7, ad_count: 70 },
    { id: nx(), name: 'Salon Equipment', slug: 'salon-equipment', parent_id: 7, ad_count: 60 },
    { id: nx(), name: 'Spa Equipment', slug: 'spa-equipment', parent_id: 7, ad_count: 45 },
    { id: nx(), name: 'Vitamins', slug: 'vitamins', parent_id: 7, ad_count: 90 },
    { id: nx(), name: 'Supplements', slug: 'supplements', parent_id: 7, ad_count: 110 },
    { id: nx(), name: 'Weight Management', slug: 'weight-management', parent_id: 7, ad_count: 60 },
    { id: nx(), name: 'Feminine Care', slug: 'feminine-care', parent_id: 7, ad_count: 70 },
    { id: nx(), name: 'Grooming Tools', slug: 'grooming-tools', parent_id: 7, ad_count: 65 },
    { id: nx(), name: 'Medical Beauty Devices', slug: 'medical-beauty-devices', parent_id: 7, ad_count: 30 },
    { id: nx(), name: 'Organic Beauty', slug: 'organic-beauty', parent_id: 7, ad_count: 55 },
    { id: nx(), name: 'Wellness Products', slug: 'wellness-products', parent_id: 7, ad_count: 40 },
  ]},
  { id: 8, name: 'Jobs', slug: 'jobs', ad_count: 950, children: [
    { id: nx(), name: 'Technology Jobs', slug: 'tech-jobs', parent_id: 8, ad_count: 200 },
    { id: nx(), name: 'Driver Jobs', slug: 'driver-jobs', parent_id: 8, ad_count: 120 },
    { id: nx(), name: 'Office Jobs', slug: 'office-jobs', parent_id: 8, ad_count: 150 },
    { id: nx(), name: 'Hotel Jobs', slug: 'hotel-jobs', parent_id: 8, ad_count: 80 },
    { id: nx(), name: 'Construction Jobs', slug: 'construction-jobs', parent_id: 8, ad_count: 100 },
    { id: nx(), name: 'Healthcare Jobs', slug: 'healthcare-jobs', parent_id: 8, ad_count: 90 },
    { id: nx(), name: 'Security Jobs', slug: 'security-jobs', parent_id: 8, ad_count: 60 },
    { id: nx(), name: 'Sales Jobs', slug: 'sales-jobs', parent_id: 8, ad_count: 130 },
    { id: nx(), name: 'Marketing Jobs', slug: 'marketing-jobs', parent_id: 8, ad_count: 110 },
    { id: nx(), name: 'Customer Service Jobs', slug: 'customer-service-jobs', parent_id: 8, ad_count: 95 },
    { id: nx(), name: 'Engineering Jobs', slug: 'engineering-jobs', parent_id: 8, ad_count: 85 },
    { id: nx(), name: 'Remote Jobs', slug: 'remote-jobs', parent_id: 8, ad_count: 140 },
    { id: nx(), name: 'Part-Time Jobs', slug: 'part-time-jobs', parent_id: 8, ad_count: 160 },
    { id: nx(), name: 'Internship Jobs', slug: 'internship-jobs', parent_id: 8, ad_count: 70 },
    { id: nx(), name: 'Freelance Jobs', slug: 'freelance-jobs', parent_id: 8, ad_count: 90 },
    { id: nx(), name: 'Teaching Jobs', slug: 'teaching-jobs', parent_id: 8, ad_count: 80 },
    { id: nx(), name: 'Factory Jobs', slug: 'factory-jobs', parent_id: 8, ad_count: 75 },
    { id: nx(), name: 'Logistics Jobs', slug: 'logistics-jobs', parent_id: 8, ad_count: 65 },
    { id: nx(), name: 'Finance Jobs', slug: 'finance-jobs', parent_id: 8, ad_count: 70 },
    { id: nx(), name: 'Human Resources Jobs', slug: 'hr-jobs', parent_id: 8, ad_count: 55 },
  ]},
  { id: 9, name: 'Pets', slug: 'pets', ad_count: 400, children: [
    { id: nx(), name: 'Dogs', slug: 'dogs', parent_id: 9, ad_count: 120 },
    { id: nx(), name: 'Puppies', slug: 'puppies', parent_id: 9, ad_count: 80 },
    { id: nx(), name: 'Cats', slug: 'cats', parent_id: 9, ad_count: 90 },
    { id: nx(), name: 'Kittens', slug: 'kittens', parent_id: 9, ad_count: 50 },
    { id: nx(), name: 'Birds', slug: 'birds', parent_id: 9, ad_count: 30 },
    { id: nx(), name: 'Fish', slug: 'fish', parent_id: 9, ad_count: 40 },
    { id: nx(), name: 'Rabbits', slug: 'rabbits', parent_id: 9, ad_count: 25 },
    { id: nx(), name: 'Livestock Pets', slug: 'livestock', parent_id: 9, ad_count: 35 },
    { id: nx(), name: 'Pet Food', slug: 'pet-food', parent_id: 9, ad_count: 100 },
    { id: nx(), name: 'Pet Accessories', slug: 'pet-accessories', parent_id: 9, ad_count: 80 },
    { id: nx(), name: 'Pet Healthcare', slug: 'pet-healthcare', parent_id: 9, ad_count: 45 },
    { id: nx(), name: 'Aquariums', slug: 'aquariums', parent_id: 9, ad_count: 35 },
    { id: nx(), name: 'Pet Toys', slug: 'pet-toys', parent_id: 9, ad_count: 55 },
    { id: nx(), name: 'Pet Grooming', slug: 'pet-grooming', parent_id: 9, ad_count: 40 },
    { id: nx(), name: 'Pet Services', slug: 'pet-services', parent_id: 9, ad_count: 30 },
    { id: nx(), name: 'Pet Housing', slug: 'pet-housing', parent_id: 9, ad_count: 25 },
    { id: nx(), name: 'Reptiles', slug: 'reptiles', parent_id: 9, ad_count: 15 },
    { id: nx(), name: 'Exotic Pets', slug: 'exotic-pets', parent_id: 9, ad_count: 10 },
    { id: nx(), name: 'Pet Training', slug: 'pet-training', parent_id: 9, ad_count: 20 },
    { id: nx(), name: 'Veterinary Services', slug: 'vet-services', parent_id: 9, ad_count: 35 },
  ]},
  { id: 10, name: 'Property', slug: 'property', ad_count: 1500, children: [
    { id: nx(), name: 'Apartments for Rent', slug: 'apartments-rent', parent_id: 10, ad_count: 400 },
    { id: nx(), name: 'Apartments for Sale', slug: 'apartments-sale', parent_id: 10, ad_count: 250 },
    { id: nx(), name: 'Houses for Rent', slug: 'houses-rent', parent_id: 10, ad_count: 380 },
    { id: nx(), name: 'Houses for Sale', slug: 'houses-sale', parent_id: 10, ad_count: 320 },
    { id: nx(), name: 'Lands & Plots', slug: 'land-plots', parent_id: 10, ad_count: 350 },
    { id: nx(), name: 'Commercial Property', slug: 'commercial-property', parent_id: 10, ad_count: 200 },
    { id: nx(), name: 'Office Spaces', slug: 'office-spaces', parent_id: 10, ad_count: 120 },
    { id: nx(), name: 'Shops', slug: 'shops', parent_id: 10, ad_count: 150 },
    { id: nx(), name: 'Warehouses', slug: 'warehouses', parent_id: 10, ad_count: 80 },
    { id: nx(), name: 'Event Centers', slug: 'event-centers', parent_id: 10, ad_count: 60 },
    { id: nx(), name: 'Hotels', slug: 'hotels', parent_id: 10, ad_count: 50 },
    { id: nx(), name: 'Hostels', slug: 'hostels', parent_id: 10, ad_count: 70 },
    { id: nx(), name: 'Short Let', slug: 'short-let', parent_id: 10, ad_count: 150 },
    { id: nx(), name: 'Co-working Spaces', slug: 'coworking-spaces', parent_id: 10, ad_count: 40 },
    { id: nx(), name: 'Factories', slug: 'factories', parent_id: 10, ad_count: 30 },
    { id: nx(), name: 'Farms', slug: 'farms', parent_id: 10, ad_count: 45 },
    { id: nx(), name: 'Mixed-Use Property', slug: 'mixed-use-property', parent_id: 10, ad_count: 35 },
    { id: nx(), name: 'Beach Property', slug: 'beach-property', parent_id: 10, ad_count: 25 },
    { id: nx(), name: 'Luxury Property', slug: 'luxury-property', parent_id: 10, ad_count: 40 },
    { id: nx(), name: 'Property Services', slug: 'property-services', parent_id: 10, ad_count: 55 },
  ]},
  { id: 11, name: 'Services', slug: 'services', ad_count: 850, children: [
    { id: nx(), name: 'Cleaning Services', slug: 'cleaning-services', parent_id: 11, ad_count: 110 },
    { id: nx(), name: 'Laundry Services', slug: 'laundry-services', parent_id: 11, ad_count: 70 },
    { id: nx(), name: 'Repair Services', slug: 'repair-services', parent_id: 11, ad_count: 90 },
    { id: nx(), name: 'Plumbing Services', slug: 'plumbing-services', parent_id: 11, ad_count: 60 },
    { id: nx(), name: 'Electrical Services', slug: 'electrical-services', parent_id: 11, ad_count: 55 },
    { id: nx(), name: 'Digital Services', slug: 'digital-services', parent_id: 11, ad_count: 130 },
    { id: nx(), name: 'Web Design', slug: 'web-design', parent_id: 11, ad_count: 80 },
    { id: nx(), name: 'Graphic Design', slug: 'graphic-design', parent_id: 11, ad_count: 75 },
    { id: nx(), name: 'Programming Services', slug: 'programming-services', parent_id: 11, ad_count: 60 },
    { id: nx(), name: 'Photography Services', slug: 'photography-services', parent_id: 11, ad_count: 50 },
    { id: nx(), name: 'Videography Services', slug: 'videography-services', parent_id: 11, ad_count: 40 },
    { id: nx(), name: 'Delivery Services', slug: 'delivery-services', parent_id: 11, ad_count: 85 },
    { id: nx(), name: 'Beauty Services', slug: 'beauty-services', parent_id: 11, ad_count: 65 },
    { id: nx(), name: 'Catering Services', slug: 'catering-services', parent_id: 11, ad_count: 55 },
    { id: nx(), name: 'Event Planning', slug: 'event-planning', parent_id: 11, ad_count: 80 },
    { id: nx(), name: 'Building Services', slug: 'building-services', parent_id: 11, ad_count: 45 },
    { id: nx(), name: 'Interior Design', slug: 'interior-design', parent_id: 11, ad_count: 35 },
    { id: nx(), name: 'Moving Services', slug: 'moving-services', parent_id: 11, ad_count: 50 },
    { id: nx(), name: 'Printing Services', slug: 'printing-services', parent_id: 11, ad_count: 30 },
    { id: nx(), name: 'Consulting Services', slug: 'consulting-services', parent_id: 11, ad_count: 40 },
  ]},
  { id: 12, name: 'Sports & Outdoors', slug: 'sports', ad_count: 550, children: [
    { id: nx(), name: 'Gym Equipment', slug: 'gym-equipment', parent_id: 12, ad_count: 180 },
    { id: nx(), name: 'Fitness Accessories', slug: 'fitness-accessories', parent_id: 12, ad_count: 100 },
    { id: nx(), name: 'Treadmills', slug: 'treadmills', parent_id: 12, ad_count: 60 },
    { id: nx(), name: 'Dumbbells', slug: 'dumbbells', parent_id: 12, ad_count: 50 },
    { id: nx(), name: 'Bicycles', slug: 'bicycles', parent_id: 12, ad_count: 80 },
    { id: nx(), name: 'Camping Gear', slug: 'camping-gear', parent_id: 12, ad_count: 70 },
    { id: nx(), name: 'Hiking Equipment', slug: 'hiking-equipment', parent_id: 12, ad_count: 40 },
    { id: nx(), name: 'Outdoor Furniture', slug: 'outdoor-furniture', parent_id: 12, ad_count: 55 },
    { id: nx(), name: 'Football Equipment', slug: 'football-equipment', parent_id: 12, ad_count: 65 },
    { id: nx(), name: 'Basketball Equipment', slug: 'basketball-equipment', parent_id: 12, ad_count: 45 },
    { id: nx(), name: 'Swimming Equipment', slug: 'swimming-equipment', parent_id: 12, ad_count: 50 },
    { id: nx(), name: 'Boxing Equipment', slug: 'boxing-equipment', parent_id: 12, ad_count: 35 },
    { id: nx(), name: 'Indoor Games', slug: 'indoor-games', parent_id: 12, ad_count: 60 },
    { id: nx(), name: 'Jerseys', slug: 'jerseys', parent_id: 12, ad_count: 90 },
    { id: nx(), name: 'Sports Shoes', slug: 'sports-shoes', parent_id: 12, ad_count: 100 },
    { id: nx(), name: 'Yoga Equipment', slug: 'yoga-equipment', parent_id: 12, ad_count: 40 },
    { id: nx(), name: 'Fishing Equipment', slug: 'fishing-equipment', parent_id: 12, ad_count: 45 },
    { id: nx(), name: 'Running Equipment', slug: 'running-equipment', parent_id: 12, ad_count: 35 },
    { id: nx(), name: 'Outdoor Cooking', slug: 'outdoor-cooking', parent_id: 12, ad_count: 30 },
    { id: nx(), name: 'Travel Accessories', slug: 'travel-accessories', parent_id: 12, ad_count: 55 },
  ]},
];

const CATEGORY_ICONS: Record<string, string> = {
  vehicles: '\u{1F697}', cars: '\u{1F697}', motorcycles: '\u{1F3CD}', suvs: '\u{1F697}', sedans: '\u{1F697}',
  'mobile-phones': '\u{1F4F1}', smartphones: '\u{1F4F1}', tablets: '\u{1F4FA}',
  property: '\u{1F3E0}', houses: '\u{1F3E0}', land: '\u{1F3D4}', apartments: '\u{1F3E0}', 'short-let': '\u{1F3E0}',
  electronics: '\u{1F4BB}', laptops: '\u{1F4BB}', tvs: '\u{1F4FA}', cameras: '\u{1F4F7}', headphones: '\u{1F50A}',
  fashion: '\u{1F455}',
  'home-furniture': '\u{1F6CF}', furniture: '\u{1F6CF}',
  services: '\u{1F6E0}',
  jobs: '\u{1F4BC}',
  'health-beauty': '\u{1F484}',
  sports: '\u{26BD}',
  'baby-kids': '\u{1F476}',
  pets: '\u{1F436}', dogs: '\u{1F436}', cats: '\u{1F431}',
};

const CATEGORY_BG: Record<string, string> = {
  vehicles: 'bg-emerald-50', cars: 'bg-emerald-50',
  'mobile-phones': 'bg-blue-50', smartphones: 'bg-blue-50',
  property: 'bg-violet-50',
  electronics: 'bg-amber-50', laptops: 'bg-amber-50',
  fashion: 'bg-pink-50',
  'home-furniture': 'bg-orange-50', furniture: 'bg-orange-50',
  services: 'bg-cyan-50',
  jobs: 'bg-slate-50',
  'health-beauty': 'bg-rose-50',
  sports: 'bg-green-50',
  'baby-kids': 'bg-yellow-50',
  pets: 'bg-lime-50',
};

function getIcon(slug?: string, name?: string): string {
  if (slug) {
    const lower = slug.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS))
      if (lower === key || lower.includes(key)) return icon;
  }
  if (name) {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS))
      if (lower === key || lower.includes(key)) return icon;
  }
  return '\u{1F4E6}';
}

function getCategoryBg(name?: string): string {
  if (!name) return 'bg-gray-50';
  const lower = name.toLowerCase();
  for (const [key, bg] of Object.entries(CATEGORY_BG))
    if (lower.includes(key)) return bg;
  return 'bg-gray-50';
}

function formatCount(count?: number): string {
  if (count == null) return '';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return count.toLocaleString();
}

function SidebarSkeleton() {
  return (
    <div className="space-y-0.5 p-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />
          <div className="flex-1 h-3.5 bg-gray-100 animate-pulse rounded" style={{ width: `${65 + (i % 4) * 8}%` }} />
        </div>
      ))}
    </div>
  );
}

export default function CategorySidebar() {
  const [hoveredCat, setHoveredCat] = useState<Category | null>(null);
  const [hoveredSub, setHoveredSub] = useState<Category | null>(null);
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [activeSub, setActiveSub] = useState<Category | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabletOpen, setTabletOpen] = useState(false);
  const [mobileBreadcrumbs, setMobileBreadcrumbs] = useState<Category[]>([]);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, maxHeight: 400 });

  const sidebarRef = useRef<HTMLDivElement>(null);
  const subPanelRef = useRef<HTMLDivElement>(null);
  const childPanelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: apiCats, isLoading } = useSWR<Category[]>(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000, fallbackData: fallbackCategories }
  );

  const categories = apiCats && apiCats.length > 0 ? apiCats : fallbackCategories;

  const rootCats = useCallback(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(c => c.parent_id == null);
  }, [categories]);

  const getChildren = useCallback((cat: Category): Category[] => {
    if (cat.children && cat.children.length > 0) return cat.children;
    if (!Array.isArray(categories)) return [];
    return categories.filter(c => c.parent_id === cat.id);
  }, [categories]);

  const isActiveCat = (cat: Category) => (hoveredCat || activeCat)?.id === cat.id;
  const isActiveSub = (sub: Category) => (hoveredSub || activeSub)?.id === sub.id;

  const showCatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideCatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSubTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInPanelRef = useRef(false);

  const clearAllTimers = useCallback(() => {
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); showCatTimer.current = null; }
    if (hideCatTimer.current) { clearTimeout(hideCatTimer.current); hideCatTimer.current = null; }
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); showSubTimer.current = null; }
  }, []);

  const closeAll = useCallback(() => {
    clearAllTimers();
    setHoveredCat(null);
    setHoveredSub(null);
    setActiveCat(null);
    setActiveSub(null);
  }, [clearAllTimers]);

  const scheduleCatHide = useCallback(() => {
    if (hideCatTimer.current) { clearTimeout(hideCatTimer.current); }
    hideCatTimer.current = setTimeout(() => {
      setHoveredCat(null);
      setHoveredSub(null);
    }, 600);
  }, []);

  const cancelCatHide = useCallback(() => {
    if (hideCatTimer.current) { clearTimeout(hideCatTimer.current); hideCatTimer.current = null; }
  }, []);

  const handleCatEnter = useCallback((cat: Category, index: number) => {
    cancelCatHide();
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); }
    showCatTimer.current = setTimeout(() => {
      setHoveredSub(null);
      setActiveSub(null);
      setHoveredCat(cat);
      const el = itemRefs.current[index];
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const headerH = 112;
        const maxAvail = vh - headerH - 16;
        const availBelow = vh - rect.top - 16;
        let top = rect.top;
        let maxHeight = Math.min(maxAvail, availBelow);
        if (maxHeight < 200) {
          maxHeight = maxAvail;
          top = Math.max(headerH, vh - maxHeight - 16);
        }
        setPanelPos({ top, left: rect.right - 2, maxHeight });
      }
    }, 80);
  }, [cancelCatHide]);

  const handleCatLeave = useCallback(() => {
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); showCatTimer.current = null; }
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); showSubTimer.current = null; }
    if (!activeCat && !isInPanelRef.current) {
      scheduleCatHide();
    }
  }, [activeCat, scheduleCatHide]);

  const handleCatClick = useCallback((cat: Category) => {
    if (activeCat?.id === cat.id) {
      closeAll();
      return;
    }
    const subs = getChildren(cat);
    clearAllTimers();
    setActiveCat(cat);
    setActiveSub(null);
    setHoveredCat(cat);
    setHoveredSub(subs.length > 0 ? subs[0] : null);
    const idx = rootCats().findIndex(c => c.id === cat.id);
    if (idx >= 0) {
      const el = itemRefs.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const headerH = 112;
        const maxAvail = vh - headerH - 16;
        const availBelow = vh - rect.top - 16;
        let top = rect.top;
        let maxHeight = Math.min(maxAvail, availBelow);
        if (maxHeight < 200) {
          maxHeight = maxAvail;
          top = Math.max(headerH, vh - maxHeight - 16);
        }
        setPanelPos({ top, left: rect.right - 2, maxHeight });
      }
    }
  }, [activeCat, closeAll, clearAllTimers, getChildren, rootCats]);

  const handleSubEnter = useCallback((sub: Category) => {
    cancelCatHide();
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); }
    showSubTimer.current = setTimeout(() => {
      setHoveredSub(sub);
    }, 60);
  }, [cancelCatHide]);

  const handleSubLeave = useCallback(() => {
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); }
  }, []);

  const handleSubClick = useCallback((sub: Category) => {
    if (activeSub?.id === sub.id) {
      setActiveSub(null);
      setHoveredSub(null);
    } else {
      setActiveSub(sub);
      setHoveredSub(sub);
    }
  }, [activeSub]);

  const handlePanelEnter = useCallback(() => {
    isInPanelRef.current = true;
    cancelCatHide();
  }, [cancelCatHide]);
  const handlePanelLeave = useCallback(() => {
    isInPanelRef.current = false;
    if (!activeCat) {
      scheduleCatHide();
    }
  }, [activeCat, scheduleCatHide]);

  const handleMobileSelect = useCallback((cat: Category) => {
    const children = getChildren(cat);
    if (children.length > 0) {
      setMobileBreadcrumbs(prev => [...prev, cat]);
    }
  }, [getChildren]);

  const handleMobileBack = useCallback(() => {
    setMobileBreadcrumbs(prev => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeAll(); setMobileOpen(false); setTabletOpen(false); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeAll]);

  useEffect(() => {
    if (!hoveredCat && !activeCat) return;
    const handleScroll = () => {
      const target = hoveredCat || activeCat;
      if (!target) return;
      const idx = rootCats().findIndex(c => c.id === target.id);
      if (idx < 0) return;
      const el = itemRefs.current[idx];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const headerH = 112;
      const maxAvail = vh - headerH - 16;
      const availBelow = vh - rect.top - 16;
      let top = rect.top;
      let maxHeight = Math.min(maxAvail, availBelow);
      if (maxHeight < 200) {
        maxHeight = maxAvail;
        top = Math.max(headerH, vh - maxHeight - 16);
      }
      requestAnimationFrame(() => setPanelPos({ top, left: rect.right - 2, maxHeight }));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hoveredCat, activeCat, rootCats]);

  useEffect(() => {
    if (!hoveredCat && !activeCat) return;
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sidebarRef.current?.contains(t)) return;
      if (subPanelRef.current?.contains(t)) return;
      if (childPanelRef.current?.contains(t)) return;
      closeAll();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hoveredCat, activeCat, closeAll]);

  const displayCat = hoveredCat || activeCat;
  const displaySub = hoveredSub || activeSub;
  const subs = displayCat ? getChildren(displayCat) : [];
  const children = displaySub ? getChildren(displaySub) : [];

  const mbCats = mobileBreadcrumbs.length === 0
    ? rootCats()
    : getChildren(mobileBreadcrumbs[mobileBreadcrumbs.length - 1]);

  const renderIcon = (cat: Category) => (
    <span className={cn('flex-shrink-0 w-7 h-7 flex items-center justify-center text-sm rounded-lg', getCategoryBg(cat.name))}>
      {getIcon(cat.slug, cat.name)}
    </span>
  );

  const renderPanelItem = (item: Category, isSub?: boolean) => (
    <div
      key={item.id}
      onMouseEnter={() => isSub ? handleSubEnter(item) : undefined}
      onMouseLeave={() => isSub ? handleSubLeave() : undefined}
      onClick={() => isSub ? handleSubClick(item) : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && isSub) { e.preventDefault(); handleSubClick(item); } }}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-md transition-all duration-100',
        (!isSub || isActiveSub(item))
          ? 'bg-primary-50/60 text-primary-700 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <span className="flex-1 text-sm truncate">{item.name}</span>
      {item.ad_count != null && (
        <span className="text-[11px] text-gray-400 tabular-nums">{formatCount(item.ad_count)}</span>
      )}
      {getChildren(item).length > 0 && (
        <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-black/40 lg:hidden" onClick={() => { setMobileOpen(false); setMobileBreadcrumbs([]); }} />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'fixed top-0 left-0 bottom-0 z-[201] w-[300px] max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
          {mobileBreadcrumbs.length > 0 && (
            <button onClick={handleMobileBack} className="p-1 -ml-1 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
          )}
          <span className="font-semibold text-gray-900 text-sm flex-1">
            {mobileBreadcrumbs.length === 0 ? 'Categories' : mobileBreadcrumbs[mobileBreadcrumbs.length - 1].name}
          </span>
          <button onClick={() => { setMobileOpen(false); setMobileBreadcrumbs([]); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 pb-20">
          {isLoading && !categories.length ? <SidebarSkeleton /> : !mbCats.length ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
          ) : (
            <div className="py-1">
              {mbCats.map(cat => {
                const hasChildren = getChildren(cat).length > 0;
                return (
                  <div key={cat.id} onClick={() => handleMobileSelect(cat)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleMobileSelect(cat); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0"
                  >
                    {renderIcon(cat)}
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{cat.name}</span>
                    {cat.ad_count != null && <span className="text-xs text-gray-400">{formatCount(cat.ad_count)}</span>}
                    {hasChildren && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tablet toggle */}
      <button onClick={() => setTabletOpen(!tabletOpen)}
        className="hidden md:flex lg:hidden fixed left-3 z-40 w-10 h-10 bg-white rounded-xl shadow-md border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors"
        style={{ top: '130px' }} aria-label="Categories">
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      {tabletOpen && <div className="fixed inset-0 z-[200] bg-black/40 hidden md:block lg:hidden" onClick={() => setTabletOpen(false)} />}
      <div className={cn(
        'fixed top-0 left-0 bottom-0 z-[201] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out hidden md:block lg:hidden',
        tabletOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Categories</span>
          <button onClick={() => setTabletOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {isLoading && !categories.length ? <SidebarSkeleton /> : !rootCats().length ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
          ) : (
            <div className="py-1">
              {rootCats().map(cat => (
                <Link key={cat.id} href={`/ads?category=${cat.slug}`} onClick={() => setTabletOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  {renderIcon(cat)}
                  <span className="flex-1 font-medium truncate">{cat.name}</span>
                  {getChildren(cat).length > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        ref={sidebarRef}
        onMouseLeave={handleCatLeave}
        className="hidden lg:block w-[248px] flex-shrink-0 self-start z-40"
        style={{
          position: 'sticky',
          top: 'calc(104px + 8px)',
          maxHeight: 'calc(100vh - 104px - 16px)',
        }}
      >
        <div className="bg-white rounded-xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-50">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Categories</h3>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 104px - 16px - 40px)', scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
          >
            {isLoading && !categories.length ? <SidebarSkeleton /> : !rootCats().length ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
            ) : (
              <div className="py-1">
                {rootCats().map((cat, index) => {
                  const active = isActiveCat(cat);
                  const hasSubs = getChildren(cat).length > 0;
                  return (
                    <div
                      key={cat.id}
                      ref={el => { itemRefs.current[index] = el; }}
                      onMouseEnter={() => handleCatEnter(cat, index)}
                      onMouseLeave={handleCatLeave}
                      onClick={() => handleCatClick(cat)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCatClick(cat); } }}
                      className={cn(
                        'relative flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all duration-100 border-l-[3px] select-none',
                        active
                          ? 'bg-primary-50/70 border-l-primary-500 text-primary-700'
                          : 'border-l-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-l-gray-200'
                      )}
                    >
                      {renderIcon(cat)}
                      <span className="flex-1 text-sm font-medium truncate leading-tight">{cat.name}</span>
                      <span className="text-[11px] font-medium text-gray-400 tabular-nums">{formatCount(cat.ad_count)}</span>
                      {hasSubs && (
                        <ChevronRight className={cn('w-3.5 h-3.5 flex-shrink-0 transition-all duration-200', active ? 'text-primary-400 translate-x-px' : 'text-gray-300')} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Level 2 - Subcategory panel */}
      {displayCat && subs.length > 0 && (
        <div
          ref={subPanelRef}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          className="fixed z-50 bg-white rounded-xl border border-gray-100/80 shadow-lg overflow-hidden animate-fade-in"
          style={{
            top: `${panelPos.top}px`,
            left: `${panelPos.left}px`,
            minWidth: '220px',
            maxWidth: '300px',
            maxHeight: `${panelPos.maxHeight}px`,
          }}
        >
          <Link
            href={`/ads?category=${displayCat.slug}`}
            className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
          >
            {renderIcon(displayCat)}
            <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{displayCat.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto flex-shrink-0 group-hover:text-primary-400" />
          </Link>
          <div className="overflow-y-auto" style={{ maxHeight: `${panelPos.maxHeight - 48}px`, scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            <div className="py-1.5 px-1.5">
              {subs.map(sub => renderPanelItem(sub, true))}
            </div>
          </div>
        </div>
      )}

      {/* Level 3 - Child panel */}
      {displaySub && children.length > 0 && (
        <div
          ref={childPanelRef}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          className="fixed z-50 bg-white rounded-xl border border-gray-100/80 shadow-lg overflow-hidden animate-fade-in"
          style={{
            top: `${panelPos.top}px`,
            left: `${panelPos.left + 218}px`,
            minWidth: '200px',
            maxWidth: '260px',
            maxHeight: `${panelPos.maxHeight}px`,
          }}
        >
          <div className="px-4 py-2.5 border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate block">{displaySub.name}</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: `${panelPos.maxHeight - 44}px`, scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            <div className="py-1.5 px-1.5">
              {children.map(child => (
                <Link
                  key={child.id}
                  href={`/ads?category=${child.slug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                  <span className="flex-1 truncate">{child.name}</span>
                  {child.ad_count != null && <span className="text-[11px] text-gray-400 tabular-nums">{formatCount(child.ad_count)}</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
