'use client';

import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import Footer from '@/components/layout/Footer';
import { Cookie, Shield, Settings, Info } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ResponsiveHeader variant="default" />
      
      <main className="flex-1 pt-[48px] md:pt-[112px] pb-12">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Cookie className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-dark">Cookie Policy</h1>
                <p className="text-gray-500">Last updated: March 23, 2026</p>
              </div>
            </div>

            <div className="card p-6 md:p-8 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">What Are Cookies</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit a website. They help 
                  websites remember your preferences, login information, and provide a better browsing experience. 
                  Our platform uses cookies and similar technologies to enhance your experience.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Cookie className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">Types of Cookies We Use</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-dark">Essential Cookies</h3>
                      <span className="text-xs text-primary-600 font-medium">Required</span>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-2">
                        These cookies are necessary for the platform to function properly. They enable core features 
                        like user authentication, security, and accessibility.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {['Session management', 'Security features', 'Load balancing', 'CSRF protection'].map((item, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-dark">Performance Cookies</h3>
                      <span className="text-xs text-blue-600 font-medium">Analytics</span>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-2">
                        These cookies help us understand how visitors interact with our platform by collecting and 
                        reporting information anonymously.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {['Page views', 'Session duration', 'Navigation patterns', 'Error tracking'].map((item, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-purple-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-dark">Functionality Cookies</h3>
                      <span className="text-xs text-purple-600 font-medium">Preferences</span>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-2">
                        These cookies enable enhanced features like remembering your preferences, language settings, 
                        and providing a personalized experience.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {['Language preference', 'Location settings', 'Theme choices', 'Recently viewed'].map((item, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-dark">Marketing Cookies</h3>
                      <span className="text-xs text-green-600 font-medium">Advertising</span>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-2">
                        These cookies are used to track visitors across websites to display relevant advertisements 
                        based on their browsing behavior.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {['Ad personalization', 'Cross-site tracking', 'Campaign analytics', 'Remarketing'].map((item, i) => (
                          <span key={i} className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">Managing Your Cookie Preferences</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You can manage your cookie preferences in the following ways:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Browser Settings</h4>
                    <p className="text-gray-600 text-sm">
                      Most web browsers allow you to control cookies through their settings. You can block, delete, 
                      or be notified when cookies are set.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Cookie Consent Banner</h4>
                    <p className="text-gray-600 text-sm">
                      Upon your first visit, you can accept or customize your cookie preferences through our 
                      consent banner.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Platform Settings</h4>
                    <p className="text-gray-600 text-sm">
                      Log in to your account settings to manage your cookie preferences and privacy settings 
                      at any time.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-dark mb-2">Opt-Out Links</h4>
                    <p className="text-gray-600 text-sm">
                      For marketing cookies, you can opt out through the individual network advertising platforms&apos; 
                      opt-out pages.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Third-Party Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Some cookies are placed by third-party services that appear on our platform. These include:
                </p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {[
                    { name: 'Google Analytics', purpose: 'Usage analytics and performance tracking' },
                    { name: 'Payment Providers', purpose: 'Secure payment processing' },
                    { name: 'Social Media', purpose: 'Social sharing and login features' },
                    { name: 'Advertising Networks', purpose: 'Relevant ad delivery and tracking' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="font-medium text-dark">{item.name}</span>
                      <span className="text-gray-600 text-sm">{item.purpose}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-dark m-0">Data Retention</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Cookie data is retained for varying periods depending on the type of cookie. Session cookies 
                  are deleted when you close your browser, while persistent cookies remain on your device for a 
                  set period or until manually deleted. We regularly review our cookie retention periods to ensure 
                  compliance with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Impact of Disabling Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you choose to disable cookies, please note that some features of the platform may not work 
                  properly:
                </p>
                <ul className="space-y-2">
                  {[
                    'You may need to log in each time you visit',
                    'Some personalized features may not work',
                    'Video playback and interactive features may be limited',
                    'Your preferences may not be saved'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">Updates to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for 
                  legal, operational, or regulatory reasons. We will notify you of any material changes by posting 
                  the updated policy on this page with a revised &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-dark mb-4">More Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  For more information about cookies, including how to see what cookies have been set on your 
                  device and how to manage and delete them, visit:
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm hover:bg-primary-100 transition-colors">
                    allaboutcookies.org
                  </a>
                  <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm hover:bg-primary-100 transition-colors">
                    youronlinechoices.com
                  </a>
                </div>
              </section>

              <section>
                <div className="bg-primary-50 rounded-xl p-4">
                  <h2 className="text-xl font-semibold text-dark mb-2">Contact Us</h2>
                  <p className="text-gray-700">
                    If you have any questions about our use of cookies, please contact us:
                  </p>
                  <p className="text-primary-600 font-medium mt-1">privacy@classifiedads.com</p>
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
