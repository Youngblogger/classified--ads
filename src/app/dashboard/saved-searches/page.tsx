'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { savedSearchesApi } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Bookmark, Search, Bell, Mail, Clock, Edit3, Trash2, Plus, X } from 'lucide-react';

interface SavedSearch {
  id: number;
  name: string;
  search_params: Record<string, any>;
  frequency: 'instant' | 'daily' | 'weekly';
  notify_email: boolean;
  notify_in_app: boolean;
  last_notified_at?: string | null;
  created_at: string;
  updated_at: string;
  results_count?: number;
}

interface SearchResult {
  id: number;
  title: string;
  slug?: string;
  price: number;
  currency: string;
  short_description?: string;
  images?: { url?: string; full_url?: string; is_primary?: boolean }[];
  location?: { name: string };
  created_at: string;
}

const FREQUENCIES = [
  { value: 'instant', label: 'Instant', color: 'bg-green-100 text-green-700' },
  { value: 'daily', label: 'Daily', color: 'bg-blue-100 text-blue-700' },
  { value: 'weekly', label: 'Weekly', color: 'bg-purple-100 text-purple-700' },
] as const;

function getFrequencyBadge(frequency: string) {
  const f = FREQUENCIES.find(f => f.value === frequency);
  if (!f) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${f.color}`}>
      <Clock className="w-3 h-3" />
      {f.label}
    </span>
  );
}

function formatSearchParams(params: Record<string, any>): string {
  const parts: string[] = [];
  if (params.keyword || params.q) parts.push(`"${params.keyword || params.q}"`);
  if (params.category) parts.push(params.category);
  if (params.location) parts.push(`in ${params.location}`);
  if (params.min_price || params.max_price) {
    const min = params.min_price || '0';
    const max = params.max_price || '∞';
    parts.push(`₦${min} - ₦${max}`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'All listings';
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [searchResults, setSearchResults] = useState<{ id: number; name: string; results: SearchResult[]; loading: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formFrequency, setFormFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant');
  const [formNotifyEmail, setFormNotifyEmail] = useState(true);
  const [formNotifyInApp, setFormNotifyInApp] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const fetchSearches = async () => {
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Request timed out. Please try again.');
    }, 10000);

    try {
      setLoading(true);
      setError(null);
      const res = await savedSearchesApi.getAll();
      clearTimeout(timeoutId);
      setSearches((res.data as any)?.data ?? []);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch saved searches:', err);
      setError('Failed to load saved searches. Please try again.');
      setSearches([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormFrequency('instant');
    setFormNotifyEmail(true);
    setFormNotifyInApp(true);
    setFormLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Please enter a name for the search');
      return;
    }
    setFormLoading(true);
    try {
      await savedSearchesApi.create({
        name: formName.trim(),
        search_params: {},
        frequency: formFrequency,
        notify_email: formNotifyEmail,
        notify_in_app: formNotifyInApp,
      });
      toast.success('Saved search created');
      setShowCreateModal(false);
      resetForm();
      fetchSearches();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create saved search');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (id: number, data: { name?: string; frequency?: string; notify_email?: boolean; notify_in_app?: boolean }) => {
    try {
      await savedSearchesApi.update(id, data);
      toast.success('Saved search updated');
      setEditingSearch(null);
      fetchSearches();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update saved search');
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await savedSearchesApi.delete(id);
      toast.success('Saved search deleted');
      setSearches(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete saved search');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRunSearch = async (search: SavedSearch) => {
    setSearchResults({ id: search.id, name: search.name, results: [], loading: true });
    try {
      const res = await savedSearchesApi.search(search.id);
      const data = (res.data as any)?.data ?? [];
      setSearchResults(prev => prev ? { ...prev, results: Array.isArray(data) ? data : [], loading: false } : null);
    } catch (err: any) {
      toast.error('Failed to run search');
      setSearchResults(prev => prev ? { ...prev, loading: false } : null);
    }
  };

  const handleToggleNotification = async (search: SavedSearch, field: 'notify_email' | 'notify_in_app') => {
    const newVal = !search[field];
    setSearches(prev => prev.map(s => s.id === search.id ? { ...s, [field]: newVal } : s));
    try {
      await savedSearchesApi.update(search.id, { [field]: newVal });
    } catch {
      setSearches(prev => prev.map(s => s.id === search.id ? { ...s, [field]: !newVal } : s));
      toast.error('Failed to update notification preference');
    }
  };

  const openEditModal = (search: SavedSearch) => {
    setEditingSearch(search);
    setFormName(search.name);
    setFormFrequency(search.frequency);
    setFormNotifyEmail(search.notify_email);
    setFormNotifyInApp(search.notify_in_app);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSearch) return;
    if (!formName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    setFormLoading(true);
    try {
      await savedSearchesApi.update(editingSearch.id, {
        name: formName.trim(),
        frequency: formFrequency,
        notify_email: formNotifyEmail,
        notify_in_app: formNotifyInApp,
      });
      toast.success('Saved search updated');
      setEditingSearch(null);
      resetForm();
      fetchSearches();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update saved search');
    } finally {
      setFormLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditingSearch(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saved Searches</h2>
          <p className="text-gray-500 text-sm mt-1">Save your search criteria and get notified when new listings match</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Saved Search
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded-full w-16" />
                <div className="h-6 bg-gray-100 rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchSearches}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && searches.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved searches yet</h3>
          <p className="text-gray-500 mb-6">Save your search criteria and we&apos;ll notify you when new listings match</p>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Create Your First Saved Search
          </button>
        </div>
      )}

      {/* Saved Searches List */}
      {!loading && !error && searches.length > 0 && (
        <div className="space-y-4">
          {searches.map(search => (
            <div
              key={search.id}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{search.name}</h3>
                    {getFrequencyBadge(search.frequency)}
                  </div>

                  <p className="text-sm text-gray-500 mb-3 truncate">
                    {formatSearchParams(search.search_params)}
                  </p>

                  {/* Notification Toggles */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <button
                      onClick={() => handleToggleNotification(search, 'notify_email')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                        search.notify_email
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </button>
                    <button
                      onClick={() => handleToggleNotification(search, 'notify_in_app')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                        search.notify_in_app
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      In-App
                    </button>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last notified: {formatDate(search.last_notified_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
                  <button
                    onClick={() => handleRunSearch(search)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm whitespace-nowrap"
                  >
                    <Search className="w-4 h-4" />
                    Run Search
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(search)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${search.name}"?`)) {
                          handleDelete(search.id);
                        }
                      }}
                      disabled={deletingId === search.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">New Saved Search</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g., 3-bedroom apartments in Lagos"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={formFrequency}
                  onChange={e => setFormFrequency(e.target.value as 'instant' | 'daily' | 'weekly')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                >
                  {FREQUENCIES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formNotifyEmail}
                      onChange={e => setFormNotifyEmail(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      Email notifications
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formNotifyInApp}
                      onChange={e => setFormNotifyInApp(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Bell className="w-4 h-4 text-gray-400" />
                      In-app notifications
                    </div>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Creating...' : 'Create Saved Search'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeEditModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Saved Search</h3>
              <button onClick={closeEditModal} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g., 3-bedroom apartments in Lagos"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={formFrequency}
                  onChange={e => setFormFrequency(e.target.value as 'instant' | 'daily' | 'weekly')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                >
                  {FREQUENCIES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formNotifyEmail}
                      onChange={e => setFormNotifyEmail(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      Email notifications
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formNotifyInApp}
                      onChange={e => setFormNotifyInApp(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Bell className="w-4 h-4 text-gray-400" />
                      In-app notifications
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Results Modal */}
      {searchResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSearchResults(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                <p className="text-sm text-gray-500">{searchResults.name}</p>
              </div>
              <button onClick={() => setSearchResults(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {searchResults.loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : searchResults.results.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No new results found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/ad/${result.slug || `ad-${result.id}`}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {result.images?.[0]?.url || result.images?.[0]?.full_url ? (
                          <img
                            src={result.images[0].url || result.images[0].full_url}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Search className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                        {result.short_description && (
                          <p className="text-sm text-gray-500 truncate">{result.short_description}</p>
                        )}
                        <p className="text-sm font-semibold text-primary-600 mt-1">
                          ₦{result.price?.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
