'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAdImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { nigeriaLocations } from '@/lib/nigeriaLocations';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import CompletionEngine from '@/components/profile/CompletionEngine';
import TrustReputation from '@/components/profile/TrustReputation';
import SellerMetrics from '@/components/profile/SellerMetrics';
import { DeviceSessions, AuditLogs, FingerprintInfo } from '@/components/profile/DeviceSecurity';
import { ErrorBoundary } from '@/components/profile/ErrorBoundary';
import { useAutoSave } from '@/components/profile/AutoSaveForm';
import {
  User, Mail, Phone, MapPin, Camera, Shield, Lock, Eye, EyeOff,
  TrendingUp, Clock, CheckCircle, XCircle,
  AlertCircle, LogOut, Download, Trash2, Bell,
  Settings, BarChart3, Heart, Star, Award, Upload, RefreshCw,
  Key, Smartphone, Loader2, Info, Activity, Globe, Wifi, WifiOff
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const BACKEND_URL = API_URL.replace('/api', '');

function getAvatarUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/storage/')) return `${BACKEND_URL}${url}`;
  return url;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-US')}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function timeAgo(date: string): string {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 2592000) return `${Math.floor(sec / 86400)}d ago`;
  return formatDate(date);
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading settings">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full" />
        <div className="space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
      <span className="sr-only">Loading settings data...</span>
    </div>
  );
}

import { EmptyState } from '@/components/ui/EmptyState';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const { isConnected } = useSocket({
    userId: user?.id || null,
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleRetry = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" role="main" aria-label="Settings">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account, profile, and preferences</p>
        </div>
        {isConnected ? (
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <Wifi className="w-3 h-3" /> Live
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            <WifiOff className="w-3 h-3" /> Offline
          </span>
        )}
      </div>

      <ErrorBoundary key={`overview-${refreshKey}`} onReset={handleRetry}>
        <OverviewSection user={user} setUser={setUser} />
      </ErrorBoundary>

      <ErrorBoundary key={`info-${refreshKey}`} onReset={handleRetry}>
        <InfoSection user={user} setUser={setUser} token={token} />
      </ErrorBoundary>

      <ErrorBoundary key={`photo-${refreshKey}`} onReset={handleRetry}>
        <PhotoSection user={user} setUser={setUser} token={token} />
      </ErrorBoundary>

      <ErrorBoundary key={`security-${refreshKey}`} onReset={handleRetry}>
        <SecuritySection />
      </ErrorBoundary>

      <ErrorBoundary key={`activity-${refreshKey}`} onReset={handleRetry}>
        <ActivitySection />
      </ErrorBoundary>

      <ErrorBoundary key={`account-${refreshKey}`} onReset={handleRetry}>
        <AccountSection user={user} />
      </ErrorBoundary>
    </div>
  );
}

