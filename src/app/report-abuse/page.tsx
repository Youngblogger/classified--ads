'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, Send, ArrowLeft, Mail } from 'lucide-react';

export default function ReportAbusePage() {
  const [form, setForm] = useState({ type: '', adUrl: '', message: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="max-w-lg mx-auto w-full px-4 py-20">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Report Submitted</h1>
            <p className="text-slate-600 mb-6">Thank you for helping keep iList.ng safe. Our team will review your report within 24 hours.</p>
            <Link href="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Report Abuse</h1>
              <p className="text-sm text-slate-500">Help us keep the platform safe</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type of Issue</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select an issue type</option>
                <option value="spam">Spam or Scam</option>
                <option value="fake">Fake or Misleading Ad</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="fraud">Fraudulent Activity</option>
                <option value="harassment">Harassment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad URL (optional)</label>
              <input
                type="url"
                value={form.adUrl}
                onChange={(e) => setForm({ ...form, adUrl: e.target.value })}
                placeholder="https://ilist.ng/ad/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                placeholder="Please describe the issue in detail..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
            >
              <Shield className="w-4 h-4" />
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
