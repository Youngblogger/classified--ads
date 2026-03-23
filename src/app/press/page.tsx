'use client';

import Link from 'next/link';
import { 
  FileText,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Download,
  Newspaper,
  Tv,
  Radio,
  Megaphone,
  Calendar,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';

const pressReleases = [
  {
    id: 1,
    title: 'iList.ng Reaches 25,000 Active Sellers Milestone',
    date: 'February 25, 2026',
    excerpt: 'iList.ng celebrates a major milestone as the platform welcomes its 25,000th active seller, marking significant growth in Nigeria\'s digital marketplace.',
    category: 'Company News',
  },
  {
    id: 2,
    title: 'iList.ng Launches Enhanced Messaging System',
    date: 'March 5, 2026',
    excerpt: 'New features include read receipts, quick replies, and improved notification system for better buyer-seller communication.',
    category: 'Product Updates',
  },
  {
    id: 3,
    title: 'iList.ng Expands to 36 States Across Nigeria',
    date: 'January 15, 2026',
    excerpt: 'The platform now serves all 36 states in Nigeria, bringing online trading opportunities to every corner of the country.',
    category: 'Company News',
  },
  {
    id: 4,
    title: 'iList.ng Introduces Verified Seller Badges',
    date: 'December 10, 2025',
    excerpt: 'New verification system helps buyers identify trusted sellers and promotes safer transactions on the platform.',
    category: 'Product Updates',
  },
];

const mediaAssets = [
  {
    name: 'Brand Logo Package',
    description: 'Official iList.ng logos in various formats and colors',
    format: 'ZIP (2.4 MB)',
  },
  {
    name: 'Brand Guidelines',
    description: 'Complete brand style guide and usage instructions',
    format: 'PDF (1.8 MB)',
  },
  {
    name: 'Product Screenshots',
    description: 'High-resolution screenshots of the iList.ng platform',
    format: 'ZIP (15 MB)',
  },
  {
    name: 'Executive Photos',
    description: 'Professional photos of iList.ng leadership team',
    format: 'ZIP (8 MB)',
  },
];

const coverage = [
  {
    outlet: 'TechCabal',
    title: 'How iList.ng is Transforming Online Trading in Nigeria',
    date: 'March 2026',
    link: '#',
  },
  {
    outlet: 'Punch Newspaper',
    title: 'iList.ng Emerges as Nigeria\'s Fastest Growing Marketplace',
    date: 'February 2026',
    link: '#',
  },
  {
    outlet: 'Nigerian Tribune',
    title: 'Digital Marketplace iList.ng Reaches New Heights',
    date: 'January 2026',
    link: '#',
  },
  {
    outlet: 'The Guardian',
    title: 'Local Platforms Leading Nigeria\'s E-commerce Revolution',
    date: 'December 2025',
    link: '#',
  },
];

const stats = [
  { icon: Users, label: 'Active Sellers', value: '25,000+' },
  { icon: Globe, label: 'Monthly Visitors', value: '500K+' },
  { icon: TrendingUp, label: 'Monthly Listings', value: '50,000+' },
  { icon: Award, label: 'States Covered', value: '36' },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="container-app relative py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Newspaper className="w-5 h-5" />
              <span className="text-sm font-medium">Press Room</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Press & Media
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Find the latest news, press releases, and media resources about iList.ng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:press@ilist.ng"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 font-semibold rounded-xl transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Press Team
              </a>
              <Link 
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 font-semibold rounded-xl transition-colors"
              >
                <FileText className="w-5 h-5" />
                Visit Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About iList.ng</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  iList.ng is Nigeria's trusted online marketplace, connecting buyers and sellers across the country. 
                  Founded with a mission to make buying and selling simple and accessible, we have grown to become 
                  one of Nigeria's most popular classified ad platforms.
                </p>
                <p>
                  Our platform enables individuals and businesses to post ads, browse listings, and connect with 
                  potential buyers across categories including vehicles, property, electronics, fashion, and more.
                </p>
                <p>
                  With coverage across all 36 states in Nigeria and hundreds of thousands of monthly visitors, 
                  iList.ng is helping to drive the digital economy forward.
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <Link 
                  href="/about"
                  className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
                >
                  Learn More About Us
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 md:p-12">
              <blockquote className="text-xl text-primary-800 italic mb-6">
                "We believe that everyone should have access to a simple, trusted platform to buy and sell. 
                That belief drives everything we do at iList.ng."
              </blockquote>
              <p className="text-primary-700 font-medium">— iList.ng Team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="bg-gray-50 py-20">
        <div className="container-app">
          <div className="flex items-center gap-3 mb-8">
            <Megaphone className="w-6 h-6 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Press Releases</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {pressReleases.map((release) => (
              <article
                key={release.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    {release.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {release.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{release.title}</h3>
                <p className="text-gray-600 mb-4">{release.excerpt}</p>
                <button className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
                  Read Full Release
                  <ExternalLink className="w-4 h-4" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-20">
        <div className="container-app">
          <div className="flex items-center gap-3 mb-8">
            <Tv className="w-6 h-6 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Media Coverage</h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {coverage.map((item, index) => (
              <div
                key={index}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  index !== coverage.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-primary-600">{item.outlet}</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <a
                    href={item.link}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    Read Article
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Assets */}
      <section className="bg-gray-50 py-20">
        <div className="container-app">
          <div className="flex items-center gap-3 mb-8">
            <Download className="w-6 h-6 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Media Assets</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-2xl">
            Download official iList.ng logos, brand guidelines, and other resources for media use. 
            Please review our brand guidelines before using any assets.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaAssets.map((asset) => (
              <div
                key={asset.name}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{asset.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{asset.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{asset.format}</span>
                  <button className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="py-20">
        <div className="container-app">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
              <h2 className="text-3xl font-bold mb-6">Press Contact</h2>
              <p className="text-gray-300 mb-8">
                For press inquiries, interview requests, or media-related questions, please contact our 
                communications team. We typically respond within 24 hours.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <a href="mailto:press@ilist.ng" className="text-lg font-medium hover:text-primary-300">
                      press@ilist.ng
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <a href="tel:+2348000000000" className="text-lg font-medium hover:text-primary-300">
                      +234 800 000 0000
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Website</p>
                    <a href="https://ilist.ng/press" className="text-lg font-medium hover:text-primary-300">
                      ilist.ng/press
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Follow our blog for the latest news, product updates, and insights from iList.ng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 hover:bg-gray-100 font-semibold rounded-xl transition-colors"
            >
              <Newspaper className="w-5 h-5" />
              Visit Our Blog
            </Link>
            <a 
              href="mailto:press@ilist.ng"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-700 text-white hover:bg-primary-800 font-semibold rounded-xl transition-colors"
            >
              <Mail className="w-5 h-5" />
              Contact Press Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
