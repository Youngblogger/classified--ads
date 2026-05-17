'use client';

import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import { FileText, CheckCircle, AlertTriangle, Scale, Users, Ban, Mail } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 pt-[48px] md:pt-[112px] pb-12">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Scale className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-dark">Terms of Service</h1>
                <p className="text-gray-500">Last updated: March 23, 2026</p>
              </div>
            </div>

            <div className="card p-6 md:p-8 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">Agreement to Terms</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using Classified Ads marketplace platform, you agree to be bound by these Terms of Service 
                  and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
                  from using or accessing this platform.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">User Eligibility</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To use our platform, you must:
                </p>
                <ul className="space-y-2">
                  {[
                    'Be at least 18 years of age',
                    'Have the legal capacity to enter into binding contracts',
                    'Not be prohibited from using the service under applicable law',
                    'Provide accurate and complete registration information'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">Listing Guidelines</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When posting ads on our platform, you agree to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Accurate Information', desc: 'Provide truthful and accurate descriptions' },
                    { title: 'Legal Items', desc: 'Only list items that are legal to sell' },
                    { title: 'Original Content', desc: 'Use your own photos and descriptions' },
                    { title: 'Appropriate Content', desc: 'No offensive, fraudulent, or misleading content' }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-dark mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Ban className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-semibold text-dark m-0">Prohibited Activities</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You may NOT use the platform to:
                </p>
                <div className="bg-red-50 rounded-xl p-4 space-y-3">
                  {[
                    'Post illegal, harmful, or offensive content',
                    'Engage in fraudulent transactions',
                    'Harass, abuse, or threaten other users',
                    'Circumvent or manipulate our fee structure',
                    'Interfere with the proper functioning of the platform',
                    'Collect user information without consent',
                    'Impersonate any person or entity',
                    'Spam or post repetitive content'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Transactions & Payments</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Direct Transactions</h4>
                    <p className="text-gray-600 text-sm">
                      All transactions between buyers and sellers are conducted directly. We are not a party to any 
                      transaction between users and do not hold funds on behalf of users.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Fees</h4>
                    <p className="text-gray-600 text-sm">
                      Certain services may incur fees, which will be clearly disclosed before you proceed. All fees 
                      are non-refundable unless otherwise stated.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Escrow Services</h4>
                    <p className="text-gray-600 text-sm">
                      For eligible transactions, we may offer escrow services. Terms and conditions for escrow 
                      services are provided separately.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">User Content</h2>
                <p className="text-gray-600 leading-relaxed">
                  You retain ownership of content you post on the platform. By posting content, you grant us a 
                  worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your 
                  content for the purpose of operating and promoting our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Disclaimer</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed">
                    THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT 
                    WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE ARE NOT RESPONSIBLE 
                    FOR THE QUALITY, SAFETY, OR LEGALITY OF ITEMS LISTED.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, Classified Ads shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages resulting from your use of or inability 
                  to use the platform or services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Indemnification</h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Classified Ads and its affiliates from any 
                  claims, damages, losses, or expenses arising from your violation of these Terms or your use 
                  of the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Termination</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may terminate or suspend your access to the platform immediately, without prior notice, for 
                  any reason, including breach of these Terms. Upon termination, your right to use the platform 
                  will cease immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Nigeria, without 
                  regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Nigeria.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of significant 
                  changes via email or notice on the platform. Continued use after changes constitutes acceptance 
                  of the new terms.
                </p>
              </section>

              <section>
                <div className="bg-primary-50 rounded-xl p-4 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <h2 className="text-xl font-semibold text-dark mb-2">Contact Us</h2>
                    <p className="text-gray-700">
                      If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <p className="text-primary-600 font-medium mt-1">legal@classifiedads.com</p>
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
