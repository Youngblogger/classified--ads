'use client';

import { useState, useEffect, useRef } from 'react';
import { adminApi } from '@/lib/api';
import { checkWatermarkConfiguration } from '@/lib/watermark-diagnostics';
import { setWatermarkSettings } from '@/lib/image';
import toast from 'react-hot-toast';
import { Loader2, Upload, RefreshCw, Eye, EyeOff, Shield, Type, Image } from 'lucide-react';
import type { WatermarkSettings } from '@/lib/watermark-defaults';
import { DEFAULT_WATERMARK_SETTINGS } from '@/lib/watermark-defaults';

const POSITION_LABELS: Record<string, string> = {
  bottom_right: 'Bottom Right',
  bottom_left: 'Bottom Left',
  top_right: 'Top Right',
  top_left: 'Top Left',
  center: 'Center',
};

export default function WatermarkSettingsPage() {
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_WATERMARK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await adminApi.getWatermarkSettings();
      const apiData = result.data as any;
      console.log('[WatermarkPage] loadSettings result:', result);
      console.log('[WatermarkPage] apiData:', apiData);
      if (apiData && typeof apiData === 'object' && 'enabled' in apiData) {
        console.log('[WatermarkPage] Merging apiData into state, enabled:', apiData.enabled);
        setSettings((prev) => ({
          ...prev,
          ...apiData,
          enabled: apiData.enabled ?? prev.enabled,
          type: apiData.type || prev.type,
        }));
        setWatermarkSettings({
          enabled: apiData.enabled,
          type: apiData.type,
          logo_url: apiData.logo_url,
          text: apiData.text,
          text_color: apiData.text_color,
          font_size: apiData.font_size,
          font_family: apiData.font_family,
          opacity: apiData.opacity,
          position: apiData.position,
          margin: apiData.margin,
          rotation: apiData.rotation,
          logo_scale: apiData.logo_scale,
        });
      } else {
        console.warn('[WatermarkPage] No valid apiData from getWatermarkSettings, keeping defaults');
      }
    } catch {
      toast.error('Failed to load watermark settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings };
      delete (payload as any).logo_url;
      console.log('[WatermarkPage] Saving payload:', payload);
      const result = await adminApi.updateWatermarkSettings(payload);
      console.log('[WatermarkPage] Save result:', result);
      if (!result.error) {
        toast.success('Watermark settings saved');
        setWatermarkSettings({
          enabled: settings.enabled,
          type: settings.type,
          logo_url: settings.logo_url,
          text: settings.text,
          text_color: settings.text_color,
          font_size: settings.font_size,
          font_family: settings.font_family,
          opacity: settings.opacity,
          position: settings.position,
          margin: settings.margin,
          rotation: settings.rotation,
          logo_scale: settings.logo_scale,
        });
        if (settings.enabled) {
          checkWatermarkConfiguration();
        }
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save watermark settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await adminApi.uploadWatermarkLogo(file);
      if (!result.error) {
        const url = (result as any)?.data?.logo_url || (result as any)?.data?.url || (result as any)?.url || '';
        if (url) {
          setSettings((prev) => ({ ...prev, logo_url: url }));
        }
        toast.success('Logo uploaded');
      } else {
        toast.error(result.error || 'Failed to upload logo');
      }
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const result = await adminApi.regenerateWatermarks();
      if (!result.error) {
        const data = result.data as any;
        const msg = data?.message || 'Watermarks regenerated';
        toast.success(msg);
      } else {
        toast.error(result.error || 'Failed to regenerate');
      }
    } catch {
      toast.error('Failed to regenerate watermarks');
    } finally {
      setRegenerating(false);
    }
  };

  const update = (key: keyof WatermarkSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary-50">
          <Shield className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Watermark Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure watermark applied to uploaded ad images
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="p-6">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Enable Watermark</p>
              <p className="text-sm text-gray-500">Apply watermark to all new uploaded images</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => update('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
            </div>
          </label>
        </div>

        {settings.enabled && (
          <>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('type', 'text')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                      settings.type === 'text'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    Text Watermark
                  </button>
                  <button
                    onClick={() => update('type', 'logo')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                      settings.type === 'logo'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Image className="w-4 h-4" />
                    Logo Watermark
                  </button>
                </div>
              </div>

              {settings.type === 'text' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={settings.text}
                      onChange={(e) => update('text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="iList"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                    <select
                      value={settings.font_family}
                      onChange={(e) => update('font_family', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {['Arial', 'Arial Black', 'Impact', 'Georgia', 'Times New Roman', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Courier New', 'Comic Sans MS'].map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                    <input
                      type="number"
                      min={8}
                      max={72}
                      value={settings.font_size}
                      onChange={(e) => update('font_size', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.text_color}
                        onChange={(e) => update('text_color', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <span className="text-sm text-gray-500 font-mono">{settings.text_color}</span>
                    </div>
                  </div>
                </div>
              )}

              {settings.type === 'logo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image</label>
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                        {settings.logo_url ? (
                          <img src={settings.logo_url} alt="Watermark logo" className="w-full h-full object-contain" />
                        ) : (
                          <Image className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploading ? 'Uploading...' : 'Upload Logo'}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/gif,image/webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        {settings.logo_url && (
                          <button
                            onClick={() => update('logo_url', null)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove logo
                          </button>
                        )}
                        <p className="text-xs text-gray-400">PNG, GIF, or WebP. Max 5MB.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={settings.position}
                    onChange={(e) => update('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.entries(POSITION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opacity ({settings.opacity}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.opacity}
                    onChange={(e) => update('opacity', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margin ({settings.margin}px)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.margin}
                    onChange={(e) => update('margin', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rotation ({settings.rotation}°)
                  </label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={settings.rotation}
                    onChange={(e) => update('rotation', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                {settings.type === 'logo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo Scale ({Math.round(settings.logo_scale * 100)}%)
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={50}
                      value={Math.round(settings.logo_scale * 100)}
                      onChange={(e) => {
                        const pct = Number(e.target.value);
                        update('logo_scale', Math.round(pct) / 100);
                      }}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="font-medium text-gray-900 text-sm">Apply To</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.apply_to_original}
                    onChange={(e) => update('apply_to_original', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Original images</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.apply_to_medium}
                    onChange={(e) => update('apply_to_medium', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Medium size</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.apply_to_thumbnail}
                    onChange={(e) => update('apply_to_thumbnail', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Thumbnails</span>
                </label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={settings.show_ad_id}
                  onChange={(e) => update('show_ad_id', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Include Ad ID in watermark text</span>
              </label>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {settings.enabled && (
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Queuing...' : 'Regenerate All Images'}
          </button>
        )}
        <button
          onClick={() => setPreviewEnabled(!previewEnabled)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {previewEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {previewEnabled ? 'Hide Preview' : 'Preview'}
        </button>
      </div>

      {previewEnabled && settings.enabled && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Watermark Preview</p>
          <div className="relative w-full max-w-md aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {settings.type === 'text' ? (
                <span
                  className="text-4xl font-bold select-none"
                  style={{
                    color: settings.text_color,
                    opacity: settings.opacity / 100,
                    fontFamily: settings.font_family,
                    transform: `rotate(${settings.rotation}deg)`,
                    textShadow: settings.shadow_color
                      ? `2px 2px 4px ${settings.shadow_color}${Math.round(settings.shadow_opacity * 2.55).toString(16).padStart(2, '0')}`
                      : 'none',
                  }}
                >
                  {settings.text}
                </span>
              ) : settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Watermark preview"
                  className="max-w-[40%] max-h-[40%] object-contain select-none"
                  style={{
                    opacity: settings.opacity / 100,
                    transform: `rotate(${settings.rotation}deg)`,
                  }}
                />
              ) : (
                <p className="text-sm text-gray-400">Upload a logo to preview</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