/* ─── OVERVIEW SECTION ─── */
function OverviewSection({ user, setUser }: { user: any; setUser: any }) {
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    setStatsError(false);
    api.get('/my-ads').then(res => {
      const ads = res.data?.data || res.data || [];
      setStats({
        total: ads.length,
        active: ads.filter((a: any) => a.status === 'active').length,
        sold: ads.filter((a: any) => a.status === 'sold').length,
        views: ads.reduce((s: number, a: any) => s + (a.views || 0), 0),
        promoted: ads.filter((a: any) => a.is_promoted).length,
        total_views: ads.reduce((s: number, a: any) => s + (a.views || 0), 0),
        total_reviews: 0,
        avg_rating: 0,
        messages: 0,
      });
    }).catch(() => {
      setStatsError(true);
      setStats({ total: 0, active: 0, sold: 0, views: 0, promoted: 0, total_views: 0, total_reviews: 0, avg_rating: 0, messages: 0 });
    }).finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const avatarUrl = getAvatarUrl(user?.full_avatar_url || user?.avatar_url || user?.avatar || user?.google_avatar || user?.facebook_avatar);
  const memberSince = user?.created_at ? formatDate(user.created_at) : 'N/A';
  const isVerified = user?.email_verified_at || user?.verified;
  const phoneVerified = user?.phone_verified_at;

  const statCards = [
    { label: 'Total Ads', value: stats?.total ?? '-', icon: BarChart3, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active', value: stats?.active ?? '-', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Sold', value: stats?.sold ?? '-', icon: CheckCircle, color: 'bg-purple-50 text-purple-600' },
    { label: 'Views', value: stats?.total_views?.toLocaleString() ?? '-', icon: Eye, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Profile header">
        <div className="flex flex-row items-start gap-4 sm:gap-6">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden ring-4 ring-primary-50 flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={`${user?.name || 'User'}'s profile photo`} fill className="object-cover" sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px" />
            ) : (
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-600">{getInitials(user?.name || '')}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{user?.name || 'User'}</h1>
            <p className="text-sm sm:text-base text-gray-500 truncate">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-start gap-2 mt-3">
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> Email Verified
                </span>
              )}
              {phoneVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> Phone Verified
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                <Clock className="w-3.5 h-3.5" /> Joined {memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : statsError ? (
        <div className="bg-white rounded-2xl shadow-card p-6 text-center mt-6">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">Failed to load stats</p>
          <button onClick={fetchStats} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mt-6">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl shadow-card p-5" role="region" aria-label={s.label}>
                <div className={`inline-flex p-2.5 rounded-xl ${s.color} mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <CompletionEngine user={user} />
        <TrustReputation user={user} stats={stats} />
      </div>

      <SellerMetrics stats={stats} />
    </section>
  );
}

/* ─── PROFILE INFO SECTION ─── */
function InfoSection({ user, setUser, token }: { user: any; setUser: any; token: string | null }) {
  const [form, setForm] = useState({ name: '', review_display_name: '', email: '', phone: '', bio: '', gender: '', location: '', state: '', city: '', website: '', twitter: '', instagram: '' });
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const { restoreDraft, clearDraft, saveDraft } = useAutoSave('settings_info', form, true);

  useEffect(() => {
    if (user) {
      const loc = nigeriaLocations.find(l => l.slug === user.location);
      const restored = restoreDraft();
      if (restored && !draftRestored) {
        setForm(restored);
        setDraftRestored(true);
      } else {
        setForm({
          name: user.name || '',
          review_display_name: user.review_display_name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          gender: user.gender || '',
          location: user.location || '',
          state: loc?.name || '',
          city: user.city || '',
          website: user.website || '',
          twitter: user.twitter || '',
          instagram: user.instagram || '',
        });
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('review_display_name', form.review_display_name);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('bio', form.bio);
      fd.append('gender', form.gender);
      fd.append('location', form.location);
      fd.append('city', form.city);
      if (form.website) fd.append('website', form.website);
      if (form.twitter) fd.append('twitter', form.twitter);
      if (form.instagram) fd.append('instagram', form.instagram);

      const res = await fetch(`${API_URL.replace('/api', '')}/api/auth/profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'X-HTTP-Method-Override': 'PUT' },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update');
      const updated = { ...user, ...data.user, name: form.name, email: form.email, phone: form.phone, bio: form.bio, location: form.location };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      clearDraft();
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-8 space-y-6" aria-label="Profile information form" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="info-name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input id="info-name" name="name" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); saveDraft(); }} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" aria-required="true" />
            </div>
          </div>
          <div>
            <label htmlFor="info-review-display-name" className="block text-sm font-medium text-gray-700 mb-1.5">Review Display Name</label>
            <div className="relative">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input id="info-review-display-name" name="review_display_name" value={form.review_display_name} onChange={e => { setForm(p => ({ ...p, review_display_name: e.target.value })); saveDraft(); }} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" maxLength={30} placeholder="Optional: how you appear on reviews" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Public name shown on reviews (max 30 chars). Falls back to your full name.</p>
          </div>
          <div>
            <label htmlFor="info-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input id="info-email" name="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
            </div>
          </div>
          <div>
            <label htmlFor="info-phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input id="info-phone" name="phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
            </div>
          </div>
          <div>
            <label htmlFor="info-gender" className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
            <select id="info-gender" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="info-bio" className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea id="info-bio" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none" placeholder="Tell buyers about yourself..." />
          </div>
          <div>
            <label htmlFor="info-state" className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <select id="info-state" value={nigeriaLocations.find(l => l.name === form.state)?.slug || ''} onChange={e => {
              const loc = nigeriaLocations.find(l => l.slug === e.target.value);
              setForm(p => ({ ...p, state: loc?.name || '', location: e.target.value }));
            }} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
              <option value="">Select State</option>
              {nigeriaLocations.map(l => (
                <option key={l.id} value={l.slug}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="info-city" className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <input id="info-city" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          </div>
        </div>

        <hr className="border-gray-100" />
        <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label htmlFor="info-website" className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
            <input id="info-website" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label htmlFor="info-twitter" className="block text-sm font-medium text-gray-700 mb-1.5">Twitter</label>
            <input id="info-twitter" value={form.twitter} onChange={e => setForm(p => ({ ...p, twitter: e.target.value }))} placeholder="@username" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label htmlFor="info-instagram" className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
            <input id="info-instagram" value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@username" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {draftRestored && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Unsaved draft restored
            </span>
          )}
          <button type="submit" disabled={saving} className="ml-auto px-8 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ─── PHOTO SECTION ─── */
function PhotoSection({ user, setUser, token }: { user: any; setUser: any; token: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const currentUrl = getAvatarUrl(user?.full_avatar_url || user?.avatar_url || user?.avatar || user?.google_avatar || user?.facebook_avatar);

  const handleFile = async (f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    setCompressing(true);
    try {
      const { compressImage } = await import('@/lib/imageCompression');
      const compressed = await compressImage(f, { maxWidth: 1024, maxHeight: 1024, targetSizeKB: 200 });
      setFile(compressed.file);
      setPreview(compressed.preview);
      const savedBytes = ((f.size - compressed.size) / f.size * 100).toFixed(0);
      if (parseInt(savedBytes) > 10) toast.success(`Compressed by ${savedBytes}%`);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
      setFile(f);
    } finally {
      setCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch(`${API_URL.replace('/api', '')}/api/auth/profile/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      const updated = { ...user, ...data.user, full_avatar_url: data.user?.full_avatar_url || data.user?.avatar_url || data.user?.avatar };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Photo updated');
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setFile(null);
    setPreview(null);
    toast.success('Photo removed');
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h2>
      <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Profile photo management">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden ring-4 ring-primary-50">
            {(preview || currentUrl) ? (
              <Image src={preview || currentUrl} alt="Profile photo preview" fill className="object-cover" sizes="128px" />
            ) : (
              <span className="text-4xl font-bold text-primary-600">{getInitials(user?.name || '')}</span>
            )}
            {compressing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`w-full max-w-md border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
              dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
            aria-label="Upload profile photo. Click or drag and drop"
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-700">Drop image here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP. Max 10MB (auto-compressed to ~200KB WebP)</p>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {file && (
            <div className="flex items-center gap-3">
              <button onClick={handleUpload} disabled={uploading} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? 'Uploading...' : 'Save Photo'}
              </button>
              <button onClick={() => { setFile(null); setPreview(null); }} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                Cancel
              </button>
            </div>
          )}

          {!file && currentUrl && (
            <button onClick={handleRemove} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Remove photo
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── SECURITY SECTION ─── */
function SecuritySection() {
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow] = useState({ c: false, n: false, cf: false });
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [delPw, setDelPw] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const strength = pw.newPw ? getPasswordStrength(pw.newPw) : null;

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPw !== pw.confirm) { toast.error('Passwords do not match'); return; }
    if (pw.newPw.length < 8) { toast.error('Min 8 characters'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { current_password: pw.current, new_password: pw.newPw, new_password_confirmation: pw.confirm });
      toast.success('Password changed');
      setPw({ current: '', newPw: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!delPw) { toast.error('Enter your password'); return; }
    setDeleting(true);
    try {
      await api.post('/auth/delete-account', { password: delPw, confirm: 'DELETE' });
      toast.success('Account deleted');
      setShowDelete(false);
      setTimeout(() => { localStorage.clear(); window.location.href = '/'; }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Change password">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary-100 rounded-xl"><Lock className="w-5 h-5 text-primary-600" /></div>
            <div><h3 className="text-lg font-semibold text-gray-900">Change Password</h3><p className="text-sm text-gray-500">Update your password regularly</p></div>
          </div>
          <form onSubmit={handleChangePw} className="space-y-4 max-w-md" aria-label="Change password form">
            <div>
              <label htmlFor="pw-current" className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input id="pw-current" type={show.c ? 'text' : 'password'} value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} required className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" aria-required="true" />
                <button type="button" onClick={() => setShow(s => ({ ...s, c: !s.c }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label={show.c ? 'Hide password' : 'Show password'}>{show.c ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label htmlFor="pw-new" className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input id="pw-new" type={show.n ? 'text' : 'password'} value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} required minLength={8} className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" aria-required="true" />
                <button type="button" onClick={() => setShow(s => ({ ...s, n: !s.n }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label={show.n ? 'Hide password' : 'Show password'}>{show.n ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1" role="progressbar" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={6} aria-label={`Password strength: ${strength.label}`}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength.score ? strength.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color.replace('bg-', '').replace('red', '#ef4444').replace('yellow', '#eab308').replace('green', '#22c55e') }}>{strength.label}</p>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="pw-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input id="pw-confirm" type={show.cf ? 'text' : 'password'} value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" aria-required="true" />
                <button type="button" onClick={() => setShow(s => ({ ...s, cf: !s.cf }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label={show.cf ? 'Hide password' : 'Show password'}>{show.cf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <DeviceSessions />
        <AuditLogs />
        <FingerprintInfo />

        <div className="bg-white rounded-2xl shadow-card p-8 border border-red-100" role="region" aria-label="Delete account">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-100 rounded-xl"><Trash2 className="w-5 h-5 text-red-600" /></div>
            <div><h3 className="text-lg font-semibold text-gray-900">Delete Account</h3><p className="text-sm text-gray-500">Permanently delete your account</p></div>
          </div>
          <p className="text-sm text-gray-600 mb-4">Once deleted, all your ads, messages, and data will be permanently removed. This action cannot be undone.</p>
          <button onClick={() => setShowDelete(true)} className="px-6 py-2.5 border border-red-500 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors">Delete My Account</button>
        </div>

        {showDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-label="Confirm account deletion">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">Delete Account?</h3>
              <p className="text-sm text-gray-500 text-center mb-4">This cannot be undone. All data will be permanently removed.</p>
              <input type="password" value={delPw} onChange={e => setDelPw(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm mb-3 focus:outline-none focus:border-red-500" aria-label="Enter password to confirm deletion" />
              <p className="text-xs text-gray-500 mb-4 text-center">Type <strong>DELETE</strong> to confirm</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDelete(false); setDelPw(''); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button onClick={handleDelete} disabled={deleting || delPw.length === 0} className="px-4 py-2 bg-red-600 text-white rounded-xl disabled:opacity-50 flex items-center gap-2">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── ACTIVITY SECTION ─── */
function ActivitySection() {
  const [savedAds, setSavedAds] = useState<any[]>([]);
  const [recentAds, setRecentAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchActivity = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      api.get('/user/saved-ads').catch(() => ({ data: { data: [] } })),
      api.get('/user/recently-viewed').catch(() => ({ data: { data: [] } })),
    ]).then(([saved, recent]) => {
      setSavedAds(saved.data?.data || saved.data || []);
      setRecentAds(recent.data?.data || recent.data || []);
    }).catch(() => setError(true))
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  if (error) {
    return (
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity</h2>
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-3">Failed to load activity</p>
          <button onClick={fetchActivity} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Activity</h2>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Saved ads">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-50 rounded-xl"><Heart className="w-5 h-5 text-red-500" /></div>
            <h3 className="text-lg font-semibold text-gray-900">Saved Ads</h3>
          </div>
          {loading ? (
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : savedAds.length === 0 ? (
            <EmptyState customIcon={Heart} title="No saved ads yet" description="Ads you save will appear here" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {savedAds.slice(0, 4).map((ad: any) => (
                <div key={ad.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                    {getAdImageUrl(ad) && <Image src={getAdImageUrl(ad)} alt={ad.title || 'Saved ad'} width={56} height={56} className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                    <p className="text-xs text-gray-500">{ad.price ? formatNaira(ad.price) : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Recently viewed">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 rounded-xl"><Eye className="w-5 h-5 text-blue-500" /></div>
            <h3 className="text-lg font-semibold text-gray-900">Recently Viewed</h3>
          </div>
          {loading ? (
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : recentAds.length === 0 ? (
            <EmptyState customIcon={Eye} title="No recently viewed ads" description="Ads you view will appear here" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {recentAds.slice(0, 4).map((ad: any) => (
                <div key={ad.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                    {getAdImageUrl(ad) && <Image src={getAdImageUrl(ad)} alt={ad.title || 'Recently viewed ad'} width={56} height={56} className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                    <p className="text-xs text-gray-500">{ad.price ? formatNaira(ad.price) : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── ACCOUNT SECTION ─── */
function AccountSection({ user }: { user: any }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Account</h2>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Account details">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Member since</span>
              <span className="text-sm font-medium text-gray-900">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Account type</span>
              <span className="text-sm font-medium text-gray-900">{user?.role === 'admin' ? 'Admin' : 'Standard'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Email verified</span>
              <span className={`text-sm font-medium ${user?.email_verified_at ? 'text-green-600' : 'text-amber-600'}`}>
                {user?.email_verified_at ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Phone verified</span>
              <span className={`text-sm font-medium ${user?.phone_verified_at ? 'text-green-600' : 'text-amber-600'}`}>
                {user?.phone_verified_at ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Last login</span>
              <span className="text-sm font-medium text-gray-900">{user?.last_login_at ? formatDate(user.last_login_at) : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">User ID</span>
              <span className="text-sm font-medium text-gray-900">#{user?.id || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Download data">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gray-100 rounded-xl"><Download className="w-5 h-5 text-gray-600" /></div>
            <div><h3 className="text-lg font-semibold text-gray-900">Download Your Data</h3><p className="text-sm text-gray-500">Get a copy of your account data</p></div>
          </div>
          <p className="text-xs text-gray-500 mb-4">Request an export of your profile, ads, messages, and transaction history.</p>
          <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Request Data Export
          </button>
        </div>
      </div>
    </section>
  );
}
