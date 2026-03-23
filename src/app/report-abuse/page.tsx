'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle,
  Send,
  Check,
  Home,
  ChevronRight,
  Flag,
  User,
  FileText,
  MessageSquare,
  Shield
} from 'lucide-react';

const reportTypes = [
  { value: 'scam', label: 'Scam / Fraud', description: 'Attempt to steal money or personal information' },
  { value: 'fake', label: 'Fake Listing', description: 'Listing does not match the actual item or service' },
  { value: 'inappropriate', label: 'Inappropriate Content', description: 'Offensive, illegal, or prohibited items' },
  { value: 'harassment', label: 'Harassment', description: 'Threatening or abusive behavior' },
  { value: 'spam', label: 'Spam', description: 'Repeated unwanted messages or postings' },
  { value: 'other', label: 'Other Issue', description: 'Any other concerns not listed above' },
];

const evidenceTypes = [
  'Screenshots of messages',
  'Photos of the item',
  'Receipts or transaction records',
  'Links to the listing or profile',
  'Any other relevant documentation',
];

export default function ReportAbusePage() {
  const [formData, setFormData] = useState({
    reportType: '',
    adUrl: '',
    reporterName: '',
    reporterEmail: '',
    description: '',
    evidence: '',
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSubmitted(true);
  };

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
            <span className="text-gray-900">Report Abuse</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white py-16">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Report Abuse</h1>
            <p className="text-xl text-red-100">
              Help us keep iList.ng safe by reporting suspicious activity, scams, or inappropriate content.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container-app">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for helping keep iList.ng safe. Our team will review your report and take appropriate action within 24-48 hours.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      A confirmation email has been sent to your email address.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <Flag className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Submit a Report</h2>
                        <p className="text-sm text-gray-600">All reports are kept confidential</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Report Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Type of Issue *
                        </label>
                        <div className="grid md:grid-cols-2 gap-3">
                          {reportTypes.map((type) => (
                            <label
                              key={type.value}
                              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                                formData.reportType === type.value
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="reportType"
                                value={type.value}
                                checked={formData.reportType === type.value}
                                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                                className="mt-1"
                                required
                              />
                              <div>
                                <span className="font-medium text-gray-900">{type.label}</span>
                                <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Listing URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Listing or Profile URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={formData.adUrl}
                          onChange={(e) => setFormData({ ...formData, adUrl: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="https://ilist.ng/ads/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Copy and paste the URL of the suspicious listing or profile
                        </p>
                      </div>

                      {/* Reporter Info */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.reporterName}
                            onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.reporterEmail}
                            onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Describe the Issue *
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                          placeholder="Please provide as much detail as possible about the suspicious activity..."
                        />
                      </div>

                      {/* Evidence */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Evidence / Additional Information
                        </label>
                        <textarea
                          rows={3}
                          value={formData.evidence}
                          onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                          placeholder="List any evidence you have, such as screenshots, messages, etc."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Examples: {evidenceTypes.join(', ')}
                        </p>
                      </div>

                      {/* Consent */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="consent"
                          required
                          checked={formData.consent}
                          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                          className="mt-1"
                        />
                        <label htmlFor="consent" className="text-sm text-gray-600">
                          I confirm that the information provided is accurate and I understand that providing false information may result in account suspension. *
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Report
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* What Happens */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">What Happens Next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600">
                      1
                    </div>
                    <p className="text-sm text-gray-600">Our team reviews your report within 24-48 hours</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600">
                      2
                    </div>
                    <p className="text-sm text-gray-600">If necessary, the content is temporarily removed for investigation</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600">
                      3
                    </div>
                    <p className="text-sm text-gray-600">Appropriate action is taken against violators</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600">
                      4
                    </div>
                    <p className="text-sm text-gray-600">You may receive an update on the outcome (if applicable)</p>
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-red-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="font-bold text-gray-900">Stay Safe</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  If you believe you have been scammed or feel unsafe, take these steps:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-red-500 mt-0.5" />
                    Do not send any more money
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-red-500 mt-0.5" />
                    Contact your bank immediately
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-red-500 mt-0.5" />
                    Report to the police
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-red-500 mt-0.5" />
                    Save all communications
                  </li>
                </ul>
              </div>

              {/* Emergency */}
              <div className="bg-gray-900 rounded-xl p-6 text-white">
                <h3 className="font-bold mb-4">Emergency Contacts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Police Emergency</span>
                    <span className="font-bold">199 or 112</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">EFCC</span>
                    <span className="font-bold">+234 803 123 4567</span>
                  </div>
                </div>
              </div>

              {/* More Help */}
              <Link
                href="/safety-tips"
                className="flex items-center gap-4 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Safety Tips</h3>
                  <p className="text-sm text-gray-600">Learn how to stay safe</p>
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
