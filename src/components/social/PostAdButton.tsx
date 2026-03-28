'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Send, Calendar, Facebook, Instagram, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Ad {
  id: number;
  title: string;
  slug: string;
  price?: number;
  description?: string;
  images?: Array<{ url: string; is_primary: boolean }>;
  location?: { name: string };
}

interface PostAdButtonProps {
  ad: Ad;
  onSuccess?: () => void;
  variant?: 'button' | 'card';
}

interface PlatformStatus {
  facebook?: 'pending' | 'success' | 'failed' | 'skipped';
  instagram?: 'pending' | 'success' | 'failed' | 'skipped';
}

export default function PostAdButton({ ad, onSuccess, variant = 'button' }: PostAdButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [platforms, setPlatforms] = useState<{ facebook: boolean; instagram: boolean }>({
    facebook: true,
    instagram: true,
  });
  const [lastResult, setLastResult] = useState<PlatformStatus | null>(null);

  const primaryImage = ad.images?.find(img => img.is_primary) || ad.images?.[0];

  const handlePost = async (scheduleAt?: string) => {
    setLoading(true);
    setLastResult(null);

    const selectedPlatforms = Object.entries(platforms)
      .filter(([, selected]) => selected)
      .map(([platform]) => platform);

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        ad_id: ad.id,
        platforms: selectedPlatforms,
      };

      if (scheduleAt) {
        payload.schedule_at = scheduleAt;
      }

      const response = await api.post('/social/post-ad', payload);
      
      if (response.data.success) {
        if (scheduleAt) {
          toast.success('Post scheduled successfully!');
        } else {
          toast.success('Posted to social media!');
        }
        
        if (response.data.results) {
          setLastResult(response.data.results);
        }
        
        onSuccess?.();
      } else {
        toast.error(response.data.message || 'Failed to post');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to post to social media');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (platform: string) => {
    if (!lastResult?.[platform as keyof PlatformStatus]) return;
    
    setLoading(true);
    try {
      const response = await api.post(`/social/retry/${ad.id}`, { platform });
      if (response.data.success) {
        toast.success(`${platform} post retry initiated`);
        handlePost();
      }
    } catch (error) {
      toast.error('Retry failed');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'facebook') return <Facebook className="w-4 h-4" />;
    if (platform === 'instagram') return <Instagram className="w-4 h-4" />;
    return null;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'skipped':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  // Card variant - shows full ad preview
  if (variant === 'card') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Ad Preview */}
        <div className="aspect-video bg-gray-100 relative">
          {primaryImage?.url ? (
            <img 
              src={primaryImage.url} 
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{ad.title}</h3>
          {ad.price && (
            <p className="text-primary-600 font-bold mt-1">
              ₦{ad.price.toLocaleString()}
            </p>
          )}
          {ad.location && (
            <p className="text-sm text-gray-500 mt-1">{ad.location.name}</p>
          )}
        </div>

        {/* Platform Selection */}
        <div className="px-4 pb-2">
          <label className="text-sm text-gray-600 mb-2 block">Platforms</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={platforms.facebook}
                onChange={(e) => setPlatforms(prev => ({ ...prev, facebook: e.target.checked }))}
                className="rounded text-blue-600"
              />
              <Facebook className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Facebook</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={platforms.instagram}
                onChange={(e) => setPlatforms(prev => ({ ...prev, instagram: e.target.checked }))}
                className="rounded text-pink-600"
              />
              <Instagram className="w-4 h-4 text-pink-600" />
              <span className="text-sm">Instagram</span>
            </label>
          </div>
        </div>

        {/* Schedule Toggle */}
        <div className="px-4 pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showScheduler}
              onChange={(e) => setShowScheduler(e.target.checked)}
              className="rounded text-primary-600"
            />
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Schedule for later</span>
          </label>
          
          {showScheduler && (
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          )}
        </div>

        {/* Post Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => handlePost(showScheduler ? scheduledTime : undefined)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{showScheduler ? 'Schedule Post' : 'Post Now'}</span>
          </button>
        </div>

        {/* Results */}
        {lastResult && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Post Status:</p>
            <div className="space-y-2">
              {Object.entries(lastResult).map(([platform, status]) => (
                <div key={platform} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(platform)}
                    <span className="capitalize">{platform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="capitalize text-gray-500">{status}</span>
                    {status === 'failed' && (
                      <button
                        onClick={() => handleRetry(platform)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Button variant
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handlePost()}
        disabled={loading}
        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        <span>Post to Social</span>
      </button>
    </div>
  );
}
