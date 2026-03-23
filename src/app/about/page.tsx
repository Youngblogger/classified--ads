'use client';

import Link from 'next/link';
import { 
  Shield,
  Zap,
  Globe,
  Heart,
  Target,
  Award,
  Headphones,
  Users,
  MessageCircle,
  Megaphone,
  ShoppingBag
} from 'lucide-react';

const stats = [
  { label: 'Active Listings', value: '50,000+' },
  { label: 'Happy Sellers', value: '25,000+' },
  { label: 'Cities Covered', value: '36' },
  { label: 'Monthly Visits', value: '500K+' },
];

const features = [
  {
    icon: Zap,
    title: 'Post an Ad in Minutes',
    description: 'Our platform allows you to list your products or services quickly with a straightforward and user-friendly process.',
  },
  {
    icon: ShoppingBag,
    title: 'Discover Great Deals',
    description: 'Buyers can browse through multiple categories and find items from sellers near them, all in one convenient marketplace.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Communication',
    description: 'Sellers can connect with interested buyers through messaging, making negotiations and transactions easy.',
  },
  {
    icon: Megaphone,
    title: 'Promote Your Business',
    description: 'Businesses can expand their customer base by reaching people actively searching for the products and services they offer.',
  },
];

const commitments = [
  'Easy to use platform for posting ads and browsing listings',
  'Secure environment that protects both buyers and sellers',
  'Continuous improvements based on user feedback',
  'Support for local businesses and communities across Nigeria',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="container-app relative py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About iList.ng
            </h1>
            <p className="text-xl md:text-2xl text-primary-100">
              Welcome to iList.ng, a modern online marketplace built to make buying and selling easier for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-8">
              Our platform connects people across Nigeria who want to buy, sell, or promote products and services in their local communities.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              At its core, iList.ng is about creating opportunities. Every day, people have items they want to sell, services they want to offer, or great deals they are searching for. Our goal is to bring all of these opportunities together in one place where people can easily connect, trade, and grow.
            </p>
            <p className="text-lg text-gray-600">
              Whether you are an individual trying to sell something you no longer need, a small business looking for more customers, or a buyer searching for the best deals nearby, iList.ng is designed to help you do it quickly and conveniently.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-16">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="space-y-6 text-gray-600 text-lg">
              <p>
                The idea behind iList.ng started with a simple observation. Buying and selling online should not be complicated. Many people want a simple platform where they can list items, find what they need, and connect with others without unnecessary stress.
              </p>
              <p>
                We created iList.ng to solve this problem by providing a marketplace that is simple to use, accessible to everyone, and built around the needs of real people.
              </p>
              <p>
                Nigeria is a country full of entrepreneurs, small businesses, and individuals who are constantly trading goods and services. From electronics and vehicles to real estate, jobs, and everyday household items, people are always looking for opportunities to buy and sell.
              </p>
              <p>
                iList.ng was built to support this growing digital economy by giving everyone a place where they can easily showcase what they have to offer and reach potential buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="bg-gray-50 py-20">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What You Can Do on iList.ng</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our platform provides a wide range of features designed to make online trading simple and effective.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl p-8 md:p-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-primary-100">
                Our mission is to create a simple, trusted, and accessible marketplace where people can buy and sell with confidence.
              </p>
              <p className="text-primary-100 mt-4">
                We believe that everyone should have access to a platform that allows them to participate in the digital economy, whether they are individuals selling personal items or businesses trying to reach new customers.
              </p>
              <p className="text-primary-100 mt-4">
                By making the process of buying and selling easier, we hope to empower people, support local businesses, and create more opportunities for communities across Nigeria.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl p-8 md:p-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-300">
                Our vision is to grow iList.ng into one of the most trusted and widely used online marketplaces in Nigeria.
              </p>
              <p className="text-gray-300 mt-4">
                We aim to build a platform where millions of people can connect, discover opportunities, and conduct transactions in a safe and reliable environment.
              </p>
              <p className="text-gray-300 mt-4">
                As technology continues to change the way people buy and sell, we want iList.ng to remain at the forefront by constantly improving our platform and providing a better experience for our users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="bg-gray-50 py-20">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Commitment</h2>
            <p className="text-lg text-gray-600 mb-8 text-center">
              At iList.ng, we are committed to providing a marketplace that is easy to use, secure, and constantly improving.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {commitments.map((commitment, index) => (
                <div key={index} className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-primary-600" />
                  </div>
                  <p className="text-gray-600">{commitment}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-gray-600 mt-8 text-center">
              Our users are at the heart of everything we do, and their feedback helps us improve and grow.
            </p>
          </div>
        </div>
      </section>

      {/* Join Community */}
      <section className="py-20">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Join the iList.ng Community</h2>
            <div className="space-y-6 text-lg text-gray-600">
              <p>
                Every day, more people are discovering the benefits of using iList.ng to buy, sell, and promote their products and services.
              </p>
              <p>
                Whether you are looking for a great deal, trying to sell something quickly, or hoping to reach new customers, iList.ng provides the platform you need to make it happen.
              </p>
              <p className="font-semibold text-primary-600 text-xl">
                We invite you to join our growing community and start exploring the opportunities waiting for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary-600 py-16">
        <div className="container-app text-center">
          <p className="text-2xl font-bold text-white mb-4">
            Welcome to iList.ng — where listings connect people and opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link 
              href="/post-ad"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 hover:bg-gray-100 font-semibold rounded-xl transition-colors"
            >
              Post Your First Ad - It is Free
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-700 text-white hover:bg-primary-800 font-semibold rounded-xl transition-colors"
            >
              <Headphones className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
