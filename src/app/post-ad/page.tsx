'use client';

import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import PostAdForm from '@/components/forms/PostAdForm';
import { Check, Shield, Clock, Star } from 'lucide-react';

export default function PostAdPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
              <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
                <h1 className="text-2xl font-bold text-dark mb-2">Post Your Ad</h1>
                <p className="text-gray-500 mb-8">Fill in the details to list your item for sale</p>
                
                <PostAdForm isStandalone={true} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips Card */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tips for a Great Ad</h3>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">Use clear, high quality photos</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">Write a detailed description</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">Set a competitive price</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">Choose the right category</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">Include your location</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">Add a phone number for contact</span>
                  </li>
                </ul>
              </div>

              {/* Trust Badges */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Secure Platform</p>
                    <p className="text-xs text-gray-500">Your data is protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Quick Approval</p>
                    <p className="text-xs text-gray-500">Ads go live in minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Star className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Reach Thousands</p>
                    <p className="text-xs text-gray-500">Connect with serious buyers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
