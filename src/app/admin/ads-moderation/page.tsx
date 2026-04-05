'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Wrench,
  Trash2,
  ImageIcon,
  Loader2,
  CheckSquare,
  Square,
  Filter,
  BarChart3,
  Clock,
  Eye,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Ad {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency?: string;
  status: string;
  is_verified: boolean;
  is_featured?: boolean;
  is_seeded?: boolean;
  is_flagged?: boolean;
  quality_score?: number;
  quality_flags?: string[];
  category: { name: string; slug: string };
  location: { name: string } | null;
  lga?: string;
  user: { name: string; verified: boolean };
  images: { url?: string; display_url?: string; thumbnail_url?: string; is_primary: boolean; full_url?: string; full_thumbnail_url?: string }[];
  views: number;
  created_at: string;
}

interface Stats {
  quality: {
    total: number;
    flagged: number;
    clean: number;
    average_score: number;
    by_score_range: { good: number; fair: number; poor: number };
  };
  images: {
    duplicate_image_count: number;
    most_shared_images: { url: string; ad_count: number }[];
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  
  let token = localStorage.getItem('admin_token');
  if (!token) {
    token = localStorage.getItem('authToken');
  }
  if (!token) {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      } catch {}
    }
  }
  if (!token) {
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    token = cookieToken || null;
  }
  
  console.log('[Admin] Token being used:', token ? token.substring(0, 20) + '...' : 'none');
  return token || '';
};

