'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Loader2, CheckCircle, AlertCircle, ArrowRight, Clock, RotateCcw, Timer } from 'lucide-react';
import { getAuthToken } from '@/lib/cookies';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface BoostAdModalProps {
  adId: number;
  adTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

type BoostType = 'top' | 'featured' | 'highlight';

const BOOST_TYPES: { value: BoostType; label: string; description: string; icon: string }[] = [
  { value: 'top', label: 'Top Ad', description: 'Appear at the top of search results', icon: '🔝' },
  { value: 'featured', label: 'Featured', description: 'Highlighted with a special badge', icon: '⭐' },
  { value: 'highlight', label: 'Highlight', description: 'Stand out with a colored border', icon: '✨' },
];

const DURATIONS = [1, 3, 7, 14, 30];

const DURATION_LABELS: Record<number, string> = {
  1: '1 day',
  3: '3 days',
  7: '7 days',
  14: '14 days',
  30: '30 days',
};

type BoostStatus = 'none' | 'active' | 'expired' | 'checking';

interface RenewalInfo {
  boost_status: 'active' | 'expired';
  current_end_time: string | null;
  days_remaining: number | null;
  will_extend_to: string | null;
  will_start_from: string | null;
}

export default function BoostAdModal({ adId, adTitle, isOpen, onClose }: BoostAdModalProps) {
  const [boostType, setBoostType] = useState<BoostType>('top');
  const [duration, setDuration] = useState(7);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPrices, setFetchingPrices] = useState(false);
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [boostStatus, setBoostStatus] = useState<BoostStatus>('checking');
  const [renewalInfo, setRenewalInfo] = useState<RenewalInfo | null>(null);
  const [isRenewal, setIsRenewal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setBoostType('top');
      setDuration(7);
      setPrice(null);
      setBoostStatus('checking');
      setRenewalInfo(null);
      setIsRenewal(false);
      fetchPrices();
      fetchBoostStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      calculatePrice();
    }
  }, [boostType, duration, prices]);

  const fetchPrices = async () => {
    try {
      setFetchingPrices(true);
      const response = await fetch(`${API_URL}/ads/boost-prices`);
      const data = await response.json();
      if (data.data?.prices) {
        setPrices(data.data.prices);
        setPrice(data.data.prices.top * 7);
      }
    } catch {
      setPrices({ top: 5, featured: 10, highlight: 3 });
      setPrice(5 * 7);
    } finally {
      setFetchingPrices(false);
    }
  };

  const fetchBoostStatus = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setBoostStatus('none');
        return;
      }
      const response = await fetch(`${API_URL}/ads/${adId}/boost-status`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const statusData = data.data;
        if (statusData?.has_active_boost && statusData?.active_boost) {
          setBoostStatus('active');
          setBoostType(statusData.active_boost.boost_type);
          setRenewalInfo(statusData.renewal_info);
        } else if (statusData?.expired_boost && statusData?.can_renew) {
          setBoostStatus('expired');
          setBoostType(statusData.expired_boost.boost_type);
          setRenewalInfo(statusData.renewal_info);
        } else {
          setBoostStatus('none');
        }
      } else {
        setBoostStatus('none');
      }
    } catch {
      setBoostStatus('none');
    }
  };

  const calculatePrice = () => {
    const basePrice = prices[boostType] || 5;
    const multiplier = duration >= 30 ? 0.7 : duration >= 14 ? 0.8 : duration >= 7 ? 0.85 : duration >= 3 ? 0.9 : 1.0;
    setPrice(Math.round(basePrice * duration * multiplier * 100) / 100);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBoost = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to boost your ad');
      return;
    }

    setStep('processing');
    setLoading(true);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const endpoint = isRenewal ? `${API_URL}/ads/${adId}/boost-renew` : `${API_URL}/ads/${adId}/boost`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({
          boost_type: boostType,
          duration_days: duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate boost');
      }

      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error: any) {
      console.error('Boost error:', error);
      toast.error(error.message || 'Failed to process boost');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (days: number | null): string => {
    if (days === null) return 'Calculating...';
    if (days < 1) return 'Less than a day';
    if (days === 1) return '1 day remaining';
    return `${Math.floor(days)} days remaining`;
  };

  const canRenew = boostStatus === 'active' || boostStatus === 'expired';

  if (!isOpen) return null;

  const boostTypeData = BOOST_TYPES.find(b => b.value === boostType)!;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center z-[99999] p-0 sm:p-4 pt-[10vh] sm:pt-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">
              {isRenewal ? 'Renew Boost' : 'Boost Your Ad'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {step === 'select' && (
          <>
            {/* Content - Scrollable */}
            <div className="px-5 py-4 overflow-y-auto flex-1 min-h-0">
              {/* Ad Title */}
              <p className="text-sm text-gray-600 mb-4 truncate">
                Boosting: <span className="font-semibold text-gray-900">{adTitle}</span>
              </p>

              {boostStatus === 'checking' ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                </div>
              ) : (
                <>
                  {/* Current Boost Status Banner */}
                  {boostStatus === 'active' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                      <div className="flex items-start gap-3">
                        <Timer className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900">Boost is active</p>
                          <p className="text-xs text-blue-700 mt-1">
                            {renewalInfo !== null && renewalInfo.days_remaining != null && formatTimeRemaining(renewalInfo.days_remaining)}
                          </p>
                          {renewalInfo?.will_extend_to && (
                            <p className="text-xs text-blue-600 mt-1">
                              Renew to extend until {new Date(renewalInfo.will_extend_to).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {boostStatus === 'expired' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Boost has expired</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Renew to reactivate your boost
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {fetchingPrices ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                    </div>
                  ) : (
                    <>
                      {/* Boost Type Selection */}
                      <div className="mb-5">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          {canRenew ? 'Select boost type (pre-filled)' : 'Select boost type'}
                        </p>
                        <div className="space-y-2">
                          {BOOST_TYPES.map((type) => (
                            <button
                              key={type.value}
                              onClick={() => setBoostType(type.value)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                                boostType === type.value
                                  ? 'border-sky-500 bg-sky-50 text-sky-700'
                                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <span className="text-xl">{type.icon}</span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold">{type.label}</p>
                                <p className="text-xs text-gray-500">{type.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">₦{prices[type.value]?.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">/day</p>
                              </div>
                              {boostType === type.value && (
                                <CheckCircle className="w-5 h-5 text-sky-500 flex-shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Duration Selection */}
                      <div className="mb-5">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Select duration</p>
                        <div className="flex flex-wrap gap-2">
                          {DURATIONS.map((d) => {
                            const discount = d >= 30 ? '30% off' : d >= 14 ? '20% off' : d >= 7 ? '15% off' : d >= 3 ? '10% off' : null;
                            return (
                              <button
                                key={d}
                                onClick={() => setDuration(d)}
                                className={`flex flex-col items-center px-4 py-2.5 rounded-xl border-2 transition-all duration-200 min-w-[80px] ${
                                  duration === d
                                    ? 'border-sky-500 bg-sky-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <span className={`text-sm font-semibold ${duration === d ? 'text-sky-700' : 'text-gray-700'}`}>
                                  {d}d
                                </span>
                                {discount && (
                                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-0.5">
                                    {discount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Price Summary */}
                      {price !== null && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">{boostTypeData.label}</span>
                            <span className="text-sm font-medium">₦{prices[boostType]?.toFixed(2)}/day</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Duration</span>
                            <span className="text-sm font-medium">{DURATION_LABELS[duration]}</span>
                          </div>
                          {canRenew && (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">
                                  {boostStatus === 'active' ? 'Extends by' : 'New duration'}
                                </span>
                                <span className="text-sm font-medium">+{DURATION_LABELS[duration]}</span>
                              </div>
                            </>
                          )}
                          <hr className="border-gray-200 my-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-gray-900">Total</span>
                            <span className="text-xl font-bold text-sky-600">₦{price.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-white">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              {boostStatus !== 'checking' && (
                <button
                  onClick={() => {
                    setIsRenewal(canRenew);
                    handleBoost();
                  }}
                  disabled={fetchingPrices || price === null}
                  className={`flex-1 px-5 py-3 text-white rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    canRenew
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                      : 'bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800'
                  }`}
                >
                  {canRenew ? <RotateCcw className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  <span>
                    {canRenew ? 'Renew ₦' : 'Pay ₦'}{price?.toFixed(2)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 px-5">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isRenewal ? 'Processing your renewal' : 'Processing your boost'}
            </h3>
            <p className="text-sm text-gray-500 text-center">Redirecting to secure payment...</p>
          </div>
        )}
      </div>
    </div>
  );
}
