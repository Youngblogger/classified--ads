'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Facebook, Instagram, ExternalLink, Calendar, Send, Plus, Trash2, Play, Pause, Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Ad {
  id: number;
  title: string;
  slug: string;
  price?: number;
  status: string;
  category_id?: number;
  images?: Array<{ url: string; is_primary: boolean }>;
}

interface SocialPost {
  id: number;
  ad_id: number;
  platform: string;
  status: string;
  platform_post_id: string | null;
  platform_post_url: string | null;
  error_message: string | null;
  attempt_count: number;
  created_at: string;
  ad?: {
    id: number;
    title: string;
    slug: string;
  };
}

interface ScheduledPost {
  id: number;
  ad_id: number;
  scheduled_time: string;
  status: string;
  platform_statuses: Record<string, string>;
  created_at: string;
  ad?: {
    id: number;
    title: string;
    slug: string;
  };
}

interface Stats {
  total_posts: number;
  successful_posts: number;
  failed_posts: number;
  success_rate: number;
  pending_scheduled: number;
  by_platform: Array<{
    platform: string;
    total: number;
    successful: number;
    failed: number;
  }>;
}

export default function SocialPostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState({ status: 'all', platform: 'all' });
  const [retrying, setRetrying] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'create' | 'scheduled'>('create');

  // Form state
  const [selectedAds, setSelectedAds] = useState<number[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState({ 
    facebook: true, 
    instagram: true,
    x: false,
    whatsapp: false,
  });
  const [categories, setCategories] = useState<Array<{id: number; name: string}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Pagination state
  const [adsPage, setAdsPage] = useState(1);
  const [adsHasMore, setAdsHasMore] = useState(true);
  const [adsLoading, setAdsLoading] = useState(false);

  useEffect(() => {
    // Test API connection
    api.get('/test').then(res => console.log('API test:', res.data)).catch(err => console.error('API test failed:', err));
    
    fetchPosts();
    fetchStats();
    fetchScheduledPosts();
    fetchAds(1, false);
  }, [filter]);

  const fetchAds = async (page: number = 1, append: boolean = true) => {
    if (adsLoading || (!append && page === 1)) {
      if (page !== 1 && !append) return;
    }
    
    setAdsLoading(true);
    try {
      const categoryParam = selectedCategory !== 'all' ? `&category_id=${selectedCategory}` : '';
      const response = await api.get(`/admin/ads?status=active&per_page=20&page=${page}${categoryParam}`);
      const newAds = response.data.data || [];
      const total = response.data.total;
      const lastPage = response.data.last_page;
      
      if (append) {
        setAds(prev => [...prev, ...newAds]);
      } else {
        setAds(newAds);
      }
      
      setAdsPage(page);
      setAdsHasMore(page < lastPage);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string; status?: number };
      console.error('Failed to fetch ads:', error);
    } finally {
      setAdsLoading(false);
    }
  };

  const loadMoreAds = () => {
    if (adsHasMore && !adsLoading) {
      fetchAds(adsPage + 1, true);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset and refetch ads when category changes
  useEffect(() => {
    fetchAds(1, false);
  }, [selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.platform !== 'all') params.append('platform', filter.platform);
      
      console.log('Fetching posts from:', `/admin/social/posts?${params}`);
      const response = await api.get(`/admin/social/posts?${params}`);
      console.log('Posts response:', response.data);
      setPosts(response.data.data || response.data || []);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string; status?: number };
      console.error('Failed to fetch posts:', error);
      console.error('Error status:', err?.status);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledPosts = async () => {
    try {
      console.log('Fetching scheduled posts from:', '/admin/social/scheduled');
      const response = await api.get('/admin/social/scheduled');
      console.log('Scheduled posts response:', response.data);
      setScheduledPosts(response.data.data || response.data || []);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string; status?: number };
      console.error('Failed to fetch scheduled posts:', error);
      console.error('Error status:', err?.status);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from:', '/admin/social/stats');
      const response = await api.get('/admin/social/stats');
      console.log('Stats response:', response.data);
      setStats(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string; status?: number };
      console.error('Failed to fetch stats:', error);
      console.error('Error status:', err?.status);
    }
  };

  const handlePostNow = async () => {
    if (selectedAds.length === 0) {
      toast.error('Please select at least one ad');
      return;
    }

    const platforms = Object.entries(selectedPlatforms)
      .filter(([, selected]) => selected)
      .map(([platform]) => platform);

    if (platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setIsPosting(true);
    try {
      const response = await api.post('/admin/social/post-ads-batch', {
        ad_ids: selectedAds,
        platforms,
      });

      if (response.data.success) {
        toast.success(`Posted ${selectedAds.length} ad(s) to social media!`);
        setSelectedAds([]);
        fetchPosts();
        fetchStats();
        setActiveTab('posts');
      } else {
        toast.error(response.data.message || 'Failed to post');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedule = async () => {
    if (selectedAds.length === 0) {
      toast.error('Please select at least one ad');
      return;
    }

    if (!scheduledTime) {
      toast.error('Please select a date and time');
      return;
    }

    const platforms = Object.entries(selectedPlatforms)
      .filter(([, selected]) => selected)
      .map(([platform]) => platform);

    if (platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setIsPosting(true);
    try {
      const response = await api.post('/admin/social/post-ads-batch', {
        ad_ids: selectedAds,
        platforms,
        schedule_at: scheduledTime,
      });

      if (response.data.success) {
        toast.success(`Scheduled ${selectedAds.length} ad(s)!`);
        setSelectedAds([]);
        setScheduledTime('');
        fetchScheduledPosts();
        fetchStats();
        setActiveTab('scheduled');
      } else {
        toast.error(response.data.message || 'Failed to schedule');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to schedule');
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancelScheduled = async (id: number) => {
    try {
      const response = await api.post(`/admin/social/cancel/${id}`);
      if (response.data.success) {
        toast.success('Scheduled post cancelled');
        fetchScheduledPosts();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to cancel');
    }
  };

  const handleRetry = async (postId: number) => {
    setRetrying(postId);
    try {
      const response = await api.post(`/admin/social/retry/${postId}`);
      if (response.data.success) {
        toast.success('Retry initiated');
        fetchPosts();
        fetchStats();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Retry failed');
    } finally {
      setRetrying(null);
    }
  };

  const toggleAdSelection = (adId: number) => {
    setSelectedAds(prev => 
      prev.includes(adId) 
        ? prev.filter(id => id !== adId)
        : [...prev, adId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Success</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Failed</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Pending</span>;
      case 'posted':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Posted</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Posts</h1>
          <p className="text-gray-500 mt-1">Post ads to Facebook and Instagram</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchPosts();
              fetchStats();
              fetchScheduledPosts();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'create' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Post
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'scheduled' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Scheduled ({scheduledPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Post History
          </button>
        </nav>
      </div>

      {/* Create Post Tab */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Selection */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Social Platforms</h3>
                <p className="text-sm text-gray-500">Choose where to share your ads</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className={`group relative flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-500 ${
                selectedPlatforms.facebook 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/40 transform scale-[1.02]' 
                  : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg'
              }`}>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.facebook}
                  onChange={(e) => setSelectedPlatforms(prev => ({ ...prev, facebook: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  selectedPlatforms.facebook 
                    ? 'bg-green-500 opacity-100 scale-100' 
                    : 'bg-gray-200 opacity-0 scale-0'
                }`}>
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  selectedPlatforms.facebook ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-blue-100 to-blue-200'
                }`}>
                  <Facebook className={`w-8 h-8 ${selectedPlatforms.facebook ? 'text-white' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <span className={`block font-bold text-xl tracking-tight ${selectedPlatforms.facebook ? 'text-white' : 'text-gray-900'}`}>Facebook</span>
                  <span className={`text-sm ${selectedPlatforms.facebook ? 'text-blue-100' : 'text-gray-500'}`}>Share posts to your audience</span>
                </div>
                <div className={`w-7 h-7 rounded-xl border-2 transition-all duration-300 ${
                  selectedPlatforms.facebook 
                    ? 'bg-white border-white' 
                    : 'border-gray-300 group-hover:border-blue-400'
                }`}>
                  {selectedPlatforms.facebook && (
                    <Check className="w-full h-full text-blue-600 p-1" />
                  )}
                </div>
              </label>

              <label className={`group relative flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-500 ${
                selectedPlatforms.instagram 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white shadow-xl shadow-pink-600/40 transform scale-[1.02]' 
                  : 'bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:via-purple-50 hover:to-rose-50 border-2 border-gray-100 hover:border-pink-200 hover:shadow-lg'
              }`}>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.instagram}
                  onChange={(e) => setSelectedPlatforms(prev => ({ ...prev, instagram: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  selectedPlatforms.instagram 
                    ? 'bg-green-500 opacity-100 scale-100' 
                    : 'bg-gray-200 opacity-0 scale-0'
                }`}>
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  selectedPlatforms.instagram ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-pink-100 to-purple-100'
                }`}>
                  <Instagram className={`w-8 h-8 ${selectedPlatforms.instagram ? 'text-white' : 'text-pink-600'}`} />
                </div>
                <div className="flex-1">
                  <span className={`block font-bold text-xl tracking-tight ${selectedPlatforms.instagram ? 'text-white' : 'text-gray-900'}`}>Instagram</span>
                  <span className={`text-sm ${selectedPlatforms.instagram ? 'text-pink-100' : 'text-gray-500'}`}>Post to your Instagram feed</span>
                </div>
                <div className={`w-7 h-7 rounded-xl border-2 transition-all duration-300 ${
                  selectedPlatforms.instagram 
                    ? 'bg-white border-white' 
                    : 'border-gray-300 group-hover:border-pink-400'
                }`}>
                  {selectedPlatforms.instagram && (
                    <Check className="w-full h-full text-pink-600 p-1" />
                  )}
                </div>
              </label>

              <label className={`group relative flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-500 ${
                selectedPlatforms.x 
                  ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white shadow-xl shadow-gray-800/40 transform scale-[1.02]' 
                  : 'bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-2 border-gray-100 hover:border-gray-300 hover:shadow-lg'
              }`}>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.x}
                  onChange={(e) => setSelectedPlatforms(prev => ({ ...prev, x: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  selectedPlatforms.x 
                    ? 'bg-green-500 opacity-100 scale-100' 
                    : 'bg-gray-200 opacity-0 scale-0'
                }`}>
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  selectedPlatforms.x ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}>
                  <svg className={`w-8 h-8 ${selectedPlatforms.x ? 'text-white' : 'text-gray-900'}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className={`block font-bold text-xl tracking-tight ${selectedPlatforms.x ? 'text-white' : 'text-gray-900'}`}>Twitter / X</span>
                  <span className={`text-sm ${selectedPlatforms.x ? 'text-gray-300' : 'text-gray-500'}`}>Tweet to your followers</span>
                </div>
                <div className={`w-7 h-7 rounded-xl border-2 transition-all duration-300 ${
                  selectedPlatforms.x 
                    ? 'bg-white border-white' 
                    : 'border-gray-300 group-hover:border-gray-500'
                }`}>
                  {selectedPlatforms.x && (
                    <Check className="w-full h-full text-gray-900 p-1" />
                  )}
                </div>
              </label>

              <label className={`group relative flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-500 ${
                selectedPlatforms.whatsapp 
                  ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-xl shadow-green-600/40 transform scale-[1.02]' 
                  : 'bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border-2 border-gray-100 hover:border-green-200 hover:shadow-lg'
              }`}>
                <input
                  type="checkbox"
                  checked={selectedPlatforms.whatsapp}
                  onChange={(e) => setSelectedPlatforms(prev => ({ ...prev, whatsapp: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  selectedPlatforms.whatsapp 
                    ? 'bg-white opacity-100 scale-100' 
                    : 'bg-gray-200 opacity-0 scale-0'
                }`}>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  selectedPlatforms.whatsapp ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-green-100 to-emerald-100'
                }`}>
                  <svg className={`w-8 h-8 ${selectedPlatforms.whatsapp ? 'text-white' : 'text-green-600'}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className={`block font-bold text-xl tracking-tight ${selectedPlatforms.whatsapp ? 'text-white' : 'text-gray-900'}`}>WhatsApp</span>
                  <span className={`text-sm ${selectedPlatforms.whatsapp ? 'text-green-100' : 'text-gray-500'}`}>Share via WhatsApp status</span>
                </div>
                <div className={`w-7 h-7 rounded-xl border-2 transition-all duration-300 ${
                  selectedPlatforms.whatsapp 
                    ? 'bg-white border-white' 
                    : 'border-gray-300 group-hover:border-green-400'
                }`}>
                  {selectedPlatforms.whatsapp && (
                    <Check className="w-full h-full text-green-600 p-1" />
                  )}
                </div>
              </label>
            </div>

            {/* Schedule Option */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className={`group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-500 ${
                scheduledTime 
                  ? 'bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 shadow-lg' 
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-sky-50 border-2 border-transparent hover:border-sky-100'
              }`}>
                <input
                  type="checkbox"
                  checked={!!scheduledTime}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const now = new Date();
                      now.setHours(now.getHours() + 1);
                      setScheduledTime(now.toISOString().slice(0, 16));
                    } else {
                      setScheduledTime('');
                    }
                  }}
                  className="sr-only"
                />
                <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  scheduledTime 
                    ? 'bg-sky-500 opacity-100 scale-100' 
                    : 'bg-gray-200 opacity-0 scale-0'
                }`}>
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  scheduledTime ? 'bg-sky-100' : 'bg-gray-100 group-hover:bg-sky-50'
                }`}>
                  <Calendar className={`w-6 h-6 ${scheduledTime ? 'text-sky-600' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <span className={`block font-bold ${scheduledTime ? 'text-sky-700' : 'text-gray-700'}`}>Schedule for Later</span>
                  <span className="text-sm text-gray-500">Auto-post at a specific time</span>
                </div>
                <div className={`w-7 h-7 rounded-xl border-2 transition-all duration-300 ${
                  scheduledTime 
                    ? 'bg-sky-500 border-sky-500' 
                    : 'border-gray-300 group-hover:border-sky-400'
                }`}>
                  {scheduledTime && (
                    <Check className="w-full h-full text-white p-1" />
                  )}
                </div>
              </label>
              
              {scheduledTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handlePostNow}
                disabled={isPosting || selectedAds.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post Now
              </button>
              {scheduledTime && (
                <button
                  onClick={handleSchedule}
                  disabled={isPosting || selectedAds.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Schedule
                </button>
              )}
            </div>
          </div>

          {/* Ad Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategory(val === 'all' ? 'all' : Number(val));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{selectedAds.length} ads selected</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAds(ads.map(a => a.id))}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSelectedAds([])}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Ads List with Infinite Scroll */}
            <div 
              className="max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
                if (isNearBottom && adsHasMore && !adsLoading) {
                  loadMoreAds();
                }
              }}
            >
              {ads.length === 0 && !adsLoading ? (
                <div className="p-8 text-center text-gray-500">
                  {selectedCategory === 'all' ? 'No active ads available' : 'No ads in this category'}
                </div>
              ) : (
                <>
                  {ads.map(ad => (
                    <label
                      key={ad.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedAds.includes(ad.id) ? 'bg-sky-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAds.includes(ad.id)}
                        onChange={() => toggleAdSelection(ad.id)}
                        className="rounded text-sky-600"
                      />
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {(() => {
                          const firstImg = ad.images?.[0];
                          const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
                          return imgUrl ? (
                            <img src={imgUrl} alt={ad.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{ad.title}</p>
                        {ad.price && <p className="text-sm text-gray-500">₦{Number(ad.price).toLocaleString('en-US')}</p>}
                      </div>
                    </label>
                  ))}
                  {adsLoading && (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </div>
                  )}
                  {!adsHasMore && ads.length > 0 && (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      All ads loaded
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Posts Tab */}
      {activeTab === 'scheduled' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platforms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scheduledPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No scheduled posts</td>
                </tr>
              ) : (
                scheduledPosts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {post.ad ? (
                        <a href={`/ad/${post.ad.slug}`} target="_blank" className="text-primary-600 hover:underline">
                          {post.ad.title}
                        </a>
                      ) : (
                        <span className="text-gray-500">Ad #{post.ad_id}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(post.scheduled_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {post.platform_statuses && Object.keys(post.platform_statuses).map(platform => (
                          <span key={platform} className="flex items-center gap-1">
                            {platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
                            {platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                            {platform === 'x' && <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg><span className="text-xs">Twitter</span></>}
                            {platform === 'whatsapp' && <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span className="text-xs">WhatsApp</span></>}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4">
                      {post.status === 'pending' && (
                        <button
                          onClick={() => handleCancelScheduled(post.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Cancel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Post History Tab */}
      {activeTab === 'posts' && (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_posts}</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful_posts}</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed_posts}</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.success_rate}%</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filter.platform}
              onChange={(e) => setFilter(prev => ({ ...prev, platform: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="x">X (Twitter)</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          {/* Posts Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-6 w-8 bg-gray-200 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-8 w-16 bg-gray-200 rounded"></div></td>
                      </tr>
                    ))}
                  </>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No posts found</td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {post.platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                          {post.platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-600" />}
                          {post.platform === 'x' && <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg><span className="font-medium">Twitter</span></>}
                          {post.platform === 'whatsapp' && <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span className="font-medium">WhatsApp</span></>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {post.ad ? (
                          <a href={`/ad/${post.ad.slug}`} target="_blank" className="text-primary-600 hover:underline">
                            {post.ad.title}
                          </a>
                        ) : (
                          <span className="text-gray-500">Ad #{post.ad_id}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                      <td className="px-6 py-4 text-gray-500">{post.attempt_count}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{new Date(post.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {post.platform_post_url && (
                            <a href={post.platform_post_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {post.status === 'failed' && (
                            <button onClick={() => handleRetry(post.id)} disabled={retrying === post.id} className="text-blue-600 hover:text-blue-700" title="Retry">
                              {retrying === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
