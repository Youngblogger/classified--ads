'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Mail, MessageSquare, Heart, Clock, Star, CreditCard, Loader2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  ad_approved: boolean;
  ad_rejected: boolean;
  ad_expiring: boolean;
  new_message: boolean;
  new_view: boolean;
  new_favorite: boolean;
  promotion_updates: boolean;
  payment_updates: boolean;
  marketing_emails: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
}

const notificationTypes = [
  {
    category: 'Ad Activity',
    items: [
      { key: 'ad_approved', label: 'Ad Approved', description: 'When your ad is approved and goes live', icon: Bell },
      { key: 'ad_rejected', label: 'Ad Rejected', description: 'When your ad is rejected', icon: Bell },
      { key: 'ad_expiring', label: 'Ad Expiring', description: 'When your ad is about to expire', icon: Clock },
    ],
  },
  {
    category: 'Engagement',
    items: [
      { key: 'new_message', label: 'New Messages', description: 'When you receive a new message', icon: MessageSquare },
      { key: 'new_view', label: 'New Views', description: 'When someone views your ad', icon: Bell },
      { key: 'new_favorite', label: 'New Favorites', description: 'When someone saves your ad to favorites', icon: Heart },
    ],
  },
  {
    category: 'Promotions & Payments',
    items: [
      { key: 'promotion_updates', label: 'Promotion Updates', description: 'Updates about your promoted ads', icon: Star },
      { key: 'payment_updates', label: 'Payment Updates', description: 'Wallet transactions and payments', icon: CreditCard },
    ],
  },
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    ad_approved: true,
    ad_rejected: true,
    ad_expiring: true,
    new_message: true,
    new_view: false,
    new_favorite: true,
    promotion_updates: true,
    payment_updates: true,
    marketing_emails: false,
    frequency: 'instant',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await api.get('/notifications/preferences');
      if (res.data) {
        setPreferences(prev => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/notifications/preferences', preferences);
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-white rounded-2xl p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-100 rounded-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/notifications"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
          <p className="text-gray-500 text-sm mt-1">
            Choose how you want to be notified
          </p>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('email_notifications')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.email_notifications ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.email_notifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive push notifications on your device</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('push_notifications')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.push_notifications ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.push_notifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      {notificationTypes.map(category => (
        <div key={category.category} className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{category.category}</h3>
          <div className="space-y-3">
            {category.items.map(item => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <item.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(item.key as keyof NotificationPreferences)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences[item.key as keyof NotificationPreferences] ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences[item.key as keyof NotificationPreferences] ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Marketing */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Marketing</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Marketing Emails</p>
              <p className="text-sm text-gray-500">Receive promotional offers and newsletters</p>
            </div>
            <button
              onClick={() => handleToggle('marketing_emails')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.marketing_emails ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.marketing_emails ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Frequency */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Email Frequency</h3>
        <div className="flex gap-3">
          {[
            { value: 'instant', label: 'Instant' },
            { value: 'daily', label: 'Daily Digest' },
            { value: 'weekly', label: 'Weekly Digest' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setPreferences(prev => ({ ...prev, frequency: option.value as any }))}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                preferences.frequency === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
