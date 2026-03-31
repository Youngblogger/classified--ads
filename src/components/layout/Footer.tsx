'use client';

import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  ArrowRight,
  Search
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
  ];

  const categoryLinks = [
    { label: 'Vehicles', href: '/ads?category=vehicles' },
    { label: 'Property', href: '/ads?category=property' },
    { label: 'Mobile Phones', href: '/ads?category=mobile-phones' },
    { label: 'Electronics', href: '/ads?category=electronics' },
    { label: 'Jobs', href: '/ads?category=jobs' },
    { label: 'Fashion', href: '/ads?category=fashion' },
  ];

  const supportLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'Safety Tips', href: '/safety-tips' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Report Abuse', href: '/report-abuse' },
  ];

  const serviceLinks = [
    { label: 'Post Ad', href: '/post-ad' },
    { label: 'Promote Ad', href: '/promote-ad' },
    { label: 'Premium Plans', href: '/premium-plans' },
    { label: 'Business Accounts', href: '/business-accounts' },
  ];

  const locationLinks = [
    { label: 'Lagos', href: '/ads?location=lagos' },
    { label: 'Abuja', href: '/ads?location=abuja' },
    { label: 'Ibadan', href: '/ads?location=ibadan' },
    { label: 'Port Harcourt', href: '/ads?location=port-harcourt' },
    { label: 'Kano', href: '/ads?location=kano' },
  ];

  const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com/ilist', icon: Facebook },
    { label: 'Instagram', href: 'https://instagram.com/ilist', icon: Instagram },
    { label: 'Twitter (X)', href: 'https://twitter.com/ilist', icon: Twitter },
  ];

  const popularSearches = [
    'Used Cars Lagos',
    'iPhones Abuja',
    'Houses for Rent',
    'Used Laptops',
    'Fashion Clothing',
    'Jobs in Lagos',
    'Real Estate',
    'Motorcycles',
  ];

  return (
    <footer className="bg-slate-900 text-white">
      {/* Top CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container-app py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Post Free Ad – Start selling in seconds
              </h2>
              <p className="text-primary-100 text-sm md:text-base">
                Join thousands of sellers on Nigeria&apos;s trusted marketplace
              </p>
            </div>
            <Link 
              href="/post-ad"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 hover:bg-slate-100 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Post Your Ad
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container-app py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Column 1: Company */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Categories</h3>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Services */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Locations */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Locations</h3>
            <ul className="space-y-3">
              {locationLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 6: Connect */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Connect</h3>
            <div className="flex flex-col gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm transition-colors text-slate-400 hover:text-white"
                  >
                    <Icon className="w-4 h-4" />
                    {social.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>



        {/* Divider */}
        <div className="border-t border-slate-700 mt-12 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Download App Section */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-white">Download Our App</h3>
              <p className="text-sm text-slate-400 mb-4">
                Buy and sell on the go with our mobile app
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all duration-200"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-slate-400">Download on the</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all duration-200"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-slate-400">Download on the</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Popular Searches (SEO) */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-white flex items-center gap-2">
                <Search className="w-4 h-4" />
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <Link
                    key={index}
                    href={`/ads?q=${encodeURIComponent(search)}`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm text-slate-400 hover:text-white transition-all duration-200"
                  >
                    {search}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700 bg-slate-950">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">i</span>
                </div>
                <span className="text-lg font-bold text-white">iList</span>
              </Link>
              <span className="text-slate-500 text-sm">
                &copy; {CURRENT_YEAR} iList. All rights reserved.
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link 
                href="/privacy-policy" 
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms-of-service" 
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href="/cookie-policy" 
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.slice(0, 4).map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 bg-slate-800 text-slate-400 hover:bg-primary-600 hover:text-white"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
