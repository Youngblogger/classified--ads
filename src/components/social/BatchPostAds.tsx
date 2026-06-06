'use client';

import { useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Facebook, Instagram } from '@/lib/social-icons';
import { Loader2, Send, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Ad {
  id: number;
  title: string;
  slug: string;
  price?: number;
  status: string;
  images?: Array<{ url: string; is_primary: boolean }>;
}

interface BatchPostAdsProps {
  ads: Ad[];
  onSuccess?: () => void;
}

interface PostResult {
  [adId: number]: {
    success: boolean;
    results?: {
      [platform: string]: {
        status: 'success' | 'failed' | 'pending' | 'skipped';
        post_url?: string;
        error?: string;
      };
    };
    error?: string;
  };
}

export default function BatchPostAds({ ads, onSuccess }: BatchPostAdsProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAds, setSelectedAds] = useState<number[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [platforms, setPlatforms] = useState<{ facebook: boolean; instagram: boolean }>({
    facebook: true,
    instagram: true,
  });
  const [results, setResults] = useState<PostResult | null>(null);

  const activeAds = ads.filter(ad => ad.status === 'active');

  const toggleAd = (adId: number) => {
    setSelectedAds(prev => 
      prev.includes(adId) 
        ? prev.filter(id => id !== adId)
        : [...prev, adId]
    );
  };

  const toggleAll = () => {
    if (selectedAds.length === activeAds.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(activeAds.map(ad => ad.id));
    }
  };

  const handleBatchPost = async () => {
    if (selectedAds.length === 0) {
      toast.error('Please select at least one ad');
      return;
    }

    setLoading(true);
    setResults(null);

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
        ad_ids: selectedAds,
        platforms: selectedPlatforms,
      };

      if (showScheduler && scheduledTime) {
        payload.schedule_at = scheduledTime;
      }

      const response = await api.post('/social/post-ads-batch', payload);
      
      if (response.data.success) {
        if (showScheduler) {
          toast.success(`${selectedAds.length} ads scheduled successfully!`);
        } else {
          toast.success(`Batch posting initiated for ${selectedAds.length} ads`);
        }
        
        if (response.data.results) {
          setResults(response.data.results);
        }
        
        onSuccess?.();
      } else {
        toast.error(response.data.message || 'Failed to batch post');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to batch post');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" /> Success</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="w-3 h-3" /> Failed</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 text-yellow-600"><Loader2 className="w-3 h-3 animate-spin" /> Pending</span>;
      case 'skipped':
        return <span className="inline-flex items-center gap-1 text-gray-500"><AlertCircle className="w-3 h-3" /> Skipped</span>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Batch Post to Social Media</h3>
        <p className="text-sm text-gray-500 mt-1">
          Select ads to post to Facebook and Instagram
        </p>
      </div>

      {/* Platform Selection */}
      <div className="p-4 border-b border-gray-100">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Platforms</label>
        <div className="flex gap-4">
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
      <div className="p-4 border-b border-gray-100">
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

      {/* Ad Selection */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Select Ads ({selectedAds.length} of {activeAds.length} selected)
          </label>
          <button
            onClick={toggleAll}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {selectedAds.length === activeAds.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
          {activeAds.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No active ads available
            </div>
          ) : (
            activeAds.map(ad => (
              <label
                key={ad.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
              >
                <input
                  type="checkbox"
                  checked={selectedAds.includes(ad.id)}
                  onChange={() => toggleAd(ad.id)}
                  className="rounded text-primary-600"
                />
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                  {(() => {
                    const firstImg = ad.images?.[0];
                    const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
                    return imgUrl && (
                      <Image 
                        src={imgUrl} 
                        alt={ad.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                  {ad.price && (
                    <p className="text-xs text-gray-500">₦{ad.price.toLocaleString()}</p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Results:</p>
          <div className="space-y-2">
            {Object.entries(results).map(([adId, result]) => (
              <div key={adId} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <span className="truncate">Ad #{adId}</span>
                <div className="flex items-center gap-2">
                  {result.results && Object.entries(result.results).map(([platform, platformResult]) => {
                    const resultItem = platformResult as { status: 'success' | 'failed' | 'pending' | 'skipped' };
                    return (
                    <div key={platform} className="flex items-center gap-1">
                      {platform === 'facebook' && <Facebook className="w-3 h-3 text-blue-600" />}
                      {platform === 'instagram' && <Instagram className="w-3 h-3 text-pink-600" />}
                      {getStatusBadge(resultItem.status)}
                    </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Button */}
      <div className="p-4">
        <button
          onClick={handleBatchPost}
          disabled={loading || selectedAds.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>
            {showScheduler 
              ? `Schedule ${selectedAds.length} Ads` 
              : `Post ${selectedAds.length} Ads Now`}
          </span>
        </button>
      </div>
    </div>
  );
}
