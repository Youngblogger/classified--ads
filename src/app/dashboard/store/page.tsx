'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { storeApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import {
  Store, Upload, ImageIcon, Copy, Check, Eye, Users,
  BarChart3, Edit2, MapPin, Globe, Mail, Phone, Loader2,
  ExternalLink, Camera, RefreshCw, TrendingUp, Activity,
  Settings, Save, X, ChevronRight, AlertCircle, Plus,
  FileText, Link2, Clock, Calendar
} from 'lucide-react';

interface StoreData {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description: string;
  logo?: any;
  banner?: any;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  followers_count: number;
  ads_count: number;
  location?: string;
  created_at: string;
  views_this_week?: number;
}

interface StoreStats {
  followers: number;
  ads: number;
  views_week: number;
}

export default function DashboardStorePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuthStore();

  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<StoreStats>({ followers: 0, ads: 0, views_week: 0 });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
  });

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);
      const res = await storeApi.getMyStore();
      const data = (res.data as any)?.data || res.data;
      if (data && data.id) {
        setStore(data);
        setForm({
          name: data.name || '',
          description: data.description || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          website: data.website || '',
          instagram: data.instagram || '',
          twitter: data.twitter || '',
          facebook: data.facebook || '',
        });
        setStats({
          followers: data.followers_count || 0,
          ads: data.ads_count || 0,
          views_week: data.views_this_week || 0,
        });
      } else {
        setStore(null);
      }
    } catch {
      setStore(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Store name is required');
      return;
    }
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      if (form.description) fd.append('description', form.description);
      if (form.phone) fd.append('phone', form.phone);
      if (form.email) fd.append('email', form.email);
      if (form.address) fd.append('address', form.address);
      if (form.website) fd.append('website', form.website);
      if (form.instagram) fd.append('instagram', form.instagram);
      if (form.twitter) fd.append('twitter', form.twitter);
      if (form.facebook) fd.append('facebook', form.facebook);
      await storeApi.create(fd);
      toast.success('Store created successfully!');
      fetchStore();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to create store';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Store name is required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      if (form.description) fd.append('description', form.description);
      if (form.phone) fd.append('phone', form.phone);
      if (form.email) fd.append('email', form.email);
      if (form.address) fd.append('address', form.address);
      if (form.website) fd.append('website', form.website);
      if (form.instagram) fd.append('instagram', form.instagram);
      if (form.twitter) fd.append('twitter', form.twitter);
      if (form.facebook) fd.append('facebook', form.facebook);
      await storeApi.update(fd);
      toast.success('Store updated successfully!');
      setShowEditForm(false);
      fetchStore();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to update store';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await storeApi.uploadLogo(file);
      toast.success('Logo uploaded successfully!');
      fetchStore();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to upload logo';
      toast.error(msg);
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await storeApi.uploadBanner(file);
      toast.success('Banner uploaded successfully!');
      fetchStore();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to upload banner';
      toast.error(msg);
    }
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  const handleCopyUrl = () => {
    if (!store) return;
    const url = `${window.location.origin}/store/${store.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Store URL copied');
  };

  const getStoreUrl = () => {
    if (!store) return '';
    return `${window.location.origin}/store/${store.slug}`;
  };

  const getImageSrc = (img: any): string => {
    if (!img) return '';
    const url = img.full_url || img.display_url || img.url || '';
    return url || '';
  };

  const formatNumber = (n: number) => n.toLocaleString('en-US');

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl h-64 shadow-card animate-pulse" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Your Store</h2>
          <p className="text-gray-500 text-sm mt-1">Set up your storefront to start selling</p>
        </div>

        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="My Store"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tell customers about your store..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+234 800 000 0000"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="store@example.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Store location address"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {creating ? 'Creating...' : 'Create Store'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Store</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your storefront and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/store/${store.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Store
          </Link>
          <Link
            href="/dashboard/store/analytics"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Store URL */}
      <div className="bg-white rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-3">
          <Link2 className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600 truncate flex-1">{getStoreUrl()}</span>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Views This Week</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(stats.views_week)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Followers</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(stats.followers)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(stats.ads)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Engagement</p>
              <p className="text-xl font-bold text-gray-900">{stats.followers > 0 ? `${((stats.views_week / Math.max(stats.followers, 1)) * 100).toFixed(0)}%` : '0%'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info Card */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Banner + Logo */}
        <div className="relative">
          <div className="h-36 sm:h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative">
            {getImageSrc(store.banner) ? (
              <Image src={getImageSrc(store.banner)} alt="Store banner" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary-300" />
              </div>
            )}
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-700 hover:bg-white transition-colors shadow-sm"
              title="Upload banner"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 sm:-mt-16">
              <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-2xl shadow-card overflow-hidden border-4 border-white flex-shrink-0 relative group">
                {getImageSrc(store.logo) ? (
                  <Image src={getImageSrc(store.logo)} alt={store.name} width={112} height={112} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
                    <span className="text-white text-2xl font-bold">{store.name.charAt(0)}</span>
                  </div>
                )}
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{store.name}</h3>
                  <button
                    onClick={() => setShowEditForm(!showEditForm)}
                    className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Edit store info"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">Joined {formatDate(store.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {showEditForm && (
          <div className="border-t border-gray-100 px-6 py-5">
            <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                  placeholder="@username or URL"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input
                  type="text"
                  value={form.twitter}
                  onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))}
                  placeholder="@username or URL"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <input
                  type="text"
                  value={form.facebook}
                  onChange={e => setForm(f => ({ ...f, facebook: e.target.value }))}
                  placeholder="@username or URL"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info display (when not editing) */}
        {!showEditForm && (
          <div className="border-t border-gray-100 px-6 py-5">
            {store.description && (
              <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{store.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {store.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{store.phone}</span>
                </div>
              )}
              {store.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{store.email}</span>
                </div>
              )}
              {store.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{store.address}</span>
                </div>
              )}
              {store.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{store.website}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
