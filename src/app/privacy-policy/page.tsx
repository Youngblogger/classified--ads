'use client';

import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import { Shield, Lock, Eye, Users, FileText, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 pt-[48px] md:pt-[112px] pb-12">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-dark">Privacy Policy</h1>
                <p className="text-gray-500">Last updated: March 23, 2026</p>
              </div>
            </div>

            <div className="card p-6 md:p-8 space-y-8">
              <section className="prose prose-gray max-w-none">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">Introduction</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  At Classified Ads, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                  and safeguard your information when you use our marketplace platform. Please read this privacy policy carefully. 
                  By using our service, you consent to the practices described in this policy.
                </p>
              </section>

              <section className="prose prose-gray max-w-none">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">Information We Collect</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-dark mb-2">Personal Information</h3>
                    <p className="text-gray-600 text-sm">
                      We may collect personal information that you voluntarily provide when registering, posting an ad, 
                      or contacting sellers, including your name, email address, phone number, location, and profile photos.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-dark mb-2">Usage Data</h3>
                    <p className="text-gray-600 text-sm">
                      We automatically collect certain information when you access the platform, including your IP address, 
                      browser type, pages visited, time spent on pages, and device identifiers.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-dark mb-2">Listing Information</h3>
                    <p className="text-gray-600 text-sm">
                      Information you provide when creating listings, including photos, descriptions, prices, and 
                      location data for items being sold.
                    </p>
                  </div>
                </div>
              </section>

              <section className="prose prose-gray max-w-none">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">How We Use Your Information</h2>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>To provide, maintain, and improve our marketplace services</li>
                  <li>To process transactions and send related information</li>
                  <li>To send promotional communications (with your consent)</li>
                  <li>To respond to your comments, questions, and requests</li>
                  <li>To monitor and analyze usage patterns and trends</li>
                  <li>To detect, prevent, and address technical issues or fraud</li>
                  <li>To connect buyers with sellers and facilitate communication</li>
                </ul>
              </section>

              <section className="prose prose-gray max-w-none">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">Information Sharing</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may share your information in the following situations:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-dark">With Other Users</h4>
                      <p className="text-gray-600 text-sm">When you post an ad, your listing details and contact information may be visible to other users.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-dark">Service Providers</h4>
                      <p className="text-gray-600 text-sm">We may share information with vendors who assist in operating our platform, including payment processors and hosting providers.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-dark">Legal Requirements</h4>
                      <p className="text-gray-600 text-sm">We may disclose information if required by law or in response to valid requests by public authorities.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="prose prose-gray max-w-none">
                <h2 className="text-xl font-semibold text-dark mb-4">Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
                  the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="prose prose-gray max-w-none">
                <h2 className="text-xl font-semibold text-dark mb-4">Your Rights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Access</h4>
                    <p className="text-gray-600 text-sm">Request a copy of your personal data</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Correction</h4>
                    <p className="text-gray-600 text-sm">Update or correct inaccurate data</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Deletion</h4>
                    <p className="text-gray-600 text-sm">Request deletion of your data</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Opt-out</h4>
                    <p className="text-gray-600 text-sm">Unsubscribe from marketing emails</p>
                  </div>
                </div>
              </section>

              <section className="prose prose-gray max-w-none">
                <h2 className="text-xl font-semibold text-dark mb-4">Contact Us</h2>
                <div className="bg-primary-50 rounded-xl p-4 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-gray-700">
                      If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <p className="text-primary-600 font-medium mt-1">privacy@classifiedads.com</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
