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
