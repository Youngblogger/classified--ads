'use client';

import Link from 'next/link';
import { 
  Shield,
  Eye,
  AlertTriangle,
  MapPin,
  Lock,
  UserCheck,
  CreditCard,
  Phone,
  ChevronRight,
  Check,
  Home
} from 'lucide-react';

const safetyTips = [
  {
    category: 'General Safety',
    icon: Shield,
    color: 'bg-blue-100 text-blue-600',
    tips: [
      {
        title: 'Meet in Public Places',
        description: 'Always meet buyers or sellers in busy, public locations like shopping malls, police stations, or cafes. Avoid meeting in isolated areas or your home.',
      },
      {
        title: 'Tell Someone About Your Meeting',
        description: 'Let a friend or family member know where you are going, who you are meeting, and when you expect to return.',
      },
      {
        title: 'Trust Your Instincts',
        description: 'If something feels wrong, leave immediately. Do not feel obligated to complete a transaction if you feel uncomfortable.',
      },
      {
        title: 'Use Safe Communication',
        description: 'Keep conversations on our platform until you are ready to share personal contact information. This also helps us investigate any issues.',
      },
    ],
  },
  {
    category: 'For Buyers',
    icon: UserCheck,
    color: 'bg-green-100 text-green-600',
    tips: [
      {
        title: 'Research the Seller',
        description: 'Check the seller\'s profile, reviews, and verification status before proceeding. Look for detailed profiles with history.',
      },
      {
        title: 'Inspect Before Paying',
        description: 'Always inspect the item thoroughly before making payment. Check that it matches the description and photos.',
      },
      {
        title: 'Be Wary of Too-Good Deals',
        description: 'Extremely low prices may indicate scams. If it seems too good to be true, it probably is.',
      },
      {
        title: 'Use Secure Payment Methods',
        description: 'Avoid wire transfers or payment methods that are difficult to trace. Cash on delivery is often safer for physical items.',
      },
    ],
  },
  {
    category: 'For Sellers',
    icon: CreditCard,
    color: 'bg-purple-100 text-purple-600',
    tips: [
      {
        title: 'Verify Buyer Identity',
        description: 'When possible, verify the buyer\'s identity before completing a sale. Be cautious of buyers who refuse to provide information.',
      },
      {
        title: 'Never Ship Before Payment',
        description: 'Do not ship items before receiving confirmed payment. Wait for funds to clear in your account.',
      },
      {
        title: 'Document Everything',
        description: 'Keep records of all communications, receipts, and shipping documents. This protects you in case of disputes.',
      },
      {
        title: 'Be Clear About Item Condition',
        description: 'Honest descriptions prevent misunderstandings and disputes. Include all relevant details and any flaws.',
      },
    ],
  },
  {
    category: 'Online Safety',
    icon: Lock,
    color: 'bg-red-100 text-red-600',
    tips: [
      {
        title: 'Protect Your Personal Information',
        description: 'Never share your bank details, social security number, or other sensitive information with strangers on the platform.',
      },
      {
        title: 'Beware of Phishing',
        description: 'iList.ng will never ask for your password or financial information via email or message. Report suspicious requests.',
      },
      {
        title: 'Use Strong Passwords',
        description: 'Create unique, strong passwords for your account. Enable two-factor authentication if available.',
      },
      {
        title: 'Keep Device Secure',
        description: 'Ensure your phone and computer have updated security software. Avoid accessing your account on public computers.',
      },
    ],
  },
];

const redFlags = [
  'Requests payment via unusual methods like gift cards or cryptocurrency',
  'Seller refuses to meet or provide additional photos',
  'Buyer offers to pay more than the asking price',
  'Urgent pressure to complete the transaction quickly',
  'Requests personal or financial information',
  'Poor grammar and spelling in communications',
  'Price significantly below market value',
  'Seller claims item is abroad and needs shipping fees',
];

export default function SafetyTipsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-app py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="flex items-center gap-1 text-gray-500 hover:text-primary-600">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">Safety Tips</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-16">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Stay Safe on iList.ng</h1>
            <p className="text-xl text-green-100 mb-8">
              Your safety is our priority. Follow these tips to protect yourself when buying and selling.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-white border-b">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">Verified</div>
              <div className="text-sm text-gray-600">Seller Badges</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">Report</div>
              <div className="text-sm text-gray-600">Flag Suspicious Activity</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">Safe</div>
              <div className="text-sm text-gray-600">In-Person Meetups</div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Essential Safety Tips</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these guidelines to ensure a safe experience on our platform
            </p>
          </div>

          <div className="space-y-12">
            {safetyTips.map((section) => (
              <div key={section.category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center`}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{section.category}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {section.tips.map((tip, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 ${section.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                          <p className="text-gray-600 text-sm">{tip.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <section className="bg-red-50 py-16">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Red Flags to Watch For</h2>
                <p className="text-gray-600">Be cautious if you encounter any of these warning signs</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {redFlags.map((flag, index) => (
                <div key={index} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-gray-700">{flag}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
              <h2 className="text-2xl font-bold mb-4">Need Emergency Help?</h2>
              <p className="text-gray-300 mb-6">
                If you feel threatened or believe you are the victim of a scam, contact authorities immediately.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Police Emergency</p>
                    <p className="text-xl font-bold">199 or 112</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">EFCC (Financial Crimes)</p>
                    <p className="text-xl font-bold">+234 803 123 4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Section */}
      <section className="py-16 bg-gray-100">
        <div className="container-app">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Suspicious Activity</h2>
            <p className="text-gray-600 mb-6">
              Help us keep iList.ng safe by reporting any suspicious behavior or scams.
            </p>
            <Link
              href="/report-abuse"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white hover:bg-primary-700 font-semibold rounded-xl transition-colors"
            >
              Report Abuse
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