export default function AdsModerationPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedAds, setSelectedAds] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'clean'>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'good' | 'fair' | 'poor'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [fixingAll, setFixingAll] = useState(false);

  useEffect(() => {
    fetchAds();
    fetchStats();
  }, [filter, scoreFilter]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filter === 'flagged') params.filter = 'flagged';
      if (filter === 'clean') params.filter = 'clean';
      if (scoreFilter !== 'all') params.score_range = scoreFilter;

      const res = await fetch(`${API_URL}/admin/ads/moderation`, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Accept': 'application/json',
        },
      });
      if (!res.ok) {
        console.error('Failed to fetch ads:', res.status, res.statusText);
        if (res.status === 401) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/admin/login';
          return;
        }
        setAds([]);
        return;
      }
      const data = await res.json();
      setAds(data.data || []);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      toast.error('Failed to load ads');
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/ads/moderation/stats`, {
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Accept': 'application/json',
        },
      });
      if (!res.ok) {
        console.error('Failed to fetch stats:', res.status, res.statusText);
        if (res.status === 401) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/admin/login';
          return;
        }
        setStats(null);
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats(null);
    }
  };

  const analyzeAll = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch(`${API_URL}/admin/ads/moderation/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      toast.success(`Analyzed ${data.total_analyzed} ads`);
      fetchAds();
      fetchStats();
    } catch (error) {
      toast.error('Failed to analyze ads');
    } finally {
      setAnalyzing(false);
    }
  };

  const fixAd = async (adId: number) => {
    console.log('[Admin] Fix button clicked for ad:', adId);
    try {
      setActionLoading(adId);
      console.log('[Admin] Calling fix API for ad:', adId);
      const res = await fetch(`${API_URL}/admin/ads/${adId}/fix`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Accept': 'application/json',
        },
      });
      console.log('[Admin] Fix API response status:', res.status);
      const data = await res.json();
      console.log('[Admin] Fix API response data:', data);
      if (data.success) {
        toast.success(`Ad fixed! New score: ${data.new_score}`);
        fetchAds();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to fix ad');
      }
    } catch (error) {
      console.error('[Admin] Fix ad error:', error);
      toast.error('Failed to fix ad');
    } finally {
      setActionLoading(null);
    }
  };

  const fixAllFlagged = async (useQueue = false) => {
    try {
      setFixingAll(true);
      const res = await fetch(`${API_URL}/admin/ads/moderation/fix-all?queue=${useQueue}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (useQueue) {
        toast.success(data.message);
      } else {
        toast.success(`Fixed ${data.succeeded}/${data.total} ads`);
        fetchAds();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to fix ads');
    } finally {
      setFixingAll(false);
    }
  };

  const fixSelected = async () => {
    if (selectedAds.length === 0) return;
    try {
      setActionLoading(-1);
      const res = await fetch(`${API_URL}/admin/ads/moderation/bulk-fix`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ad_ids: selectedAds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Fixed ${data.succeeded}/${data.total} ads`);
        setSelectedAds([]);
        fetchAds();
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fix selected ads');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteImages = async (adId: number) => {
    if (!confirm('Delete all images from this ad?')) return;
    try {
      setActionLoading(adId);
      const res = await fetch(`${API_URL}/admin/ads/${adId}/delete-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Images deleted');
        fetchAds();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete images');
    } finally {
      setActionLoading(null);
    }
  };

  const replaceImages = async (adId: number) => {
    if (!confirm('Replace all images with new category-appropriate images?')) return;
    try {
      setActionLoading(adId);
      const res = await fetch(`${API_URL}/admin/ads/${adId}/replace-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken() || ''}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Images replaced (${data.new_image_count} new images)`);
        fetchAds();
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to replace images');
    } finally {
      setActionLoading(null);
    }
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined) return null;
    if (score >= 80) return { color: 'bg-green-100 text-green-700', label: 'Good' };
    if (score >= 50) return { color: 'bg-yellow-100 text-yellow-700', label: 'Fair' };
    return { color: 'bg-red-100 text-red-700', label: 'Poor' };
  };

  const getImageUrl = (ad: Ad): string => {
    const img = ad.images?.find(i => i.is_primary) || ad.images?.[0];
    if (!img) return '';
    return img.full_url || img.display_url || img.url || img.thumbnail_url || '';
  };

  const filteredAds = ads.filter(ad => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return ad.title?.toLowerCase().includes(term) || ad.category?.name?.toLowerCase().includes(term);
    }
    return true;
  });

  const selectAll = () => {
    if (selectedAds.length === filteredAds.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(filteredAds.map(ad => ad.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Quality & Moderation</h1>
          <p className="text-gray-500 mt-1">Analyze and fix ad quality issues</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => analyzeAll()}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Analyze All
          </button>
          <button
            onClick={() => fixAllFlagged(false)}
            disabled={fixingAll || (stats?.quality?.flagged || 0) === 0}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {fixingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
            Auto Fix All ({stats?.quality?.flagged || 0})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.quality?.total || 0}</p>
                <p className="text-sm text-gray-500">Total Ads</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats?.quality?.clean || 0}</p>
                <p className="text-sm text-gray-500">Clean</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats?.quality?.flagged || 0}</p>
                <p className="text-sm text-gray-500">Flagged</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.quality?.average_score || 0}</p>
                <p className="text-sm text-gray-500">Avg Score</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats?.quality?.by_score_range?.fair || 0}</p>
                <p className="text-sm text-gray-500">Fair (50-79)</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats?.images?.duplicate_image_count || 0}</p>
                <p className="text-sm text-gray-500">Dup Images</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setFilter('all'); setScoreFilter('all'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all' && scoreFilter === 'all' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Ads
          </button>
          <button
            onClick={() => { setFilter('flagged'); setScoreFilter('all'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Flagged Only
          </button>
          <button
            onClick={() => { setFilter('clean'); setScoreFilter('all'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'clean' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Clean Only
          </button>
          <select
            value={scoreFilter}
            onChange={(e) => { setScoreFilter(e.target.value as any); setFilter('all'); }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 border-0 focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Scores</option>
            <option value="good">Good (80+)</option>
            <option value="fair">Fair (50-79)</option>
            <option value="poor">Poor (&lt;50)</option>
          </select>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAds.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
          <span className="text-sm font-medium text-orange-800">
            {selectedAds.length} ad(s) selected
          </span>
          <button
            onClick={fixSelected}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <Wrench className="w-4 h-4" />
            Fix Selected
          </button>
          <button
            onClick={() => setSelectedAds([])}
            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Ads Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
            <p className="text-gray-500">No ads match your filter criteria.</p>
          </div>
        ) : (
          filteredAds.map((ad) => {
            const badge = getScoreBadge(ad.quality_score);
            const isLoading = actionLoading === ad.id;
            
            return (
              <div
                key={ad.id}
                className={`bg-white rounded-xl border ${ad.is_flagged ? 'border-red-300' : 'border-gray-200'} p-4`}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex items-start pt-1">
                    <button
                      onClick={() => setSelectedAds(prev =>
                        prev.includes(ad.id) ? prev.filter(id => id !== ad.id) : [...prev, ad.id]
                      )}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {selectedAds.includes(ad.id) ? (
                        <CheckSquare className="w-5 h-5 text-sky-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {getImageUrl(ad) ? (
                      <img
                        src={getImageUrl(ad)}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    {ad.is_flagged && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">{ad.title}</h3>
                        <p className="text-sm text-gray-500">{ad.category?.name}</p>
                        {ad.is_seeded && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Seeded
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {badge && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                            {badge.label}: {ad.quality_score}
                          </span>
                        )}
                        {ad.is_verified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    {/* Flags */}
                    {ad.quality_flags && ad.quality_flags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ad.quality_flags.map((flag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {ad.is_seeded ? (
                        <>
                          <button
                            onClick={() => {
                              console.log('[Admin] Clicked Fix for ad:', ad.id);
                              fixAd(ad.id);
                            }}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm disabled:opacity-50"
                          >
                            {actionLoading === ad.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
                            Fix
                          </button>
                          <button
                            onClick={() => {
                              console.log('[Admin] Clicked Replace Images for ad:', ad.id);
                              replaceImages(ad.id);
                            }}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm disabled:opacity-50"
                          >
                            {actionLoading === ad.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            Replace Images
                          </button>
                          <button
                            onClick={() => {
                              console.log('[Admin] Clicked Delete Images for ad:', ad.id);
                              deleteImages(ad.id);
                            }}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm disabled:opacity-50"
                          >
                            {actionLoading === ad.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Delete Images
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Real user ad - manual review required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
