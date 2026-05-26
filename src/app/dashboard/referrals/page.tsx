'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';

interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_credits_earned: number;
  tier: string;
  multiplier: number;
  tier_progress?: {
    current: number;
    next: string;
    required: number;
  };
}

interface Referral {
  id: number;
  referred_user_id: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  user?: {
    name: string;
    email: string;
    created_at: string;
  };
}

interface CreditBalance {
  balance: number;
  total_earned: number;
  total_spent: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  total_referrals: number;
  tier: string;
}

interface CreditFeature {
  id: string;
  name: string;
  description: string;
  cost: number;
}

const tierConfig: Record<string, { color: string; bg: string; icon: string; title: string }> = {
  bronze: { color: 'text-amber-700', bg: 'bg-amber-100', icon: '🥉', title: 'Bronze' },
  silver: { color: 'text-gray-600', bg: 'bg-gray-200', icon: '🥈', title: 'Silver' },
  gold: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '🥇', title: 'Gold' },
  platinum: { color: 'text-purple-600', bg: 'bg-purple-100', icon: '💎', title: 'Platinum' },
};

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [features, setFeatures] = useState<CreditFeature[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [applyingCode, setApplyingCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const timeoutId = setTimeout(() => {
      console.log('Referrals fetch timeout - forcing loading to false');
      setLoading(false);
    }, 10000);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const token = localStorage.getItem('authToken');
      
      console.log('Token exists:', !!token);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const codeRes = await fetch(`${API_URL}/referral/my-code`, { headers }).then(r => {
        console.log('Code API status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('Code API error:', e);
        return {};
      });
      
      const statsRes = await fetch(`${API_URL}/referral/stats`, { headers }).then(r => r.json()).catch(() => ({}));
      const referralsRes = await fetch(`${API_URL}/referral/my-referrals`, { headers }).then(r => r.json()).catch(() => ({ data: [] }));
      const balanceRes = await fetch(`${API_URL}/credits/balance`, { headers }).then(r => r.json()).catch(() => ({ balance: 0, total_earned: 0, total_spent: 0 }));
      const leaderboardRes = await fetch(`${API_URL}/referral/leaderboard`, { headers }).then(r => r.json()).catch(() => []);
      const featuresRes = await fetch(`${API_URL}/credits/features`, { headers }).then(r => r.json()).catch(() => ({ features: [] }));

      console.log('Code response:', codeRes);
      clearTimeout(timeoutId);

      if (codeRes.referral_code) {
        const code = codeRes.referral_code.replace('ILIST-', '');
        setReferralCode(code);
        setReferralLink(codeRes.referral_link || `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${code}`);
      } else if (!token) {
        setReferralCode('LOGIN_REQUIRED');
      } else {
        console.log('No referral code in response:', codeRes);
      }
      if (statsRes) {
        setStats(statsRes);
      }
      if (referralsRes.data) {
        setReferrals(referralsRes.data);
      }
      if (balanceRes) {
        setBalance(balanceRes);
      }
      if (Array.isArray(leaderboardRes)) {
        setLeaderboard(leaderboardRes);
      }
      if (featuresRes.features) {
        setFeatures(featuresRes.features);
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch data:', e);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy');
    }
  };

  const applyReferralCode = async () => {
    if (!codeInput.trim()) {
      alert('Please enter a referral code');
      return;
    }

    setApplyingCode(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/referral/apply`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ referral_code: codeInput }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Referral code applied successfully!');
        setCodeInput('');
        fetchData();
      } else {
        alert(data.message || 'Invalid referral code');
      }
    } catch {
      alert('Failed to apply referral code');
    } finally {
      setApplyingCode(false);
    }
  };

  const spendCredits = async (featureId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8000/api/credits/use', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ feature: featureId }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Credits used successfully!');
        fetchData();
      } else {
        alert(data.message || 'Failed to use credits');
      }
    } catch {
      alert('Failed to use credits');
    }
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-gray-200 rounded-xl h-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Referrals & Credits</h1>
          <p className="text-gray-600">Invite friends and earn credits to boost your ads</p>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your referral code and earn credits.</p>
          <button onClick={() => useUIStore.getState().toggleLoginModal()} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Referrals & Credits</h1>
        <p className="text-gray-600">Invite friends and earn credits to boost your ads</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'referrals', 'credits', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'referrals' && 'My Referrals'}
            {tab === 'credits' && 'Credits'}
            {tab === 'leaderboard' && 'Leaderboard'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-xl p-6 text-white">
            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">Invite Friends & Earn Credits</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/30">
                <p className="text-sm font-mono break-all">{referralLink || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition"
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join iList and get bonus credits! Use my referral code: ${referralCode}. Sign up here: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent('Join iList with my referral code!')}&body=${encodeURIComponent(`Join iList and get bonus credits! Use my referral code: ${referralCode}. Sign up here: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3v18h24V3H0zm21.518 2l-9.518 7.713L3.493 5.265 21.518 18zM2.475 19.118l8.608-6.762 5.472 4.345L8.006 20.5l-.008.002v.002l-.03-.005-5.493-1.379zm15.225-8.853L21.518 5.265 3.493 14.978l9.509 7.713 4.688-4.345z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <p className="text-sm text-gray-500">Total Referrals</p>
              <p className="text-2xl font-bold">{stats?.total_referrals || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{stats?.completed_referrals || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <p className="text-sm text-gray-500">Credits Earned</p>
              <p className="text-2xl font-bold">{stats?.total_credits_earned || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <p className="text-sm text-gray-500">Current Tier</p>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full mt-1 ${tierConfig[stats?.tier || 'bronze']?.bg || tierConfig.bronze.bg}`}>
                <span>{tierConfig[stats?.tier || 'bronze']?.icon || tierConfig.bronze.icon}</span>
                <span className={`font-bold capitalize ${tierConfig[stats?.tier || 'bronze']?.color || tierConfig.bronze.color}`}>
                  {tierConfig[stats?.tier || 'bronze']?.title || 'Bronze'}
                </span>
              </div>
            </div>
          </div>

          {stats?.tier_progress && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Tier Progress</h3>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{stats.tier} Tier</span>
                  <span>{stats.tier_progress.current}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${stats.tier_progress.current}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {stats.tier_progress.next === 'Max tier reached'
                  ? 'You have reached the maximum tier!'
                  : `${stats.tier_progress.required} more referrals to reach ${stats.tier_progress.next}`}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Your Referrals</h3>
          </div>
          {referrals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No referrals yet. Share your code to invite friends!</p>
            </div>
          ) : (
            <div className="divide-y">
              {referrals.map((referral) => (
                <div key={referral.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{referral.user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{referral.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        referral.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : referral.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {referral.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'credits' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="mb-2">
              <p className="text-sm opacity-90">Your Credit Balance</p>
              <p className="text-4xl font-bold">{balance?.balance || 0} Credits</p>
            </div>
            <div className="mt-4 flex gap-6 text-sm opacity-90">
              <div>
                <p className="opacity-75">Total Earned</p>
                <p className="font-semibold">{balance?.total_earned || 0}</p>
              </div>
              <div>
                <p className="opacity-75">Total Spent</p>
                <p className="font-semibold">{balance?.total_spent || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div key={feature.id} className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold mb-2">{feature.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{feature.cost}</span>
                  <button
                    onClick={() => spendCredits(feature.id)}
                    disabled={(balance?.balance || 0) < feature.cost}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Use Credits
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">🏆 Top Referrers</h3>
          </div>
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No leaderboard data yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {leaderboard.map((entry) => (
                <div key={entry.user_id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1
                          ? 'bg-yellow-100 text-yellow-700'
                          : entry.rank === 2
                          ? 'bg-gray-100 text-gray-700'
                          : entry.rank === 3
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-gray-500">{entry.total_referrals} referrals</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${tierConfig[entry.tier]?.bg || tierConfig.bronze.bg} ${tierConfig[entry.tier]?.color || tierConfig.bronze.color}`}
                  >
                    {tierConfig[entry.tier]?.title || entry.tier}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
