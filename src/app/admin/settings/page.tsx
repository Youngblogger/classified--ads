'use client';

import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Image,
  Bell,
  DollarSign,
  Shield,
  Clock,
  ImageIcon,
  Save,
  Loader2
} from 'lucide-react';
import { adminApi, authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const settingsSections = [
  { id: 'approval', name: 'Ad Approval', icon: Clock },
  { id: 'images', name: 'Image Settings', icon: ImageIcon },
  { id: 'promotions', name: 'Promotions', icon: DollarSign },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'security', name: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('approval');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    auto_approval_enabled: false,
    approval_duration_minutes: 2,
    max_images_per_ad: 10,
    ad_expiration_days: 30,
    default_ad_status: 'pending',
    watermark_enabled: false,
    watermark_type: 'text',
    watermark_position: 'bottom-right',
    watermark_opacity: 30,
    watermark_show_ad_id: true,
    featured_ad_price: 25,
    top_ad_price: 15,
    bump_ad_price: 5,
    premium_ad_price: 50,
    email_notifications: true,
    push_notifications: true,
    two_factor_enabled: false,
  });

  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQRCode, setTwoFactorQRCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSettings();
      if (res.data) {
        setSettings(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    if (!settings.two_factor_enabled) {
      setTwoFactorLoading(true);
      try {
        const res = await authApi.setup2FA();
        setTwoFactorSecret(res.data.secret);
        setTwoFactorQRCode(res.data.qr_code || '');
        setShowTwoFactorInput(true);
        toast.success('2FA secret generated. Scan the QR code with your authenticator app.');
      } catch (error) {
        console.error('Failed to setup 2FA:', error);
        toast.error('Failed to setup 2FA');
      } finally {
        setTwoFactorLoading(false);
      }
    } else {
      if (twoFactorSecret) {
        setShowTwoFactorInput(true);
      } else {
        setShowTwoFactorInput(true);
      }
    }
  };

  const handleTwoFactorVerify = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setTwoFactorLoading(true);
    try {
      if (settings.two_factor_enabled) {
        await authApi.disable2FA(twoFactorCode);
        setSettings({ ...settings, two_factor_enabled: false });
        setTwoFactorSecret('');
        setShowTwoFactorInput(false);
        setTwoFactorCode('');
        toast.success('2FA disabled successfully');
      } else {
        await authApi.enable2FA(twoFactorCode);
        setSettings({ ...settings, two_factor_enabled: true });
        setTwoFactorSecret('');
        setShowTwoFactorInput(false);
        setTwoFactorCode('');
        toast.success('2FA enabled successfully');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid code';
      toast.error(message);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const cancelTwoFactor = () => {
    setShowTwoFactorInput(false);
    setTwoFactorCode('');
    setTwoFactorSecret('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <section.icon className="w-5 h-5" />
                {section.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Ad Approval Settings */}
          {activeSection === 'approval' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Ad Approval Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Configure automatic ad approval system</p>
              </div>

                <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Auto Ad Approval</h3>
                    <p className="text-sm text-gray-500">Automatically approve ads after specified duration</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, auto_approval_enabled: !settings.auto_approval_enabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.auto_approval_enabled ? 'bg-sky-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.auto_approval_enabled ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Duration (minutes)
                  </label>
                  <select
                    value={settings.approval_duration_minutes}
                    onChange={(e) => setSettings({ ...settings, approval_duration_minutes: Number(e.target.value) })}
                    className="w-full sm:w-64 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    disabled={!settings.auto_approval_enabled}
                  >
                    <option value={1}>1 minute</option>
                    <option value={2}>2 minutes</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Images Per Ad
                    </label>
                    <input
                      type="number"
                      value={settings.max_images_per_ad}
                      onChange={(e) => setSettings({ ...settings, max_images_per_ad: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      min={1}
                      max={20}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Expiration (days)
                    </label>
                    <input
                      type="number"
                      value={settings.ad_expiration_days}
                      onChange={(e) => setSettings({ ...settings, ad_expiration_days: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      min={1}
                      max={365}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Settings */}
          {activeSection === 'images' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Image Watermark Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Configure image watermarking for ads</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Enable Watermark</h3>
                    <p className="text-sm text-gray-500">Add watermark to all uploaded images</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, watermark_enabled: !settings.watermark_enabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.watermark_enabled ? 'bg-sky-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.watermark_enabled ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Type</label>
                  <select
                    value={settings.watermark_type}
                    onChange={(e) => setSettings({ ...settings, watermark_type: e.target.value })}
                    className="w-full sm:w-64 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="text">Text Watermark</option>
                    <option value="logo">Logo Watermark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={settings.watermark_position}
                    onChange={(e) => setSettings({ ...settings, watermark_position: e.target.value })}
                    className="w-full sm:w-64 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="diagonal">Diagonal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity: {settings.watermark_opacity}%
                  </label>
                  <input
                    type="range"
                    value={settings.watermark_opacity}
                    onChange={(e) => setSettings({ ...settings, watermark_opacity: Number(e.target.value) })}
                    className="w-full sm:w-64"
                    min={10}
                    max={50}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.watermark_show_ad_id}
                      onChange={(e) => setSettings({ ...settings, watermark_show_ad_id: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-sky-600"
                    />
                    <span className="text-sm text-gray-700">Show Ad ID in watermark</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Promotions Settings */}
          {activeSection === 'promotions' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Promotion Pricing</h2>
                <p className="text-sm text-gray-500 mt-1">Set prices for ad promotion packages</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Featured Ad</h3>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="number"
                      value={settings.featured_ad_price}
                      onChange={(e) => setSettings({ ...settings, featured_ad_price: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="text-gray-500 ml-2">/ week</span>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Top Ad</h3>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="number"
                      value={settings.top_ad_price}
                      onChange={(e) => setSettings({ ...settings, top_ad_price: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="text-gray-500 ml-2">/ week</span>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Bump Ad</h3>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="number"
                      value={settings.bump_ad_price}
                      onChange={(e) => setSettings({ ...settings, bump_ad_price: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="text-gray-500 ml-2">/ bump</span>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Premium Ad</h3>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="number"
                      value={settings.premium_ad_price}
                      onChange={(e) => setSettings({ ...settings, premium_ad_price: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="text-gray-500 ml-2">/ month</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Configure notification preferences</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, email_notifications: !settings.email_notifications })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.email_notifications ? 'bg-sky-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.email_notifications ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, push_notifications: !settings.push_notifications })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.push_notifications ? 'bg-sky-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.push_notifications ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Configure security options</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">
                      {settings.two_factor_enabled ? '2FA is enabled' : 'Require 2FA for admin login'}
                    </p>
                  </div>
                  <button
                    onClick={handleTwoFactorToggle}
                    disabled={twoFactorLoading}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.two_factor_enabled ? 'bg-sky-600' : 'bg-gray-300'
                    } ${twoFactorLoading ? 'opacity-50' : ''}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.two_factor_enabled ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {showTwoFactorInput && (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {settings.two_factor_enabled ? 'Enter code to disable 2FA' : 'Enter code from authenticator app'}
                      </label>
                      
                      {!settings.two_factor_enabled && twoFactorSecret && (
                        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-500 mb-2">Scan this QR code with your authenticator app:</p>
                          {twoFactorQRCode && (
                            <div className="mb-3 flex justify-center">
                              <img src={twoFactorQRCode} alt="2FA QR Code" className="w-40 h-40" />
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mb-1">Or enter this secret key manually:</p>
                          <p className="font-mono text-sm text-gray-900 break-all">{twoFactorSecret}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-32 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-center text-lg tracking-widest"
                          maxLength={6}
                        />
                        <button
                          onClick={handleTwoFactorVerify}
                          disabled={twoFactorLoading || twoFactorCode.length !== 6}
                          className="px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {twoFactorLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          {settings.two_factor_enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={cancelTwoFactor}
                          disabled={twoFactorLoading}
                          className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Open your Google Authenticator app and enter the 6-digit code
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
