'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search,
  ChevronRight,
  ChevronDown,
  Book,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  FileText,
  Video,
  Users
} from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account on iList.ng?',
        a: 'Click on the "Sign Up" button at the top right of our homepage. Fill in your name, email, and password. You can also sign up using your Google or Facebook account for faster registration.',
      },
      {
        q: 'How do I post an ad?',
        a: 'After logging in, click on "Post Ad" button. Fill in the details about your item or service including title, description, price, category, and location. Add clear photos and submit your listing for review.',
      },
      {
        q: 'Is it free to post ads?',
        a: 'Yes, posting basic ads on iList.ng is completely free. We also offer optional paid promotion features to boost your listing visibility.',
      },
      {
        q: 'How long does it take for my ad to be approved?',
        a: 'Most ads are reviewed and approved within 1-2 hours. During peak times, it may take up to 24 hours. You will receive an email notification once your ad is live.',
      },
    ],
  },
  {
    category: 'Buying & Selling',
    questions: [
      {
        q: 'How do I contact a seller?',
        a: 'Click on the "Contact Seller" button on any listing. You can send a message directly through our platform or call the phone number provided (if shown).',
      },
      {
        q: 'How do I know if a seller is trustworthy?',
        a: 'Look for verified badges on seller profiles. Read reviews from previous buyers. Always meet in safe, public places and never send money before receiving the item.',
      },
      {
        q: 'Can I negotiate the price?',
        a: 'Yes, negotiation is common on iList.ng. Use the messaging feature to discuss pricing with sellers. Be respectful and reasonable in your offers.',
      },
      {
        q: 'What should I do if I receive a suspicious message?',
        a: 'Do not click on any suspicious links. Do not send money or personal information. Report the user immediately using the "Report" button on their profile or message.',
      },
    ],
  },
  {
    category: 'Account & Settings',
    questions: [
      {
        q: 'How do I change my password?',
        a: 'Go to your Dashboard > Settings > Security. Click on "Change Password" and follow the instructions. Make sure to use a strong, unique password.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Visit Dashboard > Settings > Account. Click on "Delete Account" at the bottom. Note that this action is permanent and cannot be undone.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Forgot Password" on the login page. Enter your email address and we will send you a link to reset your password.',
      },
    ],
  },
  {
    category: 'Payments & Billing',
    questions: [
      {
        q: 'What payment methods are accepted?',
        a: 'iList.ng does not process payments directly. Payment methods vary by seller - common options include bank transfer, cash on delivery, and payment apps like OPay or PalmPay.',
      },
      {
        q: 'How do I promote my ad?',
        a: 'Go to your ad and click "Promote". Choose a promotion plan that suits your needs. Promoted ads appear higher in search results and get more visibility.',
      },
    ],
  },
];

const popularTopics = [
  { icon: Book, title: 'Posting an Ad', count: 12 },
  { icon: Users, title: 'Seller Guidelines', count: 8 },
  { icon: FileText, title: 'Account Help', count: 15 },
  { icon: MessageCircle, title: 'Messaging', count: 6 },
  { icon: Video, title: 'Video Tutorials', count: 4 },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help?</h1>
            <p className="text-xl text-primary-100 mb-8">
              Search our knowledge base or browse topics below
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-12 bg-white border-b">
        <div className="container-app">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Popular Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {popularTopics.map((topic) => (
              <button
                key={topic.title}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:text-primary-700 transition-colors text-center"
              >
                <topic.icon className="w-8 h-8 mb-3" />
                <span className="font-medium text-sm">{topic.title}</span>
                <span className="text-xs text-gray-500 mt-1">{topic.count} articles</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            
            {faqs.map((section) => (
              <div key={section.category} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.category}</h3>
                <div className="space-y-3">
                  {section.questions.map((item, index) => {
                    const globalIndex = faqs.indexOf(section) * 100 + index;
                    return (
                      <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === globalIndex ? null : globalIndex)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900 pr-4">{item.q}</span>
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                              expandedFaq === globalIndex ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                        {expandedFaq === globalIndex && (
                          <div className="px-5 pb-5 text-gray-600">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="bg-gray-100 py-16">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
            <p className="text-gray-600 mb-8">
              Can not find what you are looking for? Our support team is ready to assist you.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-4">Chat with our team</p>
                <button className="text-primary-600 font-medium hover:text-primary-700">
                  Start Chat
                </button>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-4">Response within 24 hours</p>
                <a href="mailto:support@ilist.ng" className="text-primary-600 font-medium hover:text-primary-700">
                  Send Email
                </a>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-4">Mon-Fri, 9am-6pm WAT</p>
                <a href="tel:+2348000000000" className="text-primary-600 font-medium hover:text-primary-700">
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">More Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/safety-tips" className="flex items-center gap-4 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Book className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Safety Tips</h3>
                  <p className="text-sm text-gray-600">Stay safe while buying and selling</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              <Link href="/terms" className="flex items-center gap-4 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Terms of Service</h3>
                  <p className="text-sm text-gray-600">Read our terms and policies</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
