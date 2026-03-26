'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  X,
  Loader2,
  Filter,
  Save,
  Clock,
  ImageIcon
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { getAdImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Ad {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency?: string;
  condition?: string;
  status: string;
  is_verified: boolean;
  category: { id: number; name: string; slug: string };
  location: { id: number; name: string } | null;
  user: { id: number; name: string; email: string; phone?: string; avatar?: string; avatar_url?: string };
  images: { id: number; url?: string; display_url?: string; thumbnail_url?: string; is_primary: boolean; full_url?: string; full_thumbnail_url?: string }[];
  views: number;
  created_at: string;
}

export default function AdsApprovalPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    status: 'pending'
  });
  const [approvalSettings, setApprovalSettings] = useState({
    auto_approval_enabled: false,
    approval_duration_minutes: 2,
    max_images_per_ad: 10,
    ad_expiration_days: 30,
  });

  useEffect(() => {
    fetchPendingAds();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await adminApi.getSettings();
      if (res.data) {
        setApprovalSettings({
          auto_approval_enabled: res.data.auto_approval_enabled ?? false,
          approval_duration_minutes: res.data.approval_duration_minutes ?? 2,
          max_images_per_ad: res.data.max_images_per_ad ?? 10,
          ad_expiration_days: res.data.ad_expiration_days ?? 30,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveApprovalSettings = async () => {
    try {
      setSavingSettings(true);
      const currentSettings = await adminApi.getSettings();
      const updatedSettings = { ...currentSettings.data, ...approvalSettings };
      await adminApi.updateSettings(updatedSettings);
      toast.success('Approval settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const getImageUrl = (ad: Ad): string => {
    return getAdImageUrl(ad);
  };

  const fetchPendingAds = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAds({ status: 'pending' });
      setAds(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adId: number) => {
    try {
      setActionLoading(adId);
      await adminApi.approveAd(adId);
      toast.success('Ad approved successfully! The ad is now live and visible to users.');
      fetchPendingAds();
    } catch (error) {
      console.error('Failed to approve ad:', error);
      toast.error('Failed to approve ad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (adId: number) => {
    try {
      setActionLoading(adId);
      await adminApi.rejectAd(adId);
      toast.success('Ad rejected. The seller has been notified.');
      fetchPendingAds();
    } catch (error) {
      console.error('Failed to reject ad:', error);
      toast.error('Failed to reject ad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (adId: number) => {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) return;
    try {
      setActionLoading(adId);
      await adminApi.deleteAd(adId);
      toast.success('Ad deleted successfully');
      fetchPendingAds();
    } catch (error) {
      console.error('Failed to delete ad:', error);
      toast.error('Failed to delete ad');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (ad: Ad) => {
    setSelectedAd(ad);
    setEditForm({
      title: ad.title,
      description: ad.description,
      price: ad.price.toString(),
      status: ad.status
    });
    setEditMode(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd) return;
    
    try {
      setActionLoading(selectedAd.id);
      // Update ad - you may need to add this API method
      await adminApi.updateAd(selectedAd.id, {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        status: editForm.status
      });
      toast.success('Ad updated successfully');
      setEditMode(false);
      setSelectedAd(null);
      fetchPendingAds();
    } catch (error) {
      console.error('Failed to update ad:', error);
      toast.error('Failed to update ad');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAds = ads.filter(ad =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Approval Settings Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-gray-900">Approval Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Auto Approval</h3>
              <p className="text-sm text-gray-500">Auto-approve ads after duration</p>
            </div>
            <button
              onClick={() => setApprovalSettings({ ...approvalSettings, auto_approval_enabled: !approvalSettings.auto_approval_enabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                approvalSettings.auto_approval_enabled ? 'bg-sky-600' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                approvalSettings.auto_approval_enabled ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Duration
            </label>
            <select
              value={approvalSettings.approval_duration_minutes}
              onChange={(e) => setApprovalSettings({ ...approvalSettings, approval_duration_minutes: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              disabled={!approvalSettings.auto_approval_enabled}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Images Per Ad
            </label>
            <input
              type="number"
              value={approvalSettings.max_images_per_ad}
              onChange={(e) => setApprovalSettings({ ...approvalSettings, max_images_per_ad: Number(e.target.value) })}
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
              value={approvalSettings.ad_expiration_days}
              onChange={(e) => setApprovalSettings({ ...approvalSettings, ad_expiration_days: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              min={1}
              max={365}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={saveApprovalSettings}
            disabled={savingSettings}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Pending Ads Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Approval Settings</h1>
          <p className="text-gray-500 mt-1">Configure approval workflow and review pending ads</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            {filteredAds.length} Pending
          </span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search pending ads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">All Caught Up!</h3>
          <p className="text-gray-500 mt-1">No pending ads to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Ad Image */}
                <div className="w-full lg:w-48 h-48 relative rounded-lg overflow-hidden bg-gray-100">
                  {ad.images && ad.images.length > 0 ? (
                    <>
                      <img
                        src={getImageUrl(ad)}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-gray-400 hidden">
                        <ImageIcon className="w-8 h-8" />
                        <span className="ml-2 text-sm">No Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                      <span className="ml-2 text-sm">No Image</span>
                    </div>
                  )}
                </div>

                {/* Ad Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted by {ad.user.name} • {formatDate(ad.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        Pending Review
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mt-3 line-clamp-2">{ad.description}</p>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-semibold text-gray-900">₦{ad.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">{ad.category.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{ad.location?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Condition</p>
                      <p className="font-medium text-gray-900 capitalize">{ad.condition || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Views</p>
                      <p className="font-medium text-gray-900">{ad.views}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(ad)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleApprove(ad.id)}
                      disabled={actionLoading === ad.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === ad.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Accept</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(ad.id)}
                      disabled={actionLoading === ad.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === ad.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      disabled={actionLoading === ad.id}
                      className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editMode && selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setEditMode(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit Ad</h2>
              <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === selectedAd.id}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
                >
                  {actionLoading === selectedAd.id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
