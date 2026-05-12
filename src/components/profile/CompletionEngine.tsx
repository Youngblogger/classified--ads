'use client';

import { useMemo } from 'react';
import { CheckCircle, AlertCircle, Award, Camera, MapPin, Smartphone, Mail, Phone, User as UserIcon, Star, Upload, Shield } from 'lucide-react';
import type { User } from '@/types';

interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
  pct: number;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  reward?: string;
}

const TIERS = [
  { threshold: 100, label: 'Complete', icon: Award, color: 'text-green-600', bg: 'bg-green-100' },
  { threshold: 75, label: 'Advanced', icon: Star, color: 'text-blue-600', bg: 'bg-blue-100' },
  { threshold: 50, label: 'Intermediate', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
  { threshold: 0, label: 'Beginner', icon: UserIcon, color: 'text-gray-600', bg: 'bg-gray-100' },
];

interface CompletionEngineProps {
  user: User | null;
}

export default function CompletionEngine({ user }: CompletionEngineProps) {
  const { pct, missing, done, tier } = useMemo(() => {
    const items: CompletionItem[] = [
      { key: 'name', label: 'Full name', done: !!(user?.name && user.name.length > 2), pct: 15, icon: UserIcon, action: 'Add your full name in Profile Info', reward: '15% trust boost' },
      { key: 'email', label: 'Email verified', done: !!(user?.email_verified_at || user?.verified), pct: 20, icon: Mail, action: 'Verify your email address', reward: '20% completion + badge' },
      { key: 'phone', label: 'Phone number', done: !!user?.phone, pct: 15, icon: Phone, action: 'Add phone number in Profile Info', reward: '15% + SMS alerts' },
      { key: 'avatar', label: 'Profile photo', done: !!(user?.avatar || user?.avatar_url || user?.full_avatar_url), pct: 15, icon: Camera, action: 'Upload profile photo in Photo tab', reward: '15% + higher trust' },
      { key: 'location', label: 'Location set', done: !!user?.location, pct: 10, icon: MapPin, action: 'Set your location in Profile Info', reward: '10% + local visibility' },
      { key: 'bio', label: 'Bio / About', done: !!(user as any)?.bio && (user as any).bio.length > 10, pct: 10, icon: Star, action: 'Write a short bio', reward: '10% + seller credibility' },
      { key: 'phone_verify', label: 'Phone verified', done: !!user?.phone_verified_at, pct: 15, icon: Smartphone, action: 'Verify phone number in Security', reward: '15% + extra security' },
    ];
    const doneItems = items.filter(i => i.done);
    const missingItems = items.filter(i => !i.done);
    const pct = items.reduce((s, i) => s + (i.done ? i.pct : 0), 0);
    const tier = TIERS.find(t => pct >= t.threshold) || TIERS[TIERS.length - 1];
    return { pct, missing: missingItems, done: doneItems, tier };
  }, [user]);

  const TierIcon = tier.icon;

  const nextAction = missing[0];

  return (
    <div className="bg-white rounded-2xl shadow-card p-6" role="region" aria-label="Profile completion">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${tier.bg}`}>
            <TierIcon className={`w-5 h-5 ${tier.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Profile Completion</h3>
            <p className={`text-xs font-medium ${tier.color}`}>{tier.label} Tier</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary-600">{pct}%</span>
        </div>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Profile ${pct}% complete`}>
        <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>

      {missing.length > 0 && nextAction && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Next suggested action</p>
              <p className="text-sm text-amber-700 mt-0.5">{nextAction.action}</p>
              {nextAction.reward && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Reward: {nextAction.reward}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Complete these to unlock benefits</p>
          {missing.map((item) => (
            <div key={item.key} className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              <span className="text-xs text-amber-600 font-medium">+{item.pct}%</span>
            </div>
          ))}
        </div>
      )}

      {missing.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-800">Profile complete!</p>
          <p className="text-xs text-green-600 mt-1">You&apos;ve unlocked maximum trust benefits</p>
        </div>
      )}
    </div>
  );
}
