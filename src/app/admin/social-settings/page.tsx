'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, RefreshCw, CheckCircle, XCircle, Facebook, Instagram, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SocialSettings {
  id?: number;
  platform: string;
  app_id: string;
  app_secret: string;
  access_token: string;
  page_id: string;
  instagram_business_id: string;
  is_enabled: boolean;
  has_credentials: boolean;
}

export default function SocialSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [settings, setSettings] = useState<SocialSettings[]>([]);
  const [formData, setFormData] = useState<Record<string, SocialSettings>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/social/settings');
      const settingsData = response.data.settings || [];
      setSettings(settingsData);
      
      // Initialize form data
      const initialFormData: Record<string, SocialSettings> = {};
      settingsData.forEach((s: SocialSettings) => {
        initialFormData[s.platform] = s;
      });
      setFormData(initialFormData);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (platform: string, field: keyof SocialSettings, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handleSave = async (platform: string) => {
    setSaving(true);
    try {
      const data = formData[platform];
      const payload = {
        platform,
        app_id: data.app_id,
        app_secret: data.app_secret,
        access_token: data.access_token,
        page_id: data.page_id,
        instagram_business_id: data.instagram_business_id,
        is_enabled: data.is_enabled,
      };

      const response = await api.post('/social/settings', payload);
      
      if (response.data.success) {
        toast.success(`${platform} settings saved!`);
        fetchSettings();
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (platform: string) => {
    setTesting(platform);
    try {
      const response = await api.post('/social/settings/test', { platform });
      
      if (response.data.success) {
        toast.success(`${platform} connection successful!`);
      } else {
        toast.error(`${platform} connection failed: ${response.data.message}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Connection test failed');
    } finally {
      setTesting(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'facebook') return <Facebook className="w-6 h-6 text-blue-600" />;
    if (platform === 'instagram') return <Instagram className="w-6 h-6 text-pink-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Media Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure your Facebook and Instagram API credentials
        </p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-800">Important</p>
          <p className="text-sm text-yellow-700 mt-1">
            You need a Facebook Developer account to get these credentials. 
            Visit <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">developers.facebook.com</a> to create an app.
          </p>
        </div>
      </div>

      {/* Settings Forms */}
      <div className="grid gap-6">
        {['facebook', 'instagram'].map((platform) => {
          const data = formData[platform] || {
            platform,
            app_id: '',
            app_secret: '',
            access_token: '',
            page_id: '',
            instagram_business_id: '',
            is_enabled: true,
            has_credentials: false,
          };

          return (
            <div key={platform} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Platform Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPlatformIcon(platform)}
                  <h3 className="text-lg font-semibold capitalize">{platform}</h3>
                  {data.has_credentials ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Not configured
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_enabled}
                    onChange={(e) => handleChange(platform, 'is_enabled', e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <span className="text-sm text-gray-600">Enable</span>
                </label>
              </div>

              {/* Form Fields */}
              <div className="p-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={data.app_id || ''}
                    onChange={(e) => handleChange(platform, 'app_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter App ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Secret
                  </label>
                  <input
                    type="password"
                    value={data.app_secret || ''}
                    onChange={(e) => handleChange(platform, 'app_secret', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter App Secret"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={data.access_token || ''}
                    onChange={(e) => handleChange(platform, 'access_token', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter Long-lived Access Token"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get a long-lived token from Facebook Graph API Explorer
                  </p>
                </div>

                {platform === 'facebook' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page ID
                    </label>
                    <input
                      type="text"
                      value={data.page_id || ''}
                      onChange={(e) => handleChange(platform, 'page_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Facebook Page ID"
                    />
                  </div>
                )}

                {platform === 'instagram' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram Business Account ID
                    </label>
                    <input
                      type="text"
                      value={data.instagram_business_id || ''}
                      onChange={(e) => handleChange(platform, 'instagram_business_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter Instagram Business ID"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleTest(platform)}
                  disabled={testing === platform || !data.has_credentials}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {testing === platform ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Test Connection
                </button>
                <button
                  onClick={() => handleSave(platform)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Settings
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How to Get Credentials</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Facebook Developers</a> and create an app</li>
          <li>Add "Facebook Login" and "Instagram Graph API" products to your app</li>
          <li>Get your App ID and App Secret from app settings</li>
          <li>Generate a long-lived access token using <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Graph API Explorer</a></li>
          <li>Get your Facebook Page ID from your page settings</li>
          <li>Link your Instagram account to your Facebook page and get the Instagram Business ID</li>
        </ol>
      </div>
    </div>
  );
}
