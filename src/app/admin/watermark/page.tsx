'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Type, Image, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface WatermarkSettings {
  enabled: boolean;
  type: 'text' | 'logo';
  text: string;
  logo_path: string | null;
  position: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left' | 'center';
  opacity: number;
  font_size: number;
  font_family: string;
  margin: number;
  show_ad_id: boolean;
  apply_to_original: boolean;
  apply_to_medium: boolean;
  apply_to_thumbnail: boolean;
}

const positionOptions = [
  { value: 'bottom_right', label: 'Bottom Right' },
  { value: 'bottom_left', label: 'Bottom Left' },
  { value: 'top_right', label: 'Top Right' },
  { value: 'top_left', label: 'Top Left' },
  { value: 'center', label: 'Center' },
];

const fontFamilyOptions = [
  { value: 'arial', label: 'Arial', fontFamily: 'Arial, sans-serif' },
  { value: 'arial_black', label: 'Arial Black', fontFamily: 'Arial Black, sans-serif' },
  { value: 'algerian', label: 'Algerian', fontFamily: 'Algerian, cursive' },
  { value: 'castellar', label: 'Castellar', fontFamily: 'Castellar, serif' },
  { value: 'gill_sans_ultra', label: 'Gill Sans Ultra Bold', fontFamily: '"Gill Sans Ultra Bold", sans-serif' },
  { value: 'imprint_mt_shadow', label: 'Imprint MT Shadow', fontFamily: '"Imprint MT Shadow", cursive' },
  { value: 'century_gothic', label: 'Century Gothic', fontFamily: '"Century Gothic", sans-serif' },
  { value: 'rockwell', label: 'Rockwell', fontFamily: 'Rockwell, serif' },
  { value: 'copperplate', label: 'Copperplate', fontFamily: 'Copperplate, fantasy' },
  { value: 'impact', label: 'Impact', fontFamily: 'Impact, sans-serif' },
  { value: 'georgia', label: 'Georgia', fontFamily: 'Georgia, serif' },
  { value: 'times_new_roman', label: 'Times New Roman', fontFamily: '"Times New Roman", serif' },
  { value: 'verdana', label: 'Verdana', fontFamily: 'Verdana, sans-serif' },
  { value: 'tahoma', label: 'Tahoma', fontFamily: 'Tahoma, sans-serif' },
  { value: 'trebuchet_ms', label: 'Trebuchet MS', fontFamily: '"Trebuchet MS", sans-serif' },
  { value: 'courier_new', label: 'Courier New', fontFamily: '"Courier New", monospace' },
  { value: 'comic_sans_ms', label: 'Comic Sans MS', fontFamily: '"Comic Sans MS", cursive' },
  { value: 'lucida_console', label: 'Lucida Console', fontFamily: '"Lucida Console", monospace' },
  { value: 'palatino', label: 'Palatino Linotype', fontFamily: '"Palatino Linotype", serif' },
  { value: 'book_antiqua', label: 'Book Antiqua', fontFamily: '"Book Antiqua", serif' },
  { value: 'garamond', label: 'Garamond', fontFamily: 'Garamond, serif' },
];

export default function WatermarkSettingsPage() {
  const [settings, setSettings] = useState<WatermarkSettings>({
    enabled: true,
    type: 'text',
    text: 'iList',
    logo_path: null,
    position: 'bottom_right',
    opacity: 80,
    font_size: 36,
    font_family: 'arial',
    margin: 20,
    show_ad_id: true,
    apply_to_original: true,
    apply_to_medium: true,
    apply_to_thumbnail: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminApi.getWatermarkSettings();
      if (response.data && response.data.id) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching watermark settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.updateWatermarkSettings(settings);
      setMessage({ type: 'success', text: 'Watermark settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof WatermarkSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Type className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Watermark Settings</h1>
            <p className="text-gray-500">Configure automatic watermark for ad images</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Main Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enable Watermark */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Watermark Control</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Eye className="w-5 h-5 text-green-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-900">Enable Watermark</span>
            </div>
            <button
              onClick={() => handleChange('enabled', !settings.enabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.enabled ? 'left-8' : 'left-1'
                }`}
              />
            </button>
          </label>
          <p className="text-sm text-gray-500 mt-2">
            When enabled, all uploaded ad images will have a watermark applied
          </p>
        </div>

        {/* Watermark Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Watermark Type</h2>
          <div className="flex gap-4">
            <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              settings.type === 'text' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="type"
                value="text"
                checked={settings.type === 'text'}
                onChange={() => handleChange('type', 'text')}
                className="sr-only"
              />
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                <span className="font-medium">Text</span>
              </div>
            </label>
            <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              settings.type === 'logo' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="type"
                value="logo"
                checked={settings.type === 'logo'}
                onChange={() => handleChange('type', 'logo')}
                className="sr-only"
              />
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                <span className="font-medium">Logo</span>
              </div>
            </label>
          </div>
        </div>

        {/* Text Watermark */}
        {settings.type === 'text' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Watermark Text</h2>
            <input
              type="text"
              value={settings.text}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Enter watermark text"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              This text will appear on uploaded images
            </p>
          </div>
        )}

        {/* Position */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Watermark Position</h2>
          <select
            value={settings.position}
            onChange={(e) => handleChange('position', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {positionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Opacity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Opacity: {settings.opacity}%</h2>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.opacity}
            onChange={(e) => handleChange('opacity', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Transparent</span>
            <span>Opaque</span>
          </div>
        </div>

        {/* Font Size */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Font Size: {settings.font_size}px</h2>
          <input
            type="range"
            min="8"
            max="72"
            value={settings.font_size}
            onChange={(e) => handleChange('font_size', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Font Family */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Font Family</h2>
          <select
            value={settings.font_family}
            onChange={(e) => handleChange('font_family', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{ fontFamily: fontFamilyOptions.find(f => f.value === settings.font_family)?.fontFamily }}
          >
            {fontFamilyOptions.map((option) => (
              <option key={option.value} value={option.value} style={{ fontFamily: option.fontFamily }}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Preview:</p>
            <p 
              className="text-lg text-gray-900 truncate"
              style={{ fontFamily: fontFamilyOptions.find(f => f.value === settings.font_family)?.fontFamily }}
            >
              {settings.text || 'iList.ng'}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Select the font style for watermark text
          </p>
        </div>

        {/* Margin */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Margin: {settings.margin}px</h2>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.margin}
            onChange={(e) => handleChange('margin', parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-2">
            Distance from the edge of the image
          </p>
        </div>

        {/* Show Ad ID */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Options</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_ad_id}
              onChange={(e) => handleChange('show_ad_id', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium text-gray-900">Show Ad ID in watermark</span>
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Example: "MyMarketplace.com | Ad ID: 48291"
          </p>
        </div>
      </div>

      {/* Image Sizes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply Watermark To</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.apply_to_original}
              onChange={(e) => handleChange('apply_to_original', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium text-gray-900">Original Image (Full Size)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.apply_to_medium}
              onChange={(e) => handleChange('apply_to_medium', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium text-gray-900">Medium Image (800x600)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.apply_to_thumbnail}
              onChange={(e) => handleChange('apply_to_thumbnail', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium text-gray-900">Thumbnail (300x300)</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
