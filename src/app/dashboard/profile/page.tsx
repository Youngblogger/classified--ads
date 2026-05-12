'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { api, authApi, walletApi } from '@/lib/api';
import { nigeriaLocations } from '@/lib/nigeriaLocations';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, MapPin, Camera, Shield, Lock, Eye, EyeOff,
  Wallet, CreditCard, TrendingUp, Clock, CheckCircle, XCircle,
  AlertCircle, ChevronDown, ChevronRight, LogOut, Download,
  Trash2, Bell, Globe, Settings, BarChart3, Heart, Star,
  Award, Upload, RefreshCw, Key, Smartphone, Users,
  Share2, MessageCircle, FileText, Plus, Minus,
  Menu, Loader2, Info, Gift, Activity,
  Moon, Sun, ToggleLeft, ToggleRight
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const BACKEND_URL = API_URL.replace('/api', '');

type TabId = 'overview' | 'info' | 'photo' | 'security' | 'wallet' | 'activity' | 'account';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'info', label: 'Profile Info', icon: Settings },
  { id: 'photo', label: 'Photo', icon: Camera },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'account', label: 'Account', icon: FileText },
];

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
    <div className="animate-pulse space-y-6">
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
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Mobile Tab Selector */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-2xl shadow-card"
        >
          <div className="flex items-center gap-3">
            {(() => {
              const TabIcon = tabs.find(t => t.id === activeTab)?.icon || User;
              return <TabIcon className="w-5 h-5 text-primary-600" />;
            })()}
            <span className="font-medium text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </span>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
        {mobileMenuOpen && (
          <div className="mt-2 bg-white rounded-2xl shadow-card overflow-hidden">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20 space-y-1 bg-white rounded-2xl shadow-card p-2">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <TabIcon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && <OverviewTab user={user} setUser={setUser} />}
          {activeTab === 'info' && <InfoTab user={user} setUser={setUser} token={token} />}
          {activeTab === 'photo' && <PhotoTab user={user} setUser={setUser} token={token} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'wallet' && <WalletTab />}
          {activeTab === 'activity' && <ActivityTab />}
          {activeTab === 'account' && <AccountTab user={user} />}
        </div>
      </div>
    </div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ user, setUser }: { user: any; setUser: any }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/my-ads').then(res => {
      const ads = res.data?.data || res.data || [];
      setStats({
        total: ads.length,
        active: ads.filter((a: any) => a.status === 'active').length,
        sold: ads.filter((a: any) => a.status === 'sold').length,
        views: ads.reduce((s: number, a: any) => s + (a.views || 0), 0),
        promoted: ads.filter((a: any) => a.is_promoted).length,
      });
    }).catch(() => setStats({ total: 0, active: 0, sold: 0, views: 0, promoted: 0 }));
  }, []);

  const avatarUrl = getAvatarUrl(user?.full_avatar_url || user?.avatar_url || user?.avatar || user?.google_avatar || user?.facebook_avatar);
  const memberSince = user?.created_at ? formatDate(user.created_at) : 'N/A';
  const isVerified = user?.email_verified_at || user?.verified;
  const phoneVerified = user?.phone_verified_at;

  const statCards = [
    { label: 'Total Ads', value: stats?.total ?? '-', icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active', value: stats?.active ?? '-', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Sold', value: stats?.sold ?? '-', icon: CheckCircle, color: 'bg-purple-50 text-purple-600' },
    { label: 'Views', value: stats?.views ?? '-', icon: Eye, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden ring-4 ring-primary-50 flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" sizes="96px" />
            ) : (
              <span className="text-3xl font-bold text-primary-600">{getInitials(user?.name || '')}</span>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl shadow-card p-5">
              <div className={`inline-flex p-2.5 rounded-xl ${s.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Profile Completion */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Profile Completion</h3>
        {(() => {
          const checks = [
            { label: 'Full name', done: !!user?.name && user.name.length > 2, pct: 20 },
            { label: 'Email verified', done: !!user?.email_verified_at || !!user?.verified, pct: 20 },
            { label: 'Phone number', done: !!user?.phone, pct: 20 },
            { label: 'Profile photo', done: !!(user?.avatar || user?.avatar_url || user?.full_avatar_url), pct: 20 },
            { label: 'Location set', done: !!user?.location, pct: 20 },
          ];
          const pct = checks.reduce((s, c) => s + (c.done ? c.pct : 0), 0);
          const missing = checks.filter(c => !c.done);
          return (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-lg font-bold text-primary-600">{pct}%</span>
              </div>
              {missing.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Complete these to build trust:</p>
                  {missing.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
              {missing.length === 0 && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Profile complete!
                </p>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

/* ─── PROFILE INFO TAB ─── */
function InfoTab({ user, setUser, token }: { user: any; setUser: any; token: string | null }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '', gender: '', location: '', state: '', city: '', website: '', twitter: '', instagram: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const loc = nigeriaLocations.find(l => l.slug === user.location);
      setForm({
        name: user.name || '',
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
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
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
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 sm:p-8 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input name="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input name="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input name="phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
          <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none" placeholder="Tell buyers about yourself..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
          <select value={nigeriaLocations.find(l => l.name === form.state)?.slug || ''} onChange={e => {
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
          <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
        </div>
      </div>

      <hr className="border-gray-100" />
      <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
          <input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Twitter</label>
          <input value={form.twitter} onChange={e => setForm(p => ({ ...p, twitter: e.target.value }))} placeholder="@username" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
          <input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@username" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving} className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

/* ─── PHOTO TAB ─── */
function PhotoTab({ user, setUser, token }: { user: any; setUser: any; token: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const currentUrl = getAvatarUrl(user?.full_avatar_url || user?.avatar_url || user?.avatar || user?.google_avatar || user?.facebook_avatar);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Photo</h3>
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden ring-4 ring-primary-50">
            {(preview || currentUrl) ? (
              <Image src={preview || currentUrl} alt="" fill className="object-cover" sizes="128px" />
            ) : (
              <span className="text-4xl font-bold text-primary-600">{getInitials(user?.name || '')}</span>
            )}
          </div>

          {/* Drop zone */}
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`w-full max-w-md border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
              dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Drop image here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP. Max 5MB</p>
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
    </div>
  );
}

/* ─── SECURITY TAB ─── */
function SecurityTab() {
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

  const sessions = [
    { device: 'Chrome on Windows', ip: '102.89.22.1', time: '2 hours ago', current: true },
    { device: 'Safari on iPhone', ip: '102.89.22.1', time: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary-100 rounded-xl"><Lock className="w-5 h-5 text-primary-600" /></div>
          <div><h3 className="text-lg font-semibold text-gray-900">Change Password</h3><p className="text-sm text-gray-500">Update your password regularly</p></div>
        </div>
        <form onSubmit={handleChangePw} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input type={show.c ? 'text' : 'password'} value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} required className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
              <button type="button" onClick={() => setShow(s => ({ ...s, c: !s.c }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show.c ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input type={show.n ? 'text' : 'password'} value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} required minLength={8} className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
              <button type="button" onClick={() => setShow(s => ({ ...s, n: !s.n }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show.n ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            {strength && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength.score ? strength.color : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strength.color.replace('bg-', '').replace('red', '#ef4444').replace('yellow', '#eab308').replace('green', '#22c55e') }}>{strength.label}</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input type={show.cf ? 'text' : 'password'} value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
              <button type="button" onClick={() => setShow(s => ({ ...s, cf: !s.cf }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show.cf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-purple-100 rounded-xl"><Smartphone className="w-5 h-5 text-purple-600" /></div>
          <div><h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3><p className="text-sm text-gray-500">Devices logged into your account</p></div>
        </div>
        <div className="space-y-4">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg"><Smartphone className="w-4 h-4 text-gray-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.device} {s.current && <span className="text-xs text-green-600 font-medium ml-1">Current</span>}</p>
                  <p className="text-xs text-gray-500">IP: {s.ip} · {s.time}</p>
                </div>
              </div>
              {!s.current && <button className="text-xs text-red-600 hover:text-red-700 font-medium">Logout</button>}
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium">Logout from all devices</button>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-red-100 rounded-xl"><Trash2 className="w-5 h-5 text-red-600" /></div>
          <div><h3 className="text-lg font-semibold text-gray-900">Delete Account</h3><p className="text-sm text-gray-500">Permanently delete your account</p></div>
        </div>
        <p className="text-sm text-gray-600 mb-4">Once deleted, all your ads, messages, and data will be permanently removed.</p>
        <button onClick={() => setShowDelete(true)} className="px-6 py-2.5 border border-red-500 text-red-600 rounded-xl font-medium hover:bg-red-50">Delete My Account</button>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Account?</h3>
            <p className="text-gray-600 mb-4 text-sm">This cannot be undone. All data will be permanently removed.</p>
            <input type="password" value={delPw} onChange={e => setDelPw(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm mb-3 focus:outline-none focus:border-red-500" />
            <p className="text-xs text-gray-500 mb-4">Type <strong>DELETE</strong> to confirm</p>
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
  );
}

/* ─── WALLET TAB ─── */
function WalletTab() {
  const [wallet, setWallet] = useState<{ balance: number; pending: number } | null>(null);
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [funding, setFunding] = useState(false);
  const [showFund, setShowFund] = useState(false);

  const fetchWallet = useCallback(async () => {
    try {
      const [wRes, tRes] = await Promise.all([
        walletApi.getBalance().catch(() => ({ data: { balance: 0, pending_balance: 0 } })),
        walletApi.getTransactions().catch(() => ({ data: { data: [] } })),
      ]);
      setWallet({ balance: wRes.data?.balance ?? 0, pending: wRes.data?.pending_balance ?? 0 });
      setTxns(tRes.data?.data || tRes.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const handleFund = async () => {
    const amt = parseInt(fundAmount);
    if (!amt || amt < 100) { toast.error('Minimum ₦100'); return; }
    setFunding(true);
    try {
      const res = await walletApi.fundWallet(amt, 'paystack');
      if (res.data?.authorization_url) window.location.href = res.data.authorization_url;
      else if (res.data?.reference) {
        const verify = await walletApi.verifyPayment(res.data.reference);
        if (verify.data?.success) { toast.success('Wallet funded!'); fetchWallet(); setShowFund(false); setFundAmount(''); }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Funding failed');
    } finally {
      setFunding(false);
    }
  };

  if (loading) return <div className="bg-white rounded-2xl shadow-card p-8"><ProfileSkeleton /></div>;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-card p-6 sm:p-8 text-white">
        <p className="text-sm font-medium text-primary-100">Available Balance</p>
        <p className="text-4xl font-bold mt-1">{formatNaira(wallet?.balance || 0)}</p>
        <p className="text-sm text-primary-200 mt-1">Pending: {formatNaira(wallet?.pending || 0)}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowFund(true)} className="px-6 py-2.5 bg-white text-primary-700 rounded-xl font-medium hover:bg-primary-50 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Fund Wallet
          </button>
          <button className="px-6 py-2.5 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Withdraw
          </button>
        </div>
      </div>

      {showFund && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Fund Wallet</h3>
          <div className="flex items-center gap-3 max-w-sm">
            <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="Amount (min ₦100)" className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500" />
            <button onClick={handleFund} disabled={funding} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2">
              {funding && <Loader2 className="w-4 h-4 animate-spin" />}
              {funding ? 'Processing...' : 'Fund'}
            </button>
            <button onClick={() => setShowFund(false)} className="p-2.5 text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        {txns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm">Fund your wallet to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {txns.slice(0, 10).map((t: any, i: number) => (
              <div key={t.id || i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {t.type === 'credit' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <CreditCard className="w-4 h-4 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.description || t.type}</p>
                    <p className="text-xs text-gray-500">{t.created_at ? timeAgo(t.created_at) : ''}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'credit' ? '+' : '-'}{formatNaira(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ACTIVITY TAB ─── */
function ActivityTab() {
  const [savedAds, setSavedAds] = useState<any[]>([]);
  const [recentAds, setRecentAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/user/saved-ads').catch(() => ({ data: { data: [] } })),
      api.get('/user/recently-viewed').catch(() => ({ data: { data: [] } })),
    ]).then(([saved, recent]) => {
      setSavedAds(saved.data?.data || saved.data || []);
      setRecentAds(recent.data?.data || recent.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Saved Ads */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-red-50 rounded-xl"><Heart className="w-5 h-5 text-red-500" /></div>
          <h3 className="text-lg font-semibold text-gray-900">Saved Ads</h3>
        </div>
        {loading ? (
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ) : savedAds.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Heart className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No saved ads yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAds.slice(0, 4).map((ad: any) => (
              <div key={ad.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                  {ad.image && <Image src={ad.image} alt="" width={56} height={56} className="object-cover" />}
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

      {/* Recently Viewed */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-50 rounded-xl"><Eye className="w-5 h-5 text-blue-500" /></div>
          <h3 className="text-lg font-semibold text-gray-900">Recently Viewed</h3>
        </div>
        {loading ? (
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ) : recentAds.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Eye className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No recently viewed ads</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentAds.slice(0, 4).map((ad: any) => (
              <div key={ad.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                  {ad.image && <Image src={ad.image} alt="" width={56} height={56} className="object-cover" />}
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
  );
}

/* ─── ACCOUNT TAB ─── */
function AccountTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      {/* Member Info */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
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
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">Phone verified</span>
            <span className={`text-sm font-medium ${user?.phone_verified_at ? 'text-green-600' : 'text-amber-600'}`}>
              {user?.phone_verified_at ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Download Data */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gray-100 rounded-xl"><Download className="w-5 h-5 text-gray-600" /></div>
          <div><h3 className="text-lg font-semibold text-gray-900">Download Your Data</h3><p className="text-sm text-gray-500">Get a copy of your account data</p></div>
        </div>
        <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2">
          <Download className="w-4 h-4" /> Request Data Export
        </button>
      </div>
    </div>
  );
}
